/**
 * MathForge — Home icon in the main masthead
 * (layers on top of index.html's masthead — modifies nothing)
 * ─────────────────────────────────────────────────────────────────────────
 * Verified against the real markup: the masthead's icon row already has a
 * consistent style for this — .masthead-icon-btn (28×28 circle, gold
 * border, same class the calculator toggle and Instagram link use) — so
 * this reuses that class rather than inventing new button styling.
 * window.goHome() already exists (called by clicking the "MathForge"
 * title itself); this button just calls the same function, giving the
 * same action a second, icon-only entry point in the row of icon buttons
 * rather than duplicating its logic.
 *
 * Inserted as the first icon in the row (before the calculator toggle),
 * since "get me home" is a more global action than the calculator or
 * social link next to it.
 *
 * Only covers the main site's masthead. The opportunities page has its
 * own separate masthead (a different file, not available in this
 * session) — that half of this piece needs that file uploaded before it
 * can be built against real markup rather than guessed.
 *
 * Load after index.html's inline script (needs window.goHome() and the
 * masthead's icon row to exist).
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.goHome !== 'function') {
    console.error('[mf-home-icon] window.goHome not found. Aborting.');
    return;
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
    function () { return document.getElementById('calc-toggle-btn'); },
    function (calcBtn) {
      if (document.getElementById('mf-home-icon-btn')) return; // already inserted

      var btn = document.createElement('button');
      btn.className = 'masthead-icon-btn';
      btn.id = 'mf-home-icon-btn';
      btn.type = 'button';
      btn.title = 'Home';
      btn.setAttribute('aria-label', 'Go to homepage');
      btn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" ' +
        'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M1.5 6.2 7 1.8l5.5 4.4"/>' +
        '<path d="M2.8 5.4V12h8.4V5.4"/>' +
        '<path d="M5.4 12V8.4h3.2V12"/>' +
        '</svg>';

      btn.addEventListener('click', function () { window.goHome(); });

      calcBtn.insertAdjacentElement('beforebegin', btn);
    }
  );
})();
