/**
 * MathForge — Email signup claim flow (bug workaround)
 * (layers on top of mf-signin.js — modifies neither it nor any other file)
 * ─────────────────────────────────────────────────────────────────────────
 * BACKGROUND: mf-signin.js's signup path calls
 * mfClient.auth.updateUser({ email, password }) on the anonymous session,
 * which hits supabase/supabase#41125 — it can silently send a clickable
 * link instead of an OTP code, and that link resolves on whichever device
 * opens it, not the device the signup started on. This file replaces the
 * signup submission path with plain mfClient.auth.signUp(), which reliably
 * supports OTP-by-code, and manually re-attaches the guest's progress data
 * to the new account after verification instead of relying on Supabase's
 * identity-linking.
 *
 * WHY NOT CLONE-AND-REPLACE (the technique used for the Google button):
 * mf-signin.js keeps direct references to #mf-input-email, #mf-input-
 * password and #mf-email-submit-label (all children of #mf-email-form) in
 * its own closure, and reuses them elsewhere — mode-toggle copy updates,
 * emailForm.reset() on modal open, focus management. Cloning and replacing
 * the whole <form> would leave those cached references pointing at a
 * detached node, silently breaking the sign-IN path (which this file must
 * leave untouched) and the mode-toggle UI. Instead, this file intercepts
 * the form's 'submit' event at the genuine capturing phase on `document` —
 * a real ancestor of the form, so this reliably runs before mf-signin.js's
 * own target-phase listener regardless of registration order (unlike a
 * same-node capture listener, which the earlier files already established
 * doesn't preempt anything). Which mode is active is read synchronously
 * from the DOM (the submit label's text), so the decision to intercept can
 * be made — and preventDefault() called — before anything async happens.
 * This also correctly catches Enter-key submission, not just button
 * clicks, which a click-only interception would have missed.
 *
 * WHY OTP UI ISN'T LITERALLY REUSED FROM mf-account-panel.js: that file's
 * OTP block is built by a function private to its own closure, never
 * exposed on `window`. This file reuses the exact same CSS classes
 * (.mf-otp-block / .mf-otp-row / .mf-otp-hint etc., already loaded by that
 * file's stylesheet) so the result is visually identical, with a small
 * fallback stylesheet defined here only if that file's styles aren't
 * present for some reason.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.mfClient === 'undefined') {
    console.error('[mf-email-claim] mfClient not found. Aborting.');
    return;
  }

  var mfClient = window.mfClient;
  var PROGRESS_TABLE = 'user_progress';
  var RESEND_COOLDOWN_MS = 30000;

  // ── Fallback OTP styles (only if mf-account-panel.js's aren't loaded) ──
  if (!document.getElementById('mf-account-panel-styles') && !document.getElementById('mf-email-claim-otp-fallback-styles')) {
    var fallbackStyle = document.createElement('style');
    fallbackStyle.id = 'mf-email-claim-otp-fallback-styles';
    fallbackStyle.textContent = [
      '.mf-otp-block { margin-top: 14px; }',
      '.mf-otp-row { display: flex; gap: 8px; }',
      '.mf-otp-row input {',
      '  flex: 1; min-width: 0; box-sizing: border-box; background: #050505;',
      '  border: 1px solid rgba(228,221,208,0.16); border-radius: 6px;',
      '  padding: 10px 12px; font-family: var(--mf-mono, "JetBrains Mono", monospace);',
      '  font-size: 15px; letter-spacing: 0.3em; text-align: center;',
      '  color: var(--mf-parchment, #e4ddd0);',
      '}',
      '.mf-otp-row input:focus { outline: none; border-color: var(--mf-gold, #a8883a); }',
      '.mf-otp-row button {',
      '  flex-shrink: 0; background: var(--mf-gold, #a8883a); border: 1px solid var(--mf-gold, #a8883a);',
      '  color: #0c0c0c; font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 12px;',
      '  font-weight: 500; padding: 0 16px; border-radius: 6px; cursor: pointer;',
      '}',
      '.mf-otp-row button:disabled { opacity: 0.6; cursor: default; }',
      '.mf-otp-hint {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 10.5px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); margin: 0 0 8px;',
      '}'
    ].join('\n');
    document.head.appendChild(fallbackStyle);
  }

  var STYLE_ID = 'mf-email-claim-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-otp-resend {',
      '  display: block; margin-top: 10px; background: none; border: none;',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 10.5px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); cursor: pointer;',
      '  text-decoration: underline; text-underline-offset: 3px; padding: 2px;',
      '}',
      '.mf-otp-resend:hover:not(:disabled) { color: var(--mf-parchment, #e4ddd0); }',
      '.mf-otp-resend:disabled { cursor: default; opacity: 0.6; text-decoration: none; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── State for the in-flight claim (spans submit → OTP verify) ─────────
  var pending = null; // { email, password, guestUserId, capturedProgress }

  function isDuplicateSignupError(err) {
    if (!err) return false;
    var msg = (err.message || '').toLowerCase();
    var code = (err.code || '').toLowerCase();
    return (
      msg.indexOf('already') !== -1 ||
      msg.indexOf('registered') !== -1 ||
      code.indexOf('already') !== -1 ||
      code === 'user_already_exists' ||
      err.status === 422 ||
      err.status === 400
    );
  }

  function setLoading(btn, labelEl, isLoading) {
    btn.disabled = isLoading;
    if (isLoading) {
      btn.dataset.prevHtml = labelEl.innerHTML;
      labelEl.innerHTML = '<span class="mf-btn-spinner"></span>';
    } else if (btn.dataset.prevHtml) {
      labelEl.innerHTML = btn.dataset.prevHtml;
    }
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.className = 'mf-error mf-visible';
  }

  function showSuccess(el, msg) {
    el.textContent = msg;
    el.className = 'mf-success mf-visible';
  }

  function clearMsg(el, cls) {
    el.textContent = '';
    el.className = cls;
  }

  async function copyProgressToNewAccount(newUserId, progressData) {
    if (!newUserId || !progressData) return;
    try {
      await mfClient.from(PROGRESS_TABLE).upsert({
        user_id: newUserId,
        data: progressData,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('[mf-email-claim] failed to upsert progress for new account', err);
    }
    if (typeof window.saveProgress === 'function') {
      try { window.saveProgress(progressData); } catch (err) { console.error('[mf-email-claim] saveProgress failed', err); }
    }
  }

  function buildOtpBlock() {
    var block = document.createElement('div');
    block.className = 'mf-otp-block';
    block.innerHTML =
      '<p class="mf-otp-hint">Enter the 6-digit code from that email to finish right here:</p>' +
      '<div class="mf-otp-row">' +
        '<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="000000" aria-label="6-digit verification code">' +
        '<button type="button" class="mf-otp-verify">Verify</button>' +
      '</div>' +
      '<div class="mf-error" style="margin-top:8px;"></div>' +
      '<button type="button" class="mf-otp-resend">Resend code</button>';

    var input = block.querySelector('input');
    var verifyBtn = block.querySelector('.mf-otp-verify');
    var errorEl = block.querySelector('.mf-error');
    var resendBtn = block.querySelector('.mf-otp-resend');

    verifyBtn.addEventListener('click', async function () {
      var code = input.value.trim();
      clearMsg(errorEl, 'mf-error');

      if (!pending) {
        showError(errorEl, 'Something went wrong — please refresh and try signing up again.');
        return;
      }
      if (!/^\d{6}$/.test(code)) {
        showError(errorEl, 'Enter the 6-digit code exactly as it appeared in the email.');
        return;
      }

      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying\u2026';

      try {
        var res = await mfClient.auth.verifyOtp({ email: pending.email, token: code, type: 'signup' });
        if (res.error) throw res.error;

        var newUser = (res.data && (res.data.user || (res.data.session && res.data.session.user))) || null;
        var newUserId = newUser ? newUser.id : null;

        verifyBtn.textContent = 'Verified';
        await copyProgressToNewAccount(newUserId, pending.capturedProgress);
        pending = null;
        window.setTimeout(function () { location.reload(); }, 600);
      } catch (err) {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify';
        showError(errorEl, (err && err.message) || 'That code didn\u2019t work. Check it and try again.');
        // Input value deliberately left as-is — easier to fix one mistyped digit.
      }
    });

    var resendCooldownUntil = 0;
    resendBtn.addEventListener('click', async function () {
      if (!pending || Date.now() < resendCooldownUntil) return;
      resendBtn.disabled = true;
      var original = resendBtn.textContent;
      resendBtn.textContent = 'Sending\u2026';
      try {
        var res = await mfClient.auth.signUp({ email: pending.email, password: pending.password });
        if (res.error) throw res.error;
        resendCooldownUntil = Date.now() + RESEND_COOLDOWN_MS;
        startResendCooldownDisplay();
      } catch (err) {
        resendBtn.disabled = false;
        resendBtn.textContent = original;
        showError(errorEl, (err && err.message) || 'Could not resend the code. Try again shortly.');
      }
    });

    function startResendCooldownDisplay() {
      var remaining = Math.ceil(RESEND_COOLDOWN_MS / 1000);
      resendBtn.textContent = 'Resend code (' + remaining + 's)';
      var tick = window.setInterval(function () {
        remaining -= 1;
        if (remaining <= 0) {
          window.clearInterval(tick);
          resendBtn.disabled = false;
          resendBtn.textContent = 'Resend code';
        } else {
          resendBtn.textContent = 'Resend code (' + remaining + 's)';
        }
      }, 1000);
    }

    return block;
  }

  async function handleSignupSubmit() {
    var emailInput = document.getElementById('mf-input-email');
    var passwordInput = document.getElementById('mf-input-password');
    var submitBtn = document.getElementById('mf-btn-email-submit');
    var submitLabel = document.getElementById('mf-email-submit-label');
    var errorEl = document.getElementById('mf-error-email');
    var successEl = document.getElementById('mf-success-email');
    var modeToggleBtn = document.getElementById('mf-btn-mode-toggle');

    clearMsg(errorEl, 'mf-error');
    clearMsg(successEl, 'mf-success');

    var existingOtp = document.querySelector('.mf-otp-block');
    if (existingOtp) existingOtp.remove();

    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!email || !password) {
      showError(errorEl, 'Enter both an email and a password.');
      return;
    }
    if (password.length < 6) {
      showError(errorEl, 'Password must be at least 6 characters.');
      return;
    }

    setLoading(submitBtn, submitLabel, true);

    try {
      var sessionRes = await mfClient.auth.getSession();
      var guestSession = sessionRes && sessionRes.data ? sessionRes.data.session : null;
      var guestUserId = guestSession && guestSession.user ? guestSession.user.id : null;
      var capturedProgress = (typeof window.loadProgress === 'function') ? window.loadProgress() : null;

      var signUpRes = await mfClient.auth.signUp({ email: email, password: password });
      if (signUpRes.error) throw signUpRes.error;

      pending = { email: email, password: password, guestUserId: guestUserId, capturedProgress: capturedProgress };

      setLoading(submitBtn, submitLabel, false);

      // If the project has email confirmation disabled, signUp() may
      // already return an active session — no OTP step needed.
      if (signUpRes.data && signUpRes.data.session) {
        var immediateUserId = signUpRes.data.session.user ? signUpRes.data.session.user.id : null;
        showSuccess(successEl, 'Account created. Bringing your progress along\u2026');
        await copyProgressToNewAccount(immediateUserId, capturedProgress);
        pending = null;
        window.setTimeout(function () { location.reload(); }, 600);
        return;
      }

      showSuccess(successEl, 'Check your inbox for a 6-digit code to confirm ' + email + '.');
      successEl.insertAdjacentElement('afterend', buildOtpBlock());
    } catch (err) {
      setLoading(submitBtn, submitLabel, false);

      if (isDuplicateSignupError(err)) {
        showError(errorEl, 'This email already has an account. Try signing in instead.');
        if (modeToggleBtn) modeToggleBtn.click();
      } else {
        showError(errorEl, (err && err.message) || 'Something went wrong. Please try again.');
      }
    }
  }

  // Genuine capturing-phase listener on `document` (a real ancestor of the
  // form) — reliably runs before mf-signin.js's own submit listener, and
  // catches both button-click and Enter-key submission. Mode is read
  // synchronously from the DOM so the decision (and any preventDefault())
  // happens before anything async.
  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'mf-email-form') return;

    var submitLabel = document.getElementById('mf-email-submit-label');
    var isSignupMode = submitLabel && submitLabel.textContent.trim() === 'Create account';
    if (!isSignupMode) return; // sign-in mode — let mf-signin.js's original (unaffected) path run

    e.preventDefault();
    e.stopPropagation();
    handleSignupSubmit();
  }, true);
})();
