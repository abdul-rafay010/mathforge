/**
 * MathForge — Component-level completion chart
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
 * ANIMATION — Chart.js has no first-class per-point opacity animation, so
 * "fade + rise" is approximated with two animatable properties instead:
 * radius growing from 0 (a materializing effect, standing in for fade)
 * and y rising from the 0% baseline, both staggered per topic via the
 * `delay` callback. Reads the same as fade+rise without fighting the
 * library for something it doesn't expose.
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
 *      DOM, only the first instance got hidden. Fixed by switching to
 *      `querySelectorAll` and hiding every match.
 * ─────────────────────────────────────────────────────────────────────────
 * REVISION 3 — two requested changes, both confirmed against a screenshot
 * showing disconnected points and topics ("Vectors", "Differential
 * Equations") cut off past the modal's right edge with nothing to make
 * that discoverable:
 *
 *   1. LINE VS BAR: chose to connect the points with a smooth line rather
 *      than reintroduce bars. Bars read closer to a standard dashboard
 *      widget; the site's own design brief (dark academia, "premium,
 *      restrained — not flashy, not corporate-SaaS") points toward a
 *      quieter connected curve instead. The line uses a muted, translucent
 *      gold (`rgba(168,136,58,0.45)`) so it reads as a trend path behind
 *      the points, not a second competing signal — the points themselves
 *      stay the primary gold/dim (attempted/not) language. `fill: false`
 *      is kept from Revision 2's fix so the area-under-curve bug can't
 *      reappear now that showLine is back on.
 *
 *   2. TOPIC SLIDER: the horizontal-scroll container already existed
 *      (`.mf-scatter-chart-scroll`, `overflow-x: auto`), but nothing
 *      signals it's scrollable beyond a thin native scrollbar, which is
 *      easy to miss — hence topics running off-screen with "no way to see
 *      them." A styled range-input slider is now appended below the chart
 *      whenever content actually overflows (skipped entirely when every
 *      topic already fits), bidirectionally synced to the scroll
 *      container's scrollLeft. It's rebuilt on every render since
 *      drawScatterChart() already fully replaces the container's
 *      innerHTML per redraw — no separate cleanup needed.
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
    '}',
    '.mf-topic-slider-wrap { margin-top: 12px; padding: 0 4px; }',
    '.mf-topic-slider {',
    '  width: 100%; display: block; -webkit-appearance: none; appearance: none;',
    '  height: 3px; border-radius: 999px; background: rgba(228,221,208,0.12);',
    '  outline: none; cursor: pointer; margin: 0;',
    '}',
    '.mf-topic-slider::-webkit-slider-runnable-track { height: 3px; border-radius: 999px; background: transparent; }',
    '.mf-topic-slider::-webkit-slider-thumb {',
    '  -webkit-appearance: none; appearance: none; width: 13px; height: 13px;',
    '  border-radius: 50%; background: var(--mf-gold, #a8883a);',
    '  border: 2px solid #0c0c0c; box-shadow: 0 0 0 1px rgba(168,136,58,0.4);',
    '  cursor: pointer; margin-top: -5px;',
    '}',
    '.mf-topic-slider::-moz-range-track { height: 3px; border-radius: 999px; background: rgba(228,221,208,0.12); }',
    '.mf-topic-slider::-moz-range-thumb {',
    '  width: 13px; height: 13px; border-radius: 50%; background: var(--mf-gold, #a8883a);',
    '  border: 2px solid #0c0c0c; cursor: pointer;',
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

  // ── Topic slider (Revision 3) ───────────────────────────────────────────
  // Appended below the chart, only when content actually overflows the
  // visible width. Rebuilt on every render — drawScatterChart() already
  // wipes containerEl's innerHTML each redraw, so there's nothing to clean
  // up separately.
  function attachTopicSlider(containerEl, scrollEl) {
    // Let layout settle (widths from the just-inserted canvas/scroll div
    // aren't reliable until after the next paint) before measuring overflow.
    window.requestAnimationFrame(function () {
      var overflowAmount = scrollEl.scrollWidth - scrollEl.clientWidth;
      if (overflowAmount <= 4) return; // everything already fits — no slider needed

      var sliderWrap = document.createElement('div');
      sliderWrap.className = 'mf-topic-slider-wrap';
      sliderWrap.innerHTML =
        '<input type="range" class="mf-topic-slider" min="0" max="' + overflowAmount +
        '" value="0" step="1" aria-label="Scroll through topics">';
      containerEl.appendChild(sliderWrap);

      var slider = sliderWrap.querySelector('.mf-topic-slider');
      var syncingFromSlider = false;

      slider.addEventListener('input', function () {
        syncingFromSlider = true;
        scrollEl.scrollLeft = parseInt(slider.value, 10);
        window.setTimeout(function () { syncingFromSlider = false; }, 0);
      });

      scrollEl.addEventListener('scroll', function () {
        if (syncingFromSlider) return;
        slider.value = String(scrollEl.scrollLeft);
      });
    });
  }

  // ── Chart drawing ───────────────────────────────────────────────────────
  function drawScatterChart(containerEl, labels, values, colors) {
    containerEl.innerHTML = '<div class="mf-scatter-chart-scroll"><div class="mf-scatter-chart-inner"><canvas></canvas></div></div>';
    var scrollEl = containerEl.querySelector('.mf-scatter-chart-scroll');
    var inner = containerEl.querySelector('.mf-scatter-chart-inner');
    var minWidthPerPoint = 70;
    inner.style.minWidth = Math.max(labels.length * minWidthPerPoint, 100) + 'px';

    var canvas = containerEl.querySelector('canvas');
    var rootStyles = getComputedStyle(document.documentElement);
    var dimColor = rootStyles.getPropertyValue('--mf-parchment-dim').trim() || 'rgba(228,221,208,0.62)';
    var gridColor = 'rgba(228,221,208,0.08)';

    // eslint-disable-next-line no-new
    new window.Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          showLine: true,          // Revision 3 — connect points into a curve
          tension: 0.35,
          borderColor: 'rgba(168,136,58,0.45)', // muted — a trend path behind the points, not competing with them
          borderWidth: 2,
          fill: false,              // kept from Revision 2 — without this the area under the curve renders as a solid block
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

    attachTopicSlider(containerEl, scrollEl);
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
        // Revision 2 — querySelectorAll + hide-all instead of querySelector
        // (first-match-only), in case the old topic UI exists more than
        // once in the real DOM.
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
