/**
 * MathForge — Mastery-over-time chart
 * ─────────────────────────────────────────────────────────────────────────
 * Verified against the real index__5_.html / questions.js:
 *   - loadProgress() → { questions: { [qid]: { attempts: [{date, scored,
 *     marks, note}, ...] } } }, `date` is a full ISO timestamp string
 *   - findQuestionById(qid) → { course, section, topic, index, q } — the
 *     course/section/topic fields collectAttempts() reads are exactly
 *     those top-level keys, not nested inside `.q`
 *
 * Data-shape note: recordAttempt() caps each question's attempts to the
 * most recent 10, so the "cumulative" trend this file draws is cumulative
 * over whatever's currently retained per question — not literally every
 * attempt ever made on heavily-practiced questions. Worth knowing, not a
 * bug: it's the same retention the rest of the app already relies on.
 *
 * Loads Chart.js from CDN lazily (once), on first call to
 * window.renderMasteryChart().
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var CHARTJS_URL = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

  var STYLE_ID = 'mf-mastery-chart-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-chart-empty {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-style: italic;',
      '  font-size: 12px; color: var(--mf-parchment-dim, rgba(228,221,208,0.62));',
      '  text-align: center; padding: 28px 12px;',
      '}',
      '.mf-chart-canvas-wrap { position: relative; width: 100%; }'
    ].join('\n');
    document.head.appendChild(style);
  }

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

  function collectAttempts(course, section, topic) {
    var progress = (typeof window.loadProgress === 'function') ? window.loadProgress() : null;
    var attempts = [];
    if (!progress || !progress.questions) return attempts;

    Object.keys(progress.questions).forEach(function (qid) {
      var q = (typeof window.findQuestionById === 'function') ? window.findQuestionById(qid) : null;
      if (!q || q.course !== course || q.section !== section || q.topic !== topic) return;

      var rec = progress.questions[qid];
      (rec.attempts || []).forEach(function (a) {
        if (a && a.date && typeof a.scored === 'number' && typeof a.marks === 'number' && a.marks > 0) {
          attempts.push({ date: a.date, scored: a.scored, marks: a.marks });
        }
      });
    });

    return attempts;
  }

  function getMonday(dateLike) {
    var d = new Date(dateLike);
    var day = d.getDay(); // 0=Sun..6=Sat
    var diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isoDateOnly(d) {
    return d.toISOString().slice(0, 10);
  }

  function computeWeeklyCumulativeSeries(attempts) {
    var sorted = attempts.slice().sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    if (sorted.length === 0) return { labels: [], values: [] };

    var weekKeysSeen = {};
    var weekKeys = [];
    sorted.forEach(function (a) {
      var key = isoDateOnly(getMonday(a.date));
      if (!weekKeysSeen[key]) {
        weekKeysSeen[key] = true;
        weekKeys.push(key);
      }
    });
    weekKeys.sort();

    var labels = [];
    var values = [];
    weekKeys.forEach(function (weekKey) {
      var weekEnd = new Date(weekKey);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      var sumScored = 0;
      var sumMarks = 0;
      sorted.forEach(function (a) {
        if (new Date(a.date) <= weekEnd) {
          sumScored += a.scored;
          sumMarks += a.marks;
        }
      });

      var pct = sumMarks > 0 ? (sumScored / sumMarks) * 100 : 0;
      var mondayDate = new Date(weekKey);
      labels.push(mondayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      values.push(Math.round(pct * 10) / 10);
    });

    return { labels: labels, values: values };
  }

  function renderEmptyState(containerEl) {
    containerEl.innerHTML = '<p class="mf-chart-empty">Not enough history yet — keep practising.</p>';
  }

  function drawChart(containerEl, series) {
    containerEl.innerHTML = '<div class="mf-chart-canvas-wrap"><canvas></canvas></div>';
    var canvas = containerEl.querySelector('canvas');

    var rootStyles = getComputedStyle(document.documentElement);
    var dimColor = rootStyles.getPropertyValue('--mf-parchment-dim').trim() || 'rgba(228,221,208,0.62)';
    var goldColor = rootStyles.getPropertyValue('--mf-gold').trim() || '#a8883a';
    var gridColor = 'rgba(228,221,208,0.08)';

    // eslint-disable-next-line no-new
    new window.Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: series.labels,
        datasets: [{
          data: series.values,
          borderColor: goldColor,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2.5,
          pointBackgroundColor: goldColor,
          pointBorderColor: goldColor,
          tension: 0.25,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: dimColor, font: { family: 'JetBrains Mono', size: 10 } },
            grid: { color: gridColor }
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

  window.renderMasteryChart = function (containerElement, course, section, topic) {
    if (!containerElement) return;
    containerElement.innerHTML = '<p class="mf-chart-empty">Loading chart…</p>';

    ensureChartJsLoaded()
      .then(function () {
        var attempts = collectAttempts(course, section, topic);
        if (attempts.length < 2) {
          renderEmptyState(containerElement);
          return;
        }
        var series = computeWeeklyCumulativeSeries(attempts);
        if (series.labels.length < 2) {
          renderEmptyState(containerElement);
          return;
        }
        drawChart(containerElement, series);
      })
      .catch(function (err) {
        console.error('[mf-mastery-chart] failed to render', err);
        containerElement.innerHTML = '<p class="mf-chart-empty">Couldn\u2019t load the chart. Try again shortly.</p>';
      });
  };
})();
