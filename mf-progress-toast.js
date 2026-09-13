/**
 * MathForge — "Progress saved" toast
 * ─────────────────────────────────────────────────────────────────────────
 * Wraps window.recordAttempt the same way mf-spaced-repetition.js already
 * does. Multiple wraps compose safely — each captures whatever
 * window.recordAttempt currently is at its own load time and calls that,
 * so load order between this file and mf-spaced-repetition.js doesn't
 * matter functionally; whichever loads second just wraps the other's
 * wrapper. Load this file after index.html's inline script either way.
 *
 * POSITION: bottom-center, not bottom-right. The real index.html has a
 * mobile calculator window ("a floating 280×360 window anchored
 * bottom-right") that occupies exactly that corner on small screens — a
 * bottom-right toast would collide with it if the calculator happens to be
 * open while self-marking. Bottom-center clears both that and the
 * full-width #katex-warn bar pinned at the very bottom edge.
 *
 * DEBOUNCE: tsSetScore() (index.html) calls recordAttempt() on every score
 * input change, not just once (so typing "8" then "5" for "85" fires it
 * twice). Triggering while a toast is already visible resets its dismiss
 * timer instead of stacking a second toast.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.recordAttempt !== 'function') {
    console.error('[mf-progress-toast] window.recordAttempt not found. Aborting.');
    return;
  }

  var STYLE_ID = 'mf-progress-toast-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-progress-toast {',
      '  position: fixed; bottom: 28px; left: 50%; z-index: 9990;',
      '  background: #0c0c0c; border: 1px solid rgba(168,136,58,0.35);',
      '  color: var(--mf-parchment, #e4ddd0); font-family: var(--mf-mono, "JetBrains Mono", monospace);',
      '  font-size: 12px; padding: 9px 16px; border-radius: 999px; white-space: nowrap;',
      '  box-shadow: 0 8px 24px rgba(0,0,0,0.4); pointer-events: none;',
      '  opacity: 0; transform: translate(-50%, 6px);',
      '  transition: opacity 150ms ease, transform 150ms ease;',
      '}',
      '.mf-progress-toast.mf-toast-show { opacity: 1; transform: translate(-50%, 0); }',
      '.mf-progress-toast.mf-toast-hide { opacity: 0; transform: translate(-50%, 6px); transition: opacity 200ms ease, transform 200ms ease; }',
      '@media (prefers-reduced-motion: reduce) { .mf-progress-toast { transition: none !important; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  var toastEl = null;
  var hideTimer = null;
  var removeTimer = null;

  function scheduleHide() {
    hideTimer = window.setTimeout(function () {
      if (!toastEl) return;
      toastEl.classList.remove('mf-toast-show');
      toastEl.classList.add('mf-toast-hide');
      removeTimer = window.setTimeout(function () {
        if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
        toastEl = null;
      }, 200);
    }, 1500);
  }

  function showToast() {
    if (toastEl) {
      // Already visible — reset the dismiss timer instead of stacking.
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
      toastEl.classList.remove('mf-toast-hide');
      toastEl.classList.add('mf-toast-show');
      scheduleHide();
      return;
    }

    toastEl = document.createElement('div');
    toastEl.className = 'mf-progress-toast';
    toastEl.textContent = '\u2713 Progress saved';
    document.body.appendChild(toastEl);
    void toastEl.offsetWidth;
    toastEl.classList.add('mf-toast-show');
    scheduleHide();
  }

  var originalRecordAttempt = window.recordAttempt;
  window.recordAttempt = function () {
    var result = originalRecordAttempt.apply(this, arguments);
    try {
      showToast();
    } catch (err) {
      console.error('[mf-progress-toast] failed to show toast', err);
    }
    return result;
  };
})();
