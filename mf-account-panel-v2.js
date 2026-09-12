/**
 * MathForge — Manage-account panel v2
 * (extends mf-account-panel.js's manage modal from the outside — modifies
 * neither that file nor mf-mastery-chart.js)
 * ─────────────────────────────────────────────────────────────────────────
 * Load order:
 *   mf-signin.js, mf-account-extras.js, mf-account-panel.js,
 *   mf-spaced-repetition.js, mf-mastery-chart.js, mf-account-panel-v2.js
 *
 * DESIGN NOTE — tab rail: mf-account-panel.js's desktop tab list is
 * already a vertical column (only its mobile breakpoint goes horizontal),
 * so there's no horizontal-to-vertical restructuring to do. This file adds
 * icons and the left-gold-border active state, and widens the panel.
 *
 * DESIGN NOTE — wiring the new tab: mf-account-panel.js captured its tab
 * buttons with `querySelectorAll` once at load time (a static NodeList),
 * so a tab this file inserts afterward never got that original click
 * listener. Rather than patch around that, this file adds one delegated
 * click listener on the tab rail's container that handles switching for
 * ALL tabs, old and new. For the three original tabs, both the original
 * per-tab listener and this delegated one will fire on click — harmless,
 * since both just toggle the same `mf-active` classes.
 *
 * Verified against the real index__5_.html: findQuestionById(qid) returns
 * { course, section, topic, index, q } (top-level fields, as used below),
 * and progress.questions[qid].attempts is exactly the array counted here.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.mfClient === 'undefined') {
    console.error('[mf-account-panel-v2] mfClient not found. Aborting.');
    return;
  }

  var innerModal = document.querySelector('.mf-manage-modal');
  var backdrop = innerModal ? innerModal.closest('.mf-backdrop') : null;
  var tabsContainer = innerModal ? innerModal.querySelector('.mf-manage-tabs') : null;
  var panelsContainer = innerModal ? innerModal.querySelector('.mf-manage-panels') : null;

  if (!innerModal || !backdrop || !tabsContainer || !panelsContainer) {
    console.error('[mf-account-panel-v2] Expected manage-modal structure from mf-account-panel.js not found. Aborting.');
    return;
  }

  var mfClient = window.mfClient;
  var cachedSession = null;
  mfClient.auth.getSession().then(function (res) {
    cachedSession = res && res.data ? res.data.session : null;
  });
  mfClient.auth.onAuthStateChange(function (_event, session) {
    cachedSession = session;
  });

  // ── Styles ────────────────────────────────────────────────────────────
  var STYLE_ID = 'mf-account-panel-v2-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-manage-modal { max-width: 720px !important; }',
      '',
      '.mf-manage-tab { display: flex !important; align-items: center; gap: 10px; border-left: 3px solid transparent !important; padding-left: 13px !important; }',
      '.mf-manage-tab.mf-active { border-left-color: var(--mf-gold, #a8883a) !important; }',
      '.mf-tab-icon { width: 15px; height: 15px; flex-shrink: 0; }',
      '.mf-tab-icon svg { width: 100%; height: 100%; display: block; }',
      '',
      '.mf-progress-select {',
      '  width: 100%; box-sizing: border-box; background: #050505;',
      '  border: 1px solid rgba(228,221,208,0.16); border-radius: 6px;',
      '  padding: 9px 11px; font-family: var(--mf-mono, "JetBrains Mono", monospace);',
      '  font-size: 12.5px; color: var(--mf-parchment, #e4ddd0); margin-bottom: 18px;',
      '}',
      '.mf-progress-select:focus { outline: none; border-color: var(--mf-gold, #a8883a); }',
      '.mf-progress-chart-container { min-height: 180px; }',
      '.mf-progress-empty {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-style: italic;',
      '  font-size: 12px; color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); padding: 24px 0;',
      '}',
      '',
      '.mf-member-since {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 11px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); margin-top: 14px;',
      '}',

      '@media (max-width: 640px) {',
      '  .mf-manage-modal { max-width: calc(100vw - 32px) !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Icons (16x16, currentColor stroke) ──────────────────────────────────
  var ICONS = {
    profile: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="5.3" r="2.3"/><path d="M3.2 13c1-2.4 2.9-3.6 4.8-3.6s3.8 1.2 4.8 3.6"/></svg>',
    progress: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13.5h12M4.2 13.5V8.4M8 13.5V4.6M11.8 13.5V6.9"/></svg>',
    security: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3.6" y="7.2" width="8.8" height="6.2" rx="1.2"/><path d="M5.4 7.2V5.1a2.6 2.6 0 0 1 5.2 0v2.1"/></svg>',
    data: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M8 1.8 13 3.6v4c0 3.4-2.1 5.9-5 6.6-2.9-.7-5-3.2-5-6.6v-4L8 1.8Z"/></svg>'
  };

  function setTabIconAndLabel(tabEl, iconKey, label) {
    if (!tabEl) return;
    tabEl.innerHTML = '<span class="mf-tab-icon">' + ICONS[iconKey] + '</span><span>' + label + '</span>';
  }

  setTabIconAndLabel(tabsContainer.querySelector('[data-tab="profile"]'), 'profile', 'Profile');
  setTabIconAndLabel(tabsContainer.querySelector('[data-tab="security"]'), 'security', 'Security');
  setTabIconAndLabel(tabsContainer.querySelector('[data-tab="data"]'), 'data', 'Data &amp; Privacy');

  // ── New "Progress" tab, inserted second (right after Profile) ─────────
  var profileTabBtn = tabsContainer.querySelector('[data-tab="profile"]');
  var profilePanel = panelsContainer.querySelector('[data-panel="profile"]');

  var progressTabBtn = document.createElement('button');
  progressTabBtn.type = 'button';
  progressTabBtn.className = 'mf-manage-tab';
  progressTabBtn.dataset.tab = 'progress';
  setTabIconAndLabel(progressTabBtn, 'progress', 'Progress');
  profileTabBtn.insertAdjacentElement('afterend', progressTabBtn);

  var progressPanel = document.createElement('div');
  progressPanel.className = 'mf-manage-panel';
  progressPanel.dataset.panel = 'progress';
  progressPanel.innerHTML =
    '<h3>Progress</h3>' +
    '<select class="mf-progress-select" id="mf-progress-topic-select"></select>' +
    '<div class="mf-progress-chart-container" id="mf-progress-chart-container"></div>';
  profilePanel.insertAdjacentElement('afterend', progressPanel);

  // ── Delegated tab switching (covers old tabs too — see header note) ───
  tabsContainer.addEventListener('click', function (e) {
    var tabBtn = e.target.closest('.mf-manage-tab');
    if (!tabBtn) return;

    tabsContainer.querySelectorAll('.mf-manage-tab').forEach(function (t) { t.classList.remove('mf-active'); });
    panelsContainer.querySelectorAll('.mf-manage-panel').forEach(function (p) { p.classList.remove('mf-active'); });

    tabBtn.classList.add('mf-active');
    var target = panelsContainer.querySelector('.mf-manage-panel[data-panel="' + tabBtn.dataset.tab + '"]');
    if (target) target.classList.add('mf-active');

    if (tabBtn.dataset.tab === 'progress') populateProgressTab();
  });

  // ── Progress tab data ───────────────────────────────────────────────────

  function listTopicsWithHistory() {
    var progress = (typeof window.loadProgress === 'function') ? window.loadProgress() : null;
    if (!progress || !progress.questions) return [];

    var byKey = {};
    Object.keys(progress.questions).forEach(function (qid) {
      var rec = progress.questions[qid];
      if (!rec || !rec.attempts || !rec.attempts.length) return;

      var q = (typeof window.findQuestionById === 'function') ? window.findQuestionById(qid) : null;
      if (!q || !q.course || !q.section || !q.topic) return;

      var key = q.course + '|' + q.section + '|' + q.topic;
      if (!byKey[key]) byKey[key] = { course: q.course, section: q.section, topic: q.topic, count: 0 };
      byKey[key].count += rec.attempts.length;
    });

    return Object.keys(byKey)
      .map(function (k) { return byKey[k]; })
      .sort(function (a, b) { return b.count - a.count; });
  }

  function populateProgressTab() {
    var select = progressPanel.querySelector('#mf-progress-topic-select');
    var chartContainer = progressPanel.querySelector('#mf-progress-chart-container');
    var topics = listTopicsWithHistory();

    if (topics.length === 0) {
      select.innerHTML = '';
      select.style.display = 'none';
      chartContainer.innerHTML = '<p class="mf-progress-empty">No practice history yet — attempt a few questions to see your trend here.</p>';
      return;
    }

    select.style.display = '';
    select.innerHTML = topics.map(function (t, i) {
      var label = t.course + ' \u203a ' + t.section + ' \u203a ' + t.topic;
      return '<option value="' + i + '">' + label + '</option>';
    }).join('');

    function renderSelected() {
      var idx = parseInt(select.value, 10) || 0;
      var t = topics[idx];
      if (typeof window.renderMasteryChart === 'function') {
        window.renderMasteryChart(chartContainer, t.course, t.section, t.topic);
      } else {
        chartContainer.innerHTML = '<p class="mf-progress-empty">Chart module not loaded.</p>';
      }
    }

    select.onchange = renderSelected;
    renderSelected(); // defaults to topics[0], which is already the highest-attempt-count entry
  }

  // ── Member since (Profile tab) ─────────────────────────────────────────

  function ensureMemberSinceLine() {
    if (profilePanel.querySelector('.mf-member-since')) return;
    var msgEl = profilePanel.querySelector('#mf-manage-name-msg');
    var line = document.createElement('div');
    line.className = 'mf-member-since';
    (msgEl || profilePanel).insertAdjacentElement('afterend', line);
  }

  function updateMemberSinceLine() {
    var user = cachedSession && cachedSession.user;
    var line = profilePanel.querySelector('.mf-member-since');
    if (!line) return;
    if (!user || !user.created_at) {
      line.textContent = '';
      return;
    }
    var d = new Date(user.created_at);
    var formatted = isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    line.textContent = formatted ? ('Member since ' + formatted) : '';
  }

  // ── Fire when the manage modal opens (observed, since openManageModal()
  //    inside mf-account-panel.js is private and can't be hooked directly) ──
  var openObserver = new MutationObserver(function () {
    if (backdrop.classList.contains('mf-open')) {
      ensureMemberSinceLine();
      updateMemberSinceLine();
      if (progressPanel.classList.contains('mf-active')) populateProgressTab();
    }
  });
  openObserver.observe(backdrop, { attributes: true, attributeFilter: ['class'] });
})();
