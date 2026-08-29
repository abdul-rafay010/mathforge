/**
 * MathForge — Password recovery overlay
 * ─────────────────────────────────────────────────────────────────────────
 * Listens for Supabase's PASSWORD_RECOVERY auth event (fired when a
 * password-reset link lands the user back with a temporary recovery
 * session) and shows a form to set a new password. Reuses mf-signin.js's
 * .mf-backdrop styling for visual consistency.
 *
 * Deliberately NOT dismissible via backdrop click or Escape — the user
 * arrived here specifically to finish setting a password, and leaving
 * mid-recovery-session in a half state is worse than a slightly insistent
 * overlay. The close (×) button still works.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.mfClient === 'undefined') {
    console.error('[mf-password-reset] mfClient not found. Aborting.');
    return;
  }

  var mfClient = window.mfClient;

  var STYLE_ID = 'mf-password-reset-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-reset-modal { max-width: 360px; }',
      '.mf-reset-title {',
      '  font-family: var(--mf-display, "Cormorant Garamond", serif); font-weight: 500;',
      '  font-size: 24px; color: var(--mf-parchment, #e4ddd0); margin: 0 0 20px;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  var backdrop = document.createElement('div');
  backdrop.className = 'mf-backdrop';
  backdrop.hidden = true;
  backdrop.innerHTML =
    '<div class="mf-modal mf-reset-modal" role="dialog" aria-modal="true" aria-labelledby="mf-reset-title">' +
      '<button type="button" class="mf-modal-close" id="mf-reset-close" aria-label="Close">&times;</button>' +
      '<h2 class="mf-reset-title" id="mf-reset-title">Set a new password</h2>' +
      '<div class="mf-error" id="mf-reset-error"></div>' +
      '<div class="mf-success" id="mf-reset-success"></div>' +
      '<form id="mf-reset-form" novalidate>' +
        '<div class="mf-field">' +
          '<label for="mf-reset-password">New password</label>' +
          '<input type="password" id="mf-reset-password" autocomplete="new-password" required minlength="6">' +
        '</div>' +
        '<div class="mf-field">' +
          '<label for="mf-reset-password-confirm">Confirm password</label>' +
          '<input type="password" id="mf-reset-password-confirm" autocomplete="new-password" required minlength="6">' +
        '</div>' +
        '<button type="submit" class="mf-btn mf-btn-primary" id="mf-reset-submit">' +
          '<span class="mf-btn-label" id="mf-reset-submit-label">Set password</span>' +
        '</button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(backdrop);

  var closeBtn = document.getElementById('mf-reset-close');
  var form = document.getElementById('mf-reset-form');
  var passwordInput = document.getElementById('mf-reset-password');
  var confirmInput = document.getElementById('mf-reset-password-confirm');
  var submitBtn = document.getElementById('mf-reset-submit');
  var submitLabel = document.getElementById('mf-reset-submit-label');
  var errorEl = document.getElementById('mf-reset-error');
  var successEl = document.getElementById('mf-reset-success');

  function clearMsgs() {
    errorEl.textContent = '';
    errorEl.className = 'mf-error';
    successEl.textContent = '';
    successEl.className = 'mf-success';
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.className = 'mf-error mf-visible';
  }

  function showSuccess(msg) {
    successEl.textContent = msg;
    successEl.className = 'mf-success mf-visible';
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.dataset.prevHtml = submitLabel.innerHTML;
      submitLabel.innerHTML = '<span class="mf-btn-spinner"></span>';
    } else if (submitBtn.dataset.prevHtml) {
      submitLabel.innerHTML = submitBtn.dataset.prevHtml;
    }
  }

  function openOverlay() {
    clearMsgs();
    form.reset();
    backdrop.hidden = false;
    void backdrop.offsetWidth;
    backdrop.classList.add('mf-open');
    document.body.style.overflow = 'hidden';
    passwordInput.focus();
    // No backdrop-click or Escape wiring, deliberately — see header note.
  }

  function closeOverlay() {
    backdrop.classList.remove('mf-open');
    document.body.style.overflow = '';
    window.setTimeout(function () { backdrop.hidden = true; }, 200);
  }

  closeBtn.addEventListener('click', closeOverlay);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearMsgs();

    var password = passwordInput.value;
    var confirm = confirmInput.value;

    if (!password || password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      showError('Passwords don\u2019t match.');
      return;
    }

    setLoading(true);
    try {
      var res = await mfClient.auth.updateUser({ password: password });
      if (res.error) throw res.error;
      setLoading(false);
      showSuccess('Password updated.');
      window.setTimeout(function () {
        closeOverlay();
        location.reload();
      }, 900);
    } catch (err) {
      setLoading(false);
      showError((err && err.message) || 'Could not update your password. Try again.');
    }
  });

  mfClient.auth.onAuthStateChange(function (event) {
    if (event === 'PASSWORD_RECOVERY') openOverlay();
  });
})();
