/**
 * MathForge — Password strength checklist + reveal toggle
 * ─────────────────────────────────────────────────────────────────────────
 * Layers onto mf-signin.js's existing #mf-input-password field:
 * - A show/hide (eye icon) toggle
 * - A live checklist (lowercase / uppercase / number / 6+ characters),
 *   each item checking off as satisfied, visible only in signup mode
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var STYLE_ID = 'mf-password-strength-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-pw-field-wrap { position: relative; }',
      '.mf-pw-toggle {',
      '  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);',
      '  background: none; border: none; cursor: pointer; padding: 4px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62));',
      '  display: flex; align-items: center; justify-content: center;',
      '}',
      '.mf-pw-toggle:hover { color: var(--mf-parchment, #e4ddd0); }',
      '.mf-pw-toggle svg { width: 15px; height: 15px; }',
      '',
      '.mf-pw-checklist {',
      '  display: none; flex-direction: column; gap: 4px; margin: 8px 0 12px;',
      '}',
      '.mf-pw-checklist.mf-visible { display: flex; }',
      '.mf-pw-check-item {',
      '  display: flex; align-items: center; gap: 7px;',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 10.5px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); transition: color 150ms ease;',
      '}',
      '.mf-pw-check-item.mf-met { color: var(--mf-gold, #a8883a); }',
      '.mf-pw-check-icon {',
      '  width: 13px; height: 13px; flex-shrink: 0; border-radius: 50%;',
      '  border: 1px solid currentColor; display: flex; align-items: center; justify-content: center;',
      '}',
      '.mf-pw-check-icon svg { width: 8px; height: 8px; opacity: 0; transition: opacity 150ms ease; }',
      '.mf-pw-check-item.mf-met .mf-pw-check-icon svg { opacity: 1; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  var EYE_OPEN = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="10" cy="10" r="2.5"/></svg>';
  var EYE_CLOSED = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 2.5l15 15M8.3 8.5a2.5 2.5 0 0 0 3.4 3.3M6 5.1C3.4 6.4 1 10 1 10s3.5 6 9 6c1.5 0 2.8-.4 4-1M15.2 13.8C17.4 12.2 19 10 19 10s-3.5-6-9-6c-.6 0-1.2.05-1.8.16"/></svg>';
  var CHECK_ICON = '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1 4l2 2 4-4"/></svg>';

  var RULES = [
    { label: 'One lowercase letter', test: function (v) { return /[a-z]/.test(v); } },
    { label: 'One uppercase letter', test: function (v) { return /[A-Z]/.test(v); } },
    { label: 'One number', test: function (v) { return /[0-9]/.test(v); } },
    { label: 'At least 6 characters', test: function (v) { return v.length >= 6; } }
  ];

  function init() {
    var passwordInput = document.getElementById('mf-input-password');
    var submitLabel = document.getElementById('mf-email-submit-label');
    if (!passwordInput || passwordInput.dataset.mfStrengthWired) return;
    passwordInput.dataset.mfStrengthWired = '1';

    // Wrap the input so the toggle button can be positioned inside it.
    var wrap = document.createElement('div');
    wrap.className = 'mf-pw-field-wrap';
    passwordInput.parentNode.insertBefore(wrap, passwordInput);
    wrap.appendChild(passwordInput);

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'mf-pw-toggle';
    toggleBtn.setAttribute('aria-label', 'Show password');
    toggleBtn.innerHTML = EYE_OPEN;
    wrap.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', function () {
      var showing = passwordInput.type === 'text';
      passwordInput.type = showing ? 'password' : 'text';
      toggleBtn.innerHTML = showing ? EYE_OPEN : EYE_CLOSED;
      toggleBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });

    var checklist = document.createElement('div');
    checklist.className = 'mf-pw-checklist';
    RULES.forEach(function (rule, i) {
      var item = document.createElement('div');
      item.className = 'mf-pw-check-item';
      item.dataset.ruleIndex = i;
      item.innerHTML = '<span class="mf-pw-check-icon">' + CHECK_ICON + '</span><span>' + rule.label + '</span>';
      checklist.appendChild(item);
    });
    wrap.insertAdjacentElement('afterend', checklist);

    function updateChecklist() {
      var value = passwordInput.value;
      RULES.forEach(function (rule, i) {
        var item = checklist.querySelector('[data-rule-index="' + i + '"]');
        if (item) item.classList.toggle('mf-met', rule.test(value));
      });
    }

    function updateVisibility() {
      var isSignup = submitLabel && submitLabel.textContent.trim() === 'Create account';
      checklist.classList.toggle('mf-visible', !!isSignup);
    }

    passwordInput.addEventListener('input', updateChecklist);
    updateChecklist();
    updateVisibility();

    // Re-check visibility whenever signup/signin mode toggles.
    var modeToggleBtn = document.getElementById('mf-btn-mode-toggle');
    if (modeToggleBtn) modeToggleBtn.addEventListener('click', function () {
      window.setTimeout(updateVisibility, 0);
    });
  }

  // The password field only exists once the modal's email panel has been
  // built (mf-signin.js builds it once at load, hidden) — safe to init
  // immediately, but guard with a small retry in case of load-order edge cases.
  if (document.getElementById('mf-input-password')) {
    init();
  } else {
    var tries = 0;
    var retry = window.setInterval(function () {
      tries++;
      if (document.getElementById('mf-input-password') || tries > 20) {
        window.clearInterval(retry);
        init();
      }
    }, 100);
  }
})();
