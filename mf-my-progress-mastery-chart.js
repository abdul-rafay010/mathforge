/**
 * MathForge — Completion chart on the real "My Progress" screen
 * (layers on top of the main site's existing Mastery tab — modifies
 * neither index.html nor mf-component-mastery-chart.js)
 * ─────────────────────────────────────────────────────────────────────────
 * CORRECTION vs. the spec this was built from: "My Progress" is not a
 * placeholder nav link. It's an existing, fully-built screen
 * (goProgress() / #s-progress) with three tabs — Weak Spots, Flagged, and
 * Mastery (#ptab-mastery / #ppanel-mastery) — and the Mastery tab already
 * renders a per-topic accuracy list via buildMasteryTab() / getTopicMastery()
 * into #mastery-body. That description matches the *opportunities* page's
 * own separate masthead, not this one.
 *
 * So this file doesn't build a new page — it adds the Subject/Component
 * dropdowns + window.renderComponentMasteryChart(container, course,
 * section) (from mf-component-mastery-chart.js, unmodified — the exact
 * reuse the spec asked for) as a SIBLING of #mastery-body inside
 * #ppanel-mastery, not inside it. buildMasteryTab() replaces
 * #mastery-body's innerHTML on every visit to rebuild its own list; being
 * a sibling means this file's UI survives that and is only built once,
 * same pattern as the account-panel version.
 *
 * Render trigger: the site's screen/tab system is two independent class
 * toggles — #s-progress gets .on when the screen is navigated to
 * (goProgress()), and #ppanel-mastery gets .active when its tab is
 * clicked (switchProgressTab('mastery')). Both are observed; the chart
 * (re)renders whenever both are true, so it's correct whether the user
 * arrives with Mastery already the active sub-tab or switches to it after
 * already being on the screen.
 *
 * Load after mf-component-mastery-chart.js (needs
 * window.renderComponentMasteryChart to exist) and after index.html's
 * inline script (needs #s-progress / #ppanel-mastery / #mastery-body,
 * and SYLLABUS / loadProgress / getTopicMastery for the dropdown logic —
 * all confirmed present in the real file, not re-derived here).
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var screenEl = document.getElementById('s-progress');
  var panelEl = document.getElementById('ppanel-mastery');
  var oldBody = document.getElementById('mastery-body');

  if (!screenEl || !panelEl || !oldBody) {
    console.error('[mf-my-progress-mastery-chart] Expected #s-progress / #ppanel-mastery / #mastery-body not found. Aborting.');
    return;
  }

  // ── Styles — uses the SITE's own theme-aware custom properties
  // (--gold, --parchment*, --ink*, --mono), not the --mf-* set the modal
  // system invented for itself. This page has a real light/dark toggle
  // ([data-theme="light"] on an ancestor swapping these same variable
  // names), so hardcoded hex fallbacks would break in light mode — unlike
  // the modal files, which only ever render on a fixed dark overlay.
  var STYLE_ID = 'mf-my-progress-mastery-chart-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mp-mastery-chart-block { margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--rule); }',
      '.mp-mastery-chart-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }',
      '.mp-mastery-chart-row > div { flex: 1 1 160px; min-width: 140px; }',
      '.mp-mastery-chart-label {',
      '  display: block; font-family: var(--mono); font-size: 0.62rem;',
      '  color: var(--parchment4); text-transform: uppercase; letter-spacing: 0.05em;',
      '  margin-bottom: 5px;',
      '}',
      '.mp-mastery-chart-select {',
      '  width: 100%; box-sizing: border-box; background: var(--ink2);',
      '  border: 1px solid var(--rule2); border-radius: 6px; color: var(--parchment);',
      '  font-family: var(--mono); font-size: 0.78rem; padding: 8px 10px;',
      '}',
      '.mp-mastery-chart-select:focus { outline: none; border-color: var(--gold); }',
      '.mp-scatter-chart-scroll {',
      '  overflow-x: auto; max-width: 100%;',
      '  scrollbar-width: thin; scrollbar-color: var(--gold-border) transparent;',
      '}',
      '.mp-scatter-chart-scroll::-webkit-scrollbar { height: 6px; }',
      '.mp-scatter-chart-scroll::-webkit-scrollbar-track { background: transparent; }',
      '.mp-scatter-chart-scroll::-webkit-scrollbar-thumb { background: var(--gold-border); border-radius: 999px; }',
      '.mp-scatter-chart-inner { height: 220px; }',
      '.mp-mastery-chart-empty {',
      '  font-family: var(--mono); font-style: italic; font-size: 0.78rem;',
      '  color: var(--parchment4); text-align: center; padding: 24px 0;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  var subjectSelect = null;
  var componentSelect = null;
  var chartContainer = null;

  function computeDefaultCourseSection() {
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

  function renderCurrentSelection() {
    if (!subjectSelect || !componentSelect || !chartContainer) return;
    if (typeof window.renderComponentMasteryChart !== 'function') {
      chartContainer.innerHTML = '<p class="mp-mastery-chart-empty">Chart module not loaded.</p>';
      return;
    }
    window.renderComponentMasteryChart(chartContainer, subjectSelect.value, componentSelect.value);
  }

  function buildUI() {
    var block = document.createElement('div');
    block.className = 'mp-mastery-chart-block';
    block.innerHTML =
      '<div class="mp-mastery-chart-row">' +
        '<div>' +
          '<label class="mp-mastery-chart-label" for="mp-cm-subject-select">Subject</label>' +
          '<select class="mp-mastery-chart-select" id="mp-cm-subject-select"></select>' +
        '</div>' +
        '<div>' +
          '<label class="mp-mastery-chart-label" for="mp-cm-component-select">Component</label>' +
          '<select class="mp-mastery-chart-select" id="mp-cm-component-select"></select>' +
        '</div>' +
      '</div>' +
      '<div id="mp-cm-chart-container"></div>';

    oldBody.insertAdjacentElement('afterend', block);

    subjectSelect = block.querySelector('#mp-cm-subject-select');
    componentSelect = block.querySelector('#mp-cm-component-select');
    chartContainer = block.querySelector('#mp-cm-chart-container');

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

  function checkAndRender() {
    var visible = screenEl.classList.contains('on') && panelEl.classList.contains('active');
    if (!visible) return;
    if (!subjectSelect) {
      buildUI();
    } else {
      renderCurrentSelection(); // picks up fresh attempt data on repeat visits
    }
  }

  var screenObserver = new MutationObserver(checkAndRender);
  screenObserver.observe(screenEl, { attributes: true, attributeFilter: ['class'] });

  var panelObserver = new MutationObserver(checkAndRender);
  panelObserver.observe(panelEl, { attributes: true, attributeFilter: ['class'] });

  checkAndRender(); // in case this script loads while already on the visible Mastery tab
})();
