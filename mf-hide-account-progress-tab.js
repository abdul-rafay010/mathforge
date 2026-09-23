/**
 * MathForge — Hide the Manage Account modal's Progress tab
 * (layers on top of mf-account-panel-v2.js — modifies neither it nor
 * mf-account-panel.js)
 * ─────────────────────────────────────────────────────────────────────────
 * Answers the open question from the nav-updates spec: now that the
 * completion chart lives on the real "My Progress" screen
 * (mf-my-progress-mastery-chart.js), the account-panel's Progress tab is
 * redundant and should disappear rather than stay as a second access
 * point — per direct instruction.
 *
 * Same hide-don't-remove approach used throughout this modal system:
 * mf-account-panel-v2.js's tab list was captured once via querySelectorAll
 * at its own load time, and its delegated click handler still references
 * the Progress tab/panel by data-tab="progress" — removing those elements
 * outright risks that handler (or mf-component-mastery-chart.js's own
 * MutationObserver, which still targets
 * .mf-manage-panel[data-panel="progress"]) hitting a null reference. Both
 * the tab button and its panel are hidden via CSS instead, left in the DOM
 * exactly as mf-account-panel-v2.js built them.
 *
 * If Profile is the active tab when this runs (the default), nothing else
 * changes. If Progress somehow ends up the active tab, this switches to
 * Profile so the modal never opens on a hidden panel.
 *
 * Load after mf-account-panel-v2.js (needs its tab markup to exist) and
 * after mf-component-mastery-chart.js (that file's own MutationObserver
 * setup should have already run once — hiding here doesn't stop it from
 * firing, it just makes its target permanently invisible, which is fine
 * since nothing depends on that panel being seen anymore).
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var STYLE_ID = 'mf-hide-account-progress-tab-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.mf-manage-tab[data-tab="progress"], .mf-manage-panel[data-panel="progress"] { display: none !important; }';
    document.head.appendChild(style);
  }

  function fixActiveTabIfNeeded(tabsContainer, panelsContainer) {
    var progressTab = tabsContainer.querySelector('.mf-manage-tab[data-tab="progress"]');
    if (!progressTab || !progressTab.classList.contains('mf-active')) return;

    var profileTab = tabsContainer.querySelector('.mf-manage-tab[data-tab="profile"]');
    var profilePanel = panelsContainer.querySelector('.mf-manage-panel[data-panel="profile"]');
    var progressPanel = panelsContainer.querySelector('.mf-manage-panel[data-panel="progress"]');
    if (!profileTab || !profilePanel) return;

    progressTab.classList.remove('mf-active');
    if (progressPanel) progressPanel.classList.remove('mf-active');
    profileTab.classList.add('mf-active');
    profilePanel.classList.add('mf-active');
  }

  function waitFor(checkFn, cb) {
    var existing = checkFn();
    if (existing) { cb(existing); return; }
    var observer = new MutationObserver(function () {
      var found = checkFn();
      if (found) { observer.disconnect(); cb(found); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  waitFor(
    function () {
      var tabs = document.querySelector('.mf-manage-tabs');
      var panels = document.querySelector('.mf-manage-panels');
      return (tabs && panels) ? { tabs: tabs, panels: panels } : null;
    },
    function (refs) {
      fixActiveTabIfNeeded(refs.tabs, refs.panels);

      // The Progress tab is inserted by mf-component-mastery-chart.js's own
      // async setup (via mf-account-panel-v2.js's tab-insertion pattern),
      // which may not have run yet when this file's waitFor first resolves
      // on .mf-manage-tabs/.mf-manage-panels alone — keep checking for a
      // moment in case fixActiveTabIfNeeded needs to catch a late-inserted
      // Progress tab becoming active before the user notices it's gone.
      var settleObserver = new MutationObserver(function () {
        fixActiveTabIfNeeded(refs.tabs, refs.panels);
      });
      settleObserver.observe(refs.tabs, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
  );
})();
