/**
 * MathForge — Component-level mastery bar chart
 * (layers on top of mf-account-panel-v2.js's Progress tab — modifies
 * neither that file nor mf-mastery-chart.js)
 * ─────────────────────────────────────────────────────────────────────────
 * SIT ALONGSIDE, NOT REPLACE, mf-mastery-chart.js: that file's
 * window.renderMasteryChart(container, course, section, topic) draws a
 * single topic's trend OVER TIME (a line chart) — a genuinely different
 * question from "how am I doing across this whole component right now"
 * (a bar chart, this file). Nothing here needs to delete that capability,
 * so it's left completely alone; this file only takes over what's
 * currently SHOWN by default in the Progress tab.
 *
 * REPLACING THE TAB'S UI WITHOUT MODIFYING mf-account-panel-v2.js: that
 * file's populateProgressTab() is private to its closure, re-runs every
 * time the Progress tab is clicked (rebuilding #mf-progress-topic-select
 * and #mf-progress-chart-container from scratch each time), and can't be
 * hooked or disabled from outside. Removing those elements outright would
 * make that function throw on its next run (it doesn't null-check them).
 * So instead: those two original elements are hidden (display:none) but
 * left in the DOM — mf-account-panel-v2.js keeps harmlessly repopulating
 * an invisible dropdown/container — and this file inserts its own
 * Subject + Component dropdowns and bar-chart container next to them.
 *
 * VERIFIED against the real files:
 *   - getTopicMastery() → array of { course, section, topic, scored,
 *     available, qCount }, using each question's LAST attempt only —
 *     exactly the "current mastery %" this chart shows per bar.
 *   - SYLLABUS is declared with `const` at the top level of a classic
 *     (non-module) <script src="questions.js">. That means it's NOT a
 *     property of `window` — top-level let/const bindings in a classic
 *     script don't attach to the global object — but it IS visible as a
 *     bare identifier to every script that runs after it in the same
 *     document, including this one. So this file references `SYLLABUS`
 *     directly, never `window.SYLLABUS` (which would always be undefined).
 *
 * Chart.js loading reuses the same `data-mf-chartjs` marker convention
 * mf-mastery-chart.js uses — if that file already injected (or is
 * injecting) the CDN script, this file detects the existing tag and waits
 * on its load event instead of injecting a second copy. True function
 * sharing isn't possible (that loader is private to its own closure), but
 * coordinating through the DOM avoids a duplicate download either way.
 *
 * Load after mf-account-panel-v2.js (needs its Progress tab DOM to exist).
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var CHARTJS_URL = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

  // ── Styles ────────────────────────────────────────────────────────────
  var STYLE_ID = 'mf-component-mastery-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-component-mastery-row { display: flex; gap: 12px; margin-bottom: 4px; }',
      '.mf-component-mastery-row > div { flex: 1; min-width: 0; }',
      '.mf-component-mastery-label {',
      '  display: block; font-family: var(--mf-mono, "JetBrains Mono", monospace);',
      '  font-size: 9.5px; color: var(--mf-parchment-dim, rgba(228,221,208,0.62));',
      '  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px;',
      '}',
      '.mf-bar-chart-scroll { overflow-x: auto; margin-top: 4px; }',
      '.mf-bar-chart-inner { height: 220px; }',
      '.mf-chart-empty {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-style: italic;',
      '  font-size: 12px; color: var(--mf-parchment-dim, rgba(228,221,208,0.62));',
      '  text-align: center; padding: 28px 12px;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Chart.js lazy loader (interoperates with mf-mastery-chart.js's) ───
  var chartJsPromise = null;
  function ensureChartJsLoaded() {
    if (window.Chart) return Promise.resolve();
    if (chartJsPromise) return chartJsPromise;
    chartJsPromise = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-mf-chartjs]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(); });
        existing.addEventListener('error', reject);
        return;
      }
      var script = document.createElement('script');
      script.src = CHARTJS_URL;
      script.setAttribute('data-mf-chartjs', 'true');
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Failed to load Chart.js')); };
      document.head.appendChild(script);
    });
    return chartJsPromise;
  }

  // ── Chart drawing ───────────────────────────────────────────────────────
  function getTopicsForSection(course, section) {
    if (typeof SYLLABUS === 'undefined') return [];
    var c = SYLLABUS[course];
    var s = c && c.sections && c.sections[section];
    return s ? Object.keys(s.topics) : [];
  }

  function computeMasteryMap(course, section) {
    var rows = (typeof window.getTopicMastery === 'function') ? window.getTopicMastery() : [];
    var map = {};
    rows.forEach(function (r) {
      if (r.course === course && r.section === section) map[r.topic] = r;
    });
    return map;
  }

  function drawBarChart(containerEl, labels, values, colors) {
    containerEl.innerHTML = '<div class="mf-bar-chart-scroll"><div class="mf-bar-chart-inner"><canvas></canvas></div></div>';
    var inner = containerEl.querySelector('.mf-bar-chart-inner');
    var minWidthPerBar = 70;
    inner.style.minWidth = Math.max(labels.length * minWidthPerBar, 100) + 'px';

    var canvas = containerEl.querySelector('canvas');
    var rootStyles = getComputedStyle(document.documentElement);
    var dimColor = rootStyles.getPropertyValue('--mf-parchment-dim').trim() || 'rgba(228,221,208,0.62)';
    var gridColor = 'rgba(228,221,208,0.08)';

    // eslint-disable-next-line no-new
    new window.Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderRadius: 3,
          maxBarThickness: 34
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: dimColor, font: { family: 'JetBrains Mono', size: 10 }, maxRotation: 55, minRotation: 35 },
            grid: { display: false }
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: dimColor,
              font: { family: 'JetBrains Mono', size: 10 },
              callback: function (v) { return v + '%'; }
            },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  window.renderComponentMasteryChart = function (containerElement, course, section) {
    if (!containerElement) return;
    containerElement.innerHTML = '<p class="mf-chart-empty">Loading chart\u2026</p>';

    ensureChartJsLoaded()
      .then(function () {
        var topics = getTopicsForSection(course, section);
        if (topics.length === 0) {
          containerElement.innerHTML = '<p class="mf-chart-empty">No topics found for this component.</p>';
          return;
        }

        var masteryMap = computeMasteryMap(course, section);
        var values = [];
        var colors = [];
        topics.forEach(function (t) {
          var row = masteryMap[t];
          if (row && row.available > 0) {
            values.push(Math.round((row.scored / row.available) * 1000) / 10);
            colors.push('#a8883a');
          } else {
            values.push(0);
            colors.push('rgba(228,221,208,0.15)');
          }
        });

        drawBarChart(containerElement, topics, values, colors);
      })
      .catch(function (err) {
        console.error('[mf-component-mastery-chart] failed to render', err);
        containerElement.innerHTML = '<p class="mf-chart-empty">Couldn\u2019t load the chart. Try again shortly.</p>';
      });
  };

  // ── Progress-tab dropdown UI ────────────────────────────────────────────

  function waitFor(checkFn, cb) {
    var existing = checkFn();
    if (existing) { cb(existing); return; }
    var observer = new MutationObserver(function () {
      var found = checkFn();
      if (found) { observer.disconnect(); cb(found); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function computeDefaultCourseSection() {
    var rows = (typeof window.getTopicMastery === 'function') ? window.getTopicMastery() : [];
    var totals = {}; // "course|section" -> summed qCount, used as an attempts-volume proxy
    rows.forEach(function (r) {
      var key = r.course + '|' + r.section;
      totals[key] = (totals[key] || 0) + (r.qCount || 0);
    });

    var bestKey = null;
    var bestCount = -1;
    Object.keys(totals).forEach(function (k) {
      if (totals[k] > bestCount) { bestCount = totals[k]; bestKey = k; }
    });

    if (bestKey) {
      var parts = bestKey.split('|');
      return { course: parts[0], section: parts[1] };
    }

    if (typeof SYLLABUS === 'undefined') return null;
    var courseCodes = Object.keys(SYLLABUS).sort();
    if (!courseCodes.length) return null;
    var course = courseCodes[0];
    var sectionCodes = Object.keys(SYLLABUS[course].sections).sort();
    return sectionCodes.length ? { course: course, section: sectionCodes[0] } : null;
  }

  function populateSubjectSelect(selectEl) {
    if (typeof SYLLABUS === 'undefined') return;
    selectEl.innerHTML = Object.keys(SYLLABUS).map(function (c) {
      return '<option value="' + c + '">' + c + ' \u2014 ' + SYLLABUS[c].name + '</option>';
    }).join('');
  }

  function populateComponentSelect(selectEl, course) {
    if (typeof SYLLABUS === 'undefined' || !SYLLABUS[course]) { selectEl.innerHTML = ''; return; }
    var sections = SYLLABUS[course].sections;
    selectEl.innerHTML = Object.keys(sections).map(function (s) {
      return '<option value="' + s + '">' + s + ' \u2014 ' + sections[s].name + '</option>';
    }).join('');
  }

  waitFor(
    function () { return document.querySelector('.mf-manage-panel[data-panel="progress"]'); },
    function (progressPanel) {
      var subjectSelect = null;
      var componentSelect = null;
      var chartContainer = null;

      function renderCurrentSelection() {
        if (!subjectSelect || !componentSelect || !chartContainer) return;
        window.renderComponentMasteryChart(chartContainer, subjectSelect.value, componentSelect.value);
      }

      function buildUI() {
        var oldSelect = progressPanel.querySelector('#mf-progress-topic-select');
        var oldContainer = progressPanel.querySelector('#mf-progress-chart-container');
        if (oldSelect) oldSelect.style.display = 'none';
        if (oldContainer) oldContainer.style.display = 'none';

        var wrap = document.createElement('div');
        wrap.className = 'mf-component-mastery-wrap';
        wrap.innerHTML =
          '<div class="mf-component-mastery-row">' +
            '<div>' +
              '<label class="mf-component-mastery-label" for="mf-cm-subject-select">Subject</label>' +
              '<select class="mf-progress-select" id="mf-cm-subject-select"></select>' +
            '</div>' +
            '<div>' +
              '<label class="mf-component-mastery-label" for="mf-cm-component-select">Component</label>' +
              '<select class="mf-progress-select" id="mf-cm-component-select"></select>' +
            '</div>' +
          '</div>' +
          '<div class="mf-progress-chart-container" id="mf-cm-chart-container"></div>';

        (oldContainer || oldSelect || progressPanel).insertAdjacentElement('afterend', wrap);

        subjectSelect = wrap.querySelector('#mf-cm-subject-select');
        componentSelect = wrap.querySelector('#mf-cm-component-select');
        chartContainer = wrap.querySelector('#mf-cm-chart-container');

        populateSubjectSelect(subjectSelect);

        var def = computeDefaultCourseSection();
        if (def) {
          subjectSelect.value = def.course;
          populateComponentSelect(componentSelect, def.course);
          componentSelect.value = def.section;
        } else {
          populateComponentSelect(componentSelect, subjectSelect.value);
        }

        subjectSelect.addEventListener('change', function () {
          populateComponentSelect(componentSelect, subjectSelect.value);
          componentSelect.selectedIndex = 0;
          renderCurrentSelection();
        });
        componentSelect.addEventListener('change', renderCurrentSelection);

        renderCurrentSelection();
      }

      // Default selection is computed once, the first time the Progress tab
      // is opened. Re-opening the tab later just re-renders whatever the
      // dropdowns are currently set to (picking up fresh attempt data)
      // rather than silently resetting a selection the user already made.
      var observer = new MutationObserver(function () {
        if (!progressPanel.classList.contains('mf-active')) return;
        if (!subjectSelect) {
          buildUI();
        } else {
          renderCurrentSelection();
        }
      });
      observer.observe(progressPanel, { attributes: true, attributeFilter: ['class'] });

      if (progressPanel.classList.contains('mf-active')) buildUI();
    }
  );
})();
