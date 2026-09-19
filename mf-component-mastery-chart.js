/**
 * MathForge — Component-level completion scatter chart
 * (layers on top of mf-account-panel-v2.js's Progress tab — modifies
 * neither that file nor mf-mastery-chart.js)
 * ─────────────────────────────────────────────────────────────────────────
 * REVISION NOTE (read before changing this again): this replaces the
 * previous bar chart's ACCURACY metric with a COMPLETION metric, and the
 * bar chart itself with an animated scatter plot. Two corrections against
 * what was assumed going in:
 *
 *   1. The old metric was NOT spaced-repetition-derived (no ease/interval
 *      involved anywhere in this file). It was getTopicMastery()'s
 *      scored/available — i.e. accuracy on each question's LAST attempt.
 *      This revision drops that function entirely in favor of counting
 *      distinct attempted questions directly from progress.questions,
 *      per the new spec.
 *
 *   2. Two patterns the build spec asked to match — a `.filter-row`
 *      class and a `card-slide-in`/staggered-delay keyframe — do not
 *      exist anywhere in index__5_.html or questions.js (checked both
 *      files directly). The closest real analog is the `probIn` keyframe
 *      used for question cards: fade + translateY(6px)→0. This file's
 *      per-point stagger mirrors that timing/feel instead of a pattern
 *      that isn't actually in the codebase.
 *
 * METRIC — completion, not accuracy:
 *   percentage = (distinct questions in the topic ever attempted)
 *              / (total questions that exist for the topic) × 100
 *   "Total" comes straight from SYLLABUS: SYLLABUS[course].sections
 *   [section].topics[topicName] is itself the array of question objects
 *   (confirmed in questions.js — e.g. "Coordinate Geometry": [ {id:...},
 *   ... ]), so its .length is the total with no separate counting pass
 *   needed. "Attempted" comes from progress.questions[qid].attempts.length
 *   > 0 — NOT mere presence of progress.questions[qid], because
 *   toggleFlag() (index.html) also creates that record on a flag with an
 *   empty attempts array, which would otherwise overcount.
 *
 * CHART TYPE — why a line dataset, not Chart.js's "scatter" type: native
 * `type: 'scatter'` expects a numeric x-axis. Topics are categorical, so
 * this uses `type: 'line'` with `showLine: false` on a category x-scale —
 * the standard Chart.js technique for "points on a category axis" — which
 * renders identically to a scatter plot.
 *
 * ANIMATION — Chart.js has no first-class per-point opacity animation, so
 * "fade + rise" is approximated with two animatable properties instead:
 * radius growing from 0 (a materializing effect, standing in for fade)
 * and y rising from the 0% baseline, both staggered per topic via the
 * `delay` callback. Reads the same as fade+rise without fighting the
 * library for something it doesn't expose.
 *
 * LAYOUT — the reported cutoff (topics past a point, and the Component
 * dropdown itself, running off the right edge) is addressed two ways:
 * the dropdown row now wraps instead of forcing two selects to fit one
 * line on narrow viewports, and the chart's own horizontal-scroll region
 * gets a visible (thin, gold-tinted) scrollbar rather than a hidden one —
 * on a chart specifically, a hidden scrollbar hides the very affordance
 * that tells you there's more to scroll to. Built from the symptom
 * description, not a live screenshot — flag it back if either cutoff
 * still reproduces after this.
 *
 * Everything else — the Subject/Component dropdown data source and
 * change-wiring, and hiding (never removing) mf-account-panel-v2.js's
 * original #mf-progress-topic-select / #mf-progress-chart-container — is
 * untouched from the previous version.
 *
 * Load after mf-account-panel-v2.js (needs its Progress tab DOM to exist).
 * ─────────────────────────────────────────────────────────────────────────
 * REVISION 2 — two fixes, both confirmed against a screenshot showing
 * solid gold bars instead of points, and two Subject/Component blocks
 * rendering at once:
 *
 *   1. THE BAR SHAPE: `showLine: false` only hides the connecting stroke —
 *      it does NOT disable Chart.js's default area fill under the line.
 *      With most topics near 0%, that fill painted a solid block under
 *      each spike, which is exactly the "bar" in the screenshot. Fixed by
 *      adding `fill: false` alongside `showLine: false`.
 *
 *   2. THE DUPLICATE BLOCK: the old-UI hide logic used `querySelector`
 *      (first match only). If `#mf-progress-topic-select` / 
 *      `#mf-progress-chart-container` exist more than once in the real
 *      DOM (e.g. one old block per subject rather than one shared block —
 *      unconfirmed, this file has never had direct sight of
 *      mf-account-panel-v2.js's markup), only the first instance got
 *      hidden and the rest kept rendering with the original bar-chart
 *      behavior untouched. Fixed by switching to `querySelectorAll` and
 *      hiding every match, which is a strict superset of the old
 *      behavior — harmless if there was only ever one, correct if there
 *      were more. If the duplicate block is still visible after this,
 *      the IDs themselves don't match the real markup and need to be
 *      confirmed directly against mf-account-panel-v2.js's source rather
 *      than patched again from a screenshot.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var CHARTJS_URL = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

  // ── Styles ────────────────────────────────────────────────────────────
  var STYLE_ID = 'mf-component-mastery-styles';
  var existingStyleTag = document.getElementById(STYLE_ID);
  if (existingStyleTag) existingStyleTag.remove(); // revision — replace prior version's rules cleanly
  var style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = [
    '.mf-component-mastery-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 4px; }',
    '.mf-component-mastery-row > div { flex: 1 1 160px; min-width: 140px; }',
    '.mf-component-mastery-label {',
    '  display: block; font-family: var(--mf-mono, "JetBrains Mono", monospace);',
    '  font-size: 9.5px; color: var(--mf-parchment-dim, rgba(228,221,208,0.62));',
    '  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px;',
    '}',
    '.mf-scatter-chart-scroll {',
    '  overflow-x: auto; margin-top: 4px; max-width: 100%;',
    '  scrollbar-width: thin; scrollbar-color: rgba(168,136,58,0.4) transparent;',
    '}',
    '.mf-scatter-chart-scroll::-webkit-scrollbar { height: 6px; }',
    '.mf-scatter-chart-scroll::-webkit-scrollbar-track { background: transparent; }',
    '.mf-scatter-chart-scroll::-webkit-scrollbar-thumb {',
    '  background: rgba(168,136,58,0.35); border-radius: 999px;',
    '}',
    '.mf-scatter-chart-inner { height: 220px; }',
    '.mf-chart-empty {',
    '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-style: italic;',
    '  font-size: 12px; color: var(--mf-parchment-dim, rgba(228,221,208,0.62));',
    '  text-align: center; padding: 28px 12px;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

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

  // ── Data ────────────────────────────────────────────────────────────────
  function getTopicsForSection(course, section) {
    if (typeof SYLLABUS === 'undefined') return [];
    var c = SYLLABUS[course];
    var s = c && c.sections && c.sections[section];
    return s ? Object.keys(s.topics) : [];
  }

  function getQuestionIdsForTopic(course, section, topic) {
    if (typeof SYLLABUS === 'undefined') return [];
    var c = SYLLABUS[course];
    var s = c && c.sections && c.sections[section];
    var qs = s && s.topics && s.topics[topic];
    return Array.isArray(qs) ? qs.map(function (q) { return q.id; }) : [];
  }

  function countAttempted(questionIds, progress) {
    if (!progress || !progress.questions) return 0;
    var n = 0;
    questionIds.forEach(function (id) {
      var rec = progress.questions[id];
      // Presence alone isn't enough — toggleFlag() also creates this
      // record (with an empty attempts array) when a question is only
      // flagged, never attempted.
      if (rec && rec.attempts && rec.attempts.length > 0) n++;
    });
    return n;
  }

  // ── Chart drawing ───────────────────────────────────────────────────────
  function drawScatterChart(containerEl, labels, values, colors) {
    containerEl.innerHTML = '<div class="mf-scatter-chart-scroll"><div class="mf-scatter-chart-inner"><canvas></canvas></div></div>';
    var inner = containerEl.querySelector('.mf-scatter-chart-inner');
    var minWidthPerPoint = 70;
    inner.style.minWidth = Math.max(labels.length * minWidthPerPoint, 100) + 'px';

    var canvas = containerEl.querySelector('canvas');
    var rootStyles = getComputedStyle(document.documentElement);
    var dimColor = rootStyles.getPropertyValue('--mf-parchment-dim').trim() || 'rgba(228,221,208,0.62)';
    var gridColor = 'rgba(228,221,208,0.08)';

    // eslint-disable-next-line no-new
    new window.Chart(canvas.getContext('2d'), {
      // type: 'line' with showLine:false, not the native 'scatter' type —
      // 'scatter' expects a numeric x-axis. Topics are categorical.
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          showLine: false,
          fill: false, // REVISION 2 — showLine:false alone doesn't stop the area fill under the (invisible) line; without this, the fill rendered as a solid bar from 0% up to each value.
          pointRadius: 6,
          pointHoverRadius: 7,
          pointBackgroundColor: colors,
          pointBorderColor: colors,
          pointBorderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            type: 'category',
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
        },
        // "Fade + rise, staggered" — approximated with radius-grow (stands
        // in for fade, since Chart.js has no first-class point-opacity
        // animation) and a rise from the 0% baseline, timed similarly to
        // the site's own `probIn` keyframe (fade + translateY(6px)→0).
        animation: {
          duration: 500,
          delay: function (ctx) {
            return ctx.type === 'data' ? ctx.dataIndex * 60 : 0;
          }
        },
        animations: {
          y: {
            duration: 500,
            from: function (ctx) { return ctx.chart.scales.y.getPixelForValue(0); }
          },
          radius: {
            duration: 350,
            from: 0
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

        var progress = (typeof window.loadProgress === 'function') ? window.loadProgress() : null;

        var values = [];
        var colors = [];
        topics.forEach(function (t) {
          var ids = getQuestionIdsForTopic(course, section, t);
          var total = ids.length;
          var attempted = countAttempted(ids, progress);
          var pct = total > 0 ? Math.round((attempted / total) * 1000) / 10 : 0;
          values.push(pct);
          colors.push(attempted > 0 ? '#a8883a' : 'rgba(228,221,208,0.15)');
        });

        drawScatterChart(containerElement, topics, values, colors);
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
    // getTopicMastery()'s qCount is "distinct questions with any attempt
    // in that topic" — the same underlying idea as this file's completion
    // numerator — so it's still a reasonable volume proxy for picking the
    // most-practiced component by default, even though its scored/
    // available fields are no longer used for the chart itself.
    var rows = (typeof window.getTopicMastery === 'function') ? window.getTopicMastery() : [];
    var totals = {};
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
        // REVISION 2 — querySelectorAll + hide-all instead of the previous
        // querySelector (first-match-only). If the old topic UI exists
        // more than once in the real DOM (one block per subject, say),
        // the old code only ever hid the first one and left the rest
        // rendering untouched — this is what produced a second, fully
        // functional bar-chart block sitting alongside the new one.
        var oldSelects = progressPanel.querySelectorAll('#mf-progress-topic-select');
        var oldContainers = progressPanel.querySelectorAll('#mf-progress-chart-container');
        oldSelects.forEach(function (el) { el.style.display = 'none'; });
        oldContainers.forEach(function (el) { el.style.display = 'none'; });
        var oldSelect = oldSelects[0] || null;
        var oldContainer = oldContainers[0] || null;

        var existingWrap = progressPanel.querySelector('.mf-component-mastery-wrap');
        if (existingWrap) existingWrap.remove(); // revision — rebuild cleanly rather than layer on stale nodes

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
