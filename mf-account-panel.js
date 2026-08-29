/**
 * MathForge — Account panel & auth-flow hardening
 * (layers on top of mf-signin.js AND mf-account-extras.js — modifies neither)
 * ─────────────────────────────────────────────────────────────────────────
 * Load order:
 *   <script src="mf-signin.js" defer></script>
 *   <script src="mf-account-extras.js" defer></script>
 *   <script src="mf-account-panel.js" defer></script>
 *
 * Adds:
 *   1. Fixed Google button behavior (link-first, fall back to plain OAuth
 *      sign-in only on an "already linked to a different account" error).
 *   2. A full-screen "Signing you in…" overlay while an OAuth redirect
 *      resolves.
 *   3. Inline 6-digit OTP entry after a successful email/password signup,
 *      so verification doesn't require leaving the device.
 *   4. A larger "Manage account" panel (Profile / Security / Data & Privacy
 *      tabs) reached from a new button inside mf-account-extras.js's
 *      popover.
 *
 * A few of these needed a real design decision because of how JS module
 * boundaries work across independently-loaded files — each is called out
 * in a comment at the point it matters, same as mf-account-extras.js did.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.mfClient === 'undefined') {
    console.error('[mf-account-panel] mfClient (Supabase client) not found on window. Aborting.');
    return;
  }

  var mfClient = window.mfClient;
  var PROGRESS_TABLE = 'user_progress';

  // ── 2. OAuth-redirect loading overlay ──────────────────────────────────
  // Runs first, before anything else in this file, so it shows as early as
  // possible. It reuses mf-signin.js's existing `.mf-backdrop` class for
  // the dark/blurred background — that class is already loaded by the time
  // this file runs (script order), so no CSS is duplicated for it.
  (function handleOAuthReturnOverlay() {
    var looksLikeOAuthReturn =
      /access_token=/.test(window.location.hash) ||
      /[?&]code=/.test(window.location.search);

    if (!looksLikeOAuthReturn) return;

    var overlay = document.createElement('div');
    overlay.className = 'mf-backdrop mf-open'; // reuse existing backdrop styling
    overlay.style.zIndex = '9999'; // above the sign-in modal's own backdrop, just in case
    overlay.innerHTML =
      '<div class="mf-oauth-loading">' +
        '<div class="mf-oauth-spinner"></div>' +
        '<div class="mf-oauth-loading-text">Signing you in&hellip;</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var removed = false;
    function removeOverlay() {
      if (removed) return;
      removed = true;
      overlay.style.opacity = '0';
      window.setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 200);
    }

    var sub = mfClient.auth.onAuthStateChange(function (_event, session) {
      if (session) removeOverlay();
    });

    // Safety net — never leave the user staring at a stuck overlay.
    window.setTimeout(function () {
      removeOverlay();
      try { sub.data.subscription.unsubscribe(); } catch (e) { /* ignore */ }
    }, 3000);
  })();

  // ── Shared styles for the pieces that don't reuse existing classes ─────
  var STYLE_ID = 'mf-account-panel-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-oauth-loading { display: flex; flex-direction: column; align-items: center; gap: 14px; }',
      '.mf-oauth-spinner {',
      '  width: 30px; height: 30px; border-radius: 50%;',
      '  border: 3px solid rgba(228,221,208,0.15); border-top-color: var(--mf-gold, #a8883a);',
      '  animation: mf-panel-spin 800ms linear infinite;',
      '}',
      '@keyframes mf-panel-spin { to { transform: rotate(360deg); } }',
      '.mf-oauth-loading-text {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 12.5px;',
      '  color: var(--mf-parchment, #e4ddd0); letter-spacing: 0.02em;',
      '}',
      '',
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
      '.mf-otp-row button:hover:not(:disabled) { filter: brightness(1.08); }',
      '.mf-otp-row button:disabled { opacity: 0.6; cursor: default; }',
      '.mf-otp-hint {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 10.5px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); margin: 0 0 8px;',
      '}',

      '.mf-manage-btn {',
      '  width: 100%; text-align: left; background: transparent; border: none;',
      '  color: var(--mf-gold, #a8883a); font-family: var(--mf-mono, "JetBrains Mono", monospace);',
      '  font-size: 12px; font-weight: 500; padding: 8px 6px; border-radius: 6px; cursor: pointer;',
      '  transition: background 140ms ease;',
      '}',
      '.mf-manage-btn:hover { background: rgba(168,136,58,0.08); }',

      '.mf-manage-modal { max-width: 600px; padding: 0; overflow: hidden; }',
      '.mf-manage-body { display: flex; min-height: 360px; }',
      '.mf-manage-tabs {',
      '  width: 160px; flex-shrink: 0; background: #070707;',
      '  border-right: 1px solid rgba(228,221,208,0.08); padding: 54px 10px 20px;',
      '}',
      '.mf-manage-tab {',
      '  display: block; width: 100%; text-align: left; background: transparent; border: none;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); font-family: var(--mf-mono, "JetBrains Mono", monospace);',
      '  font-size: 12px; padding: 9px 12px; border-radius: 6px; cursor: pointer; margin-bottom: 2px;',
      '  transition: background 140ms ease, color 140ms ease;',
      '}',
      '.mf-manage-tab:hover { color: var(--mf-parchment, #e4ddd0); background: rgba(228,221,208,0.05); }',
      '.mf-manage-tab.mf-active { color: var(--mf-parchment, #e4ddd0); background: rgba(168,136,58,0.1); }',
      '.mf-manage-panels { flex: 1; padding: 54px 32px 28px; }',
      '.mf-manage-panel { display: none; }',
      '.mf-manage-panel.mf-active { display: block; }',
      '.mf-manage-panel h3 {',
      '  font-family: var(--mf-display, "Cormorant Garamond", serif); font-weight: 500;',
      '  font-size: 21px; color: var(--mf-parchment, #e4ddd0); margin: 0 0 18px;',
      '}',
      '.mf-manage-readonly {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 13px;',
      '  color: var(--mf-parchment, #e4ddd0); background: #050505;',
      '  border: 1px solid rgba(228,221,208,0.12); border-radius: 6px;',
      '  padding: 10px 12px; margin-bottom: 16px;',
      '}',
      '.mf-manage-note {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace); font-size: 11px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62)); line-height: 1.5; margin: 0 0 16px;',
      '}',
      '.mf-manage-danger-zone {',
      '  margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(201,117,107,0.18);',
      '}',

      '@media (max-width: 640px) {',
      '  .mf-manage-modal { max-width: calc(100vw - 32px); }',
      '  .mf-manage-body { flex-direction: column; }',
      '  .mf-manage-tabs {',
      '    width: 100%; display: flex; gap: 4px; padding: 46px 16px 10px;',
      '    border-right: none; border-bottom: 1px solid rgba(228,221,208,0.08); overflow-x: auto;',
      '  }',
      '  .mf-manage-panels { padding: 20px 20px 24px; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Cached session (own subscription, mirrors the pattern already used
  //    in mf-account-extras.js — each file keeps its own copy rather than
  //    reaching into another file's closure, which isn't possible anyway) ──
  var cachedSession = null;
  mfClient.auth.getSession().then(function (res) {
    cachedSession = res && res.data ? res.data.session : null;
  });
  mfClient.auth.onAuthStateChange(function (_event, session) {
    cachedSession = session;
  });

  function waitFor(checkFn, cb, timeoutMs) {
    var existing = checkFn();
    if (existing) { cb(existing); return; }
    var observer = new MutationObserver(function () {
      var found = checkFn();
      if (found) {
        observer.disconnect();
        cb(found);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    if (timeoutMs) {
      window.setTimeout(function () { observer.disconnect(); }, timeoutMs);
    }
  }

  // ── 1. Google button fix ────────────────────────────────────────────────
  // DESIGN NOTE: capture:true on the same node as mf-signin.js's own
  // listener wouldn't reliably run first — as established in
  // mf-account-extras.js, same-node listener order is registration order,
  // not capture order. Rather than fight that with an ancestor-level
  // capture listener (workable, but leaves the original handler still
  // attached and racing to attempt its own, wrong, linkIdentity/OAuth call
  // in parallel), the cleanest fix is exactly what the brief suggested as
  // an alternative: clone the button to strip mf-signin.js's listener
  // entirely, then attach one correct handler in its place. This also
  // sidesteps needing to duplicate mf-signin.js's internal setLoading/
  // clearMessages helpers — this handler manages its own loading/error
  // state on the same #mf-error-main element mf-signin.js already uses.
  waitFor(
    function () { return document.getElementById('mf-btn-google'); },
    function (originalBtn) {
      var freshBtn = originalBtn.cloneNode(true);
      originalBtn.replaceWith(freshBtn);

      var label = freshBtn.querySelector('.mf-btn-label');
      var errorMain = document.getElementById('mf-error-main');

      function setLoading(isLoading) {
        freshBtn.disabled = isLoading;
        if (isLoading) {
          freshBtn.dataset.prevHtml = label.innerHTML;
          label.innerHTML = '<span class="mf-btn-spinner"></span>';
        } else if (freshBtn.dataset.prevHtml) {
          label.innerHTML = freshBtn.dataset.prevHtml;
        }
      }

      function showError(err) {
        if (!errorMain) return;
        errorMain.textContent = (err && err.message) || 'Something went wrong. Please try again.';
        errorMain.className = 'mf-error mf-visible';
      }

      function isAlreadyLinkedError(err) {
        if (!err) return false;
        var msg = (err.message || '').toLowerCase();
        var code = (err.code || '').toLowerCase();
        var status = err.status;
        return (
          msg.indexOf('already') !== -1 ||
          msg.indexOf('linked') !== -1 ||
          code.indexOf('already') !== -1 ||
          code.indexOf('linked') !== -1 ||
          status === 422 ||
          status === 409
        );
      }

      freshBtn.addEventListener('click', async function () {
        if (errorMain) { errorMain.textContent = ''; errorMain.className = 'mf-error'; }
        setLoading(true);
        try {
          var linkResult = await mfClient.auth.linkIdentity({ provider: 'google' });
          if (linkResult && linkResult.error) throw linkResult.error;
          // No error → browser is being redirected to Google right now.
        } catch (err) {
          if (isAlreadyLinkedError(err)) {
            try {
              var oauthResult = await mfClient.auth.signInWithOAuth({ provider: 'google' });
              if (oauthResult && oauthResult.error) throw oauthResult.error;
              // Redirecting to Google now.
            } catch (err2) {
              setLoading(false);
              showError(err2);
            }
          } else {
            setLoading(false);
            showError(err);
          }
        }
      });
    }
  );

  // ── 3. Inline OTP verification after signup ─────────────────────────────
  // mf-signin.js can't be told to also render this, so we watch its
  // #mf-success-email node for the moment it becomes visible/non-empty and
  // inject our own UI right after it. The email address isn't retrievable
  // any other way (it lives inside mf-signin.js's closure and the form is
  // reset immediately after success) — but mf-signin.js's own success
  // copy embeds it in plain text ("Check your inbox to confirm
  // you@example.com..."), so we extract it from there with a regex.
  waitFor(
    function () { return document.getElementById('mf-success-email'); },
    function (successEl) {
      var otpBlock = null;

      var observer = new MutationObserver(function () {
        var isVisible = successEl.classList.contains('mf-visible') && successEl.textContent.trim() !== '';

        if (isVisible && !otpBlock) {
          var emailMatch = successEl.textContent.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
          var email = emailMatch ? emailMatch[0] : null;
          otpBlock = buildOtpBlock(email);
          successEl.insertAdjacentElement('afterend', otpBlock);
        } else if (!isVisible && otpBlock) {
          otpBlock.remove();
          otpBlock = null;
        }
      });

      observer.observe(successEl, { attributes: true, attributeFilter: ['class'], childList: true, characterData: true, subtree: true });
    }
  );

  function buildOtpBlock(email) {
    var block = document.createElement('div');
    block.className = 'mf-otp-block';
    block.innerHTML =
      (email
        ? ''
        : '<div class="mf-error mf-visible" style="margin-bottom:10px;">Couldn\u2019t detect your email automatically — refresh and try signing up again if verification fails below.</div>') +
      '<p class="mf-otp-hint">Enter the 6-digit code from that email to finish right here:</p>' +
      '<div class="mf-otp-row">' +
        '<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="000000" aria-label="6-digit verification code">' +
        '<button type="button">Verify</button>' +
      '</div>' +
      '<div class="mf-error" style="margin-top:8px;"></div>';

    var input = block.querySelector('input');
    var verifyBtn = block.querySelector('button');
    var errorEl = block.querySelector('.mf-error:last-child');

    verifyBtn.addEventListener('click', async function () {
      var code = input.value.trim();
      errorEl.className = 'mf-error';
      errorEl.textContent = '';

      if (!email) {
        errorEl.textContent = 'Missing email address — please refresh and try signing up again.';
        errorEl.className = 'mf-error mf-visible';
        return;
      }
      if (!/^\d{6}$/.test(code)) {
        errorEl.textContent = 'Enter the 6-digit code exactly as it appeared in the email.';
        errorEl.className = 'mf-error mf-visible';
        return;
      }

      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying\u2026';

      try {
        var res = await mfClient.auth.verifyOtp({ email: email, token: code, type: 'email_change' });
        if (res.error) throw res.error;
        verifyBtn.textContent = 'Verified';
        window.setTimeout(function () { location.reload(); }, 600);
      } catch (err) {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify';
        errorEl.textContent = (err && err.message) || 'That code didn\u2019t work. Check it and try again.';
        errorEl.className = 'mf-error mf-visible';
        // Deliberately not clearing `input.value` — a mistyped single digit
        // is the common case, and re-typing all six is unnecessary friction.
      }
    });

    return block;
  }

  // ── 4. Full account-management panel ────────────────────────────────────
  // The small popover's markup is rebuilt from scratch by
  // mf-account-extras.js every time it opens (a fresh innerHTML write), so
  // rather than a one-shot insert, a persistent observer re-adds our
  // "Manage account →" entry after each render.
  var manageModal = buildManageModal();
  document.body.appendChild(manageModal);

  waitFor(
    function () { return document.querySelector('.mf-acct-pop'); },
    function (popover) {
      var observer = new MutationObserver(ensureManageButton);
      observer.observe(popover, { childList: true });
      ensureManageButton();

      function ensureManageButton() {
        var signOutBtn = popover.querySelector('#mf-acct-signout');
        if (!signOutBtn || popover.querySelector('#mf-open-manage')) return;
        var manageBtn = document.createElement('button');
        manageBtn.type = 'button';
        manageBtn.id = 'mf-open-manage';
        manageBtn.className = 'mf-manage-btn';
        manageBtn.textContent = 'Manage account \u2192';
        signOutBtn.insertAdjacentElement('beforebegin', manageBtn);
        manageBtn.addEventListener('click', function () {
          popover.classList.remove('mf-open');
          window.setTimeout(function () { popover.hidden = true; }, 180);
          openManageModal();
        });
      }
    }
  );

  function buildManageModal() {
    var backdrop = document.createElement('div');
    backdrop.className = 'mf-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<div class="mf-modal mf-manage-modal" role="dialog" aria-modal="true" aria-labelledby="mf-manage-title">' +
        '<button type="button" class="mf-modal-close" id="mf-manage-close" aria-label="Close" style="z-index:1;">&times;</button>' +
        '<div class="mf-manage-body">' +
          '<div class="mf-manage-tabs">' +
            '<button type="button" class="mf-manage-tab mf-active" data-tab="profile">Profile</button>' +
            '<button type="button" class="mf-manage-tab" data-tab="security">Security</button>' +
            '<button type="button" class="mf-manage-tab" data-tab="data">Data &amp; Privacy</button>' +
          '</div>' +
          '<div class="mf-manage-panels">' +

            '<div class="mf-manage-panel mf-active" data-panel="profile">' +
              '<h3 id="mf-manage-title">Profile</h3>' +
              '<div class="mf-field">' +
                '<label for="mf-manage-name-input">Display name</label>' +
                '<input type="text" id="mf-manage-name-input">' +
              '</div>' +
              '<button type="button" class="mf-btn mf-btn-primary" id="mf-manage-name-save" style="width:auto;padding-left:24px;padding-right:24px;">' +
                '<span class="mf-btn-label">Save</span>' +
              '</button>' +
              '<div class="mf-error" id="mf-manage-name-msg" style="margin-top:12px;"></div>' +
            '</div>' +

            '<div class="mf-manage-panel" data-panel="security">' +
              '<h3>Security</h3>' +
              '<div class="mf-field"><label>Email</label></div>' +
              '<div class="mf-manage-readonly" id="mf-manage-email"></div>' +
              '<button type="button" class="mf-btn mf-btn-outline" id="mf-manage-reset-pw" style="width:auto;padding-left:20px;padding-right:20px;">' +
                '<span class="mf-btn-label">Send password reset email</span>' +
              '</button>' +
              '<div class="mf-error" id="mf-manage-reset-msg" style="margin-top:12px;"></div>' +
            '</div>' +

            '<div class="mf-manage-panel" data-panel="data">' +
              '<h3>Data &amp; Privacy</h3>' +
              '<p class="mf-manage-note">Download a copy of everything saved to your account.</p>' +
              '<button type="button" class="mf-btn mf-btn-outline" id="mf-manage-export" style="width:auto;padding-left:20px;padding-right:20px;">' +
                '<span class="mf-btn-label">Export my data</span>' +
              '</button>' +
              '<div class="mf-error" id="mf-manage-export-msg" style="margin-top:12px;"></div>' +

              '<div class="mf-manage-danger-zone">' +
                '<p class="mf-manage-note">Permanently delete your saved progress and sign out. This can\u2019t be undone.</p>' +
                '<button type="button" class="mf-acct-btn mf-danger" id="mf-manage-delete" style="padding-left:0;">Delete my data</button>' +
                '<div class="mf-acct-confirm" id="mf-manage-confirm">' +
                  '<p>Delete everything and sign out?</p>' +
                  '<div class="mf-acct-confirm-row">' +
                    '<button type="button" class="mf-acct-confirm-cancel" id="mf-manage-confirm-cancel">Cancel</button>' +
                    '<button type="button" class="mf-acct-confirm-yes" id="mf-manage-confirm-yes">Yes, delete</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +

          '</div>' +
        '</div>' +
      '</div>';
    return backdrop;
  }

  function openManageModal() {
    var user = cachedSession && cachedSession.user;
    if (!user) return;

    var meta = user.user_metadata || {};
    manageModal.querySelector('#mf-manage-name-input').value = meta.display_name || meta.full_name || '';
    manageModal.querySelector('#mf-manage-email').textContent = user.email || '\u2014';

    ['#mf-manage-name-msg', '#mf-manage-reset-msg', '#mf-manage-export-msg'].forEach(function (sel) {
      var el = manageModal.querySelector(sel);
      el.className = 'mf-error';
      el.textContent = '';
    });
    manageModal.querySelector('#mf-manage-confirm').classList.remove('mf-visible');

    manageModal.hidden = false;
    void manageModal.offsetWidth;
    manageModal.classList.add('mf-open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onManageKeydown);
  }

  function closeManageModal() {
    manageModal.classList.remove('mf-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onManageKeydown);
    window.setTimeout(function () { manageModal.hidden = true; }, 200);
  }

  function onManageKeydown(e) {
    if (e.key === 'Escape') closeManageModal();
  }

  manageModal.querySelector('#mf-manage-close').addEventListener('click', closeManageModal);
  manageModal.addEventListener('click', function (e) {
    if (e.target === manageModal) closeManageModal();
  });

  var tabs = manageModal.querySelectorAll('.mf-manage-tab');
  var panels = manageModal.querySelectorAll('.mf-manage-panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('mf-active'); });
      panels.forEach(function (p) { p.classList.remove('mf-active'); });
      tab.classList.add('mf-active');
      manageModal.querySelector('.mf-manage-panel[data-panel="' + tab.dataset.tab + '"]').classList.add('mf-active');
    });
  });

  // Profile — same kind of updateUser call mf-account-extras.js's popover
  // uses; each panel keeps its own small copy rather than sharing a
  // reference, since the two files can't see into each other's closures.
  manageModal.querySelector('#mf-manage-name-save').addEventListener('click', async function () {
    var btn = this;
    var input = manageModal.querySelector('#mf-manage-name-input');
    var msg = manageModal.querySelector('#mf-manage-name-msg');
    btn.disabled = true;
    msg.className = 'mf-error';
    msg.textContent = '';
    try {
      var res = await mfClient.auth.updateUser({ data: { display_name: input.value.trim() } });
      if (res.error) throw res.error;
      msg.textContent = 'Saved.';
      msg.className = 'mf-error mf-visible';
      msg.style.color = 'var(--mf-gold, #a8883a)';
    } catch (err) {
      msg.style.color = '';
      msg.textContent = (err && err.message) || 'Could not save. Try again.';
      msg.className = 'mf-error mf-visible';
    } finally {
      btn.disabled = false;
    }
  });

  // Security — same resetPasswordForEmail call as the forgot-password link.
  manageModal.querySelector('#mf-manage-reset-pw').addEventListener('click', async function () {
    var btn = this;
    var msg = manageModal.querySelector('#mf-manage-reset-msg');
    var user = cachedSession && cachedSession.user;
    if (!user || !user.email) return;
    btn.disabled = true;
    msg.className = 'mf-error';
    msg.textContent = '';
    try {
      var res = await mfClient.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin });
      if (res.error) throw res.error;
      msg.textContent = 'Check your inbox for a reset link.';
      msg.className = 'mf-error mf-visible';
      msg.style.color = 'var(--mf-gold, #a8883a)';
    } catch (err) {
      msg.style.color = '';
      msg.textContent = (err && err.message) || 'Could not send reset email. Try again.';
      msg.className = 'mf-error mf-visible';
    } finally {
      btn.disabled = false;
    }
  });

  // Data & Privacy — export.
  manageModal.querySelector('#mf-manage-export').addEventListener('click', async function () {
    var btn = this;
    var msg = manageModal.querySelector('#mf-manage-export-msg');
    var user = cachedSession && cachedSession.user;
    if (!user) return;
    btn.disabled = true;
    msg.className = 'mf-error';
    msg.textContent = '';
    try {
      var res = await mfClient.from(PROGRESS_TABLE).select('data').eq('user_id', user.id).single();
      if (res.error) throw res.error;
      var blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mathforge-data-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      msg.textContent = (err && err.message) || 'Could not export your data. Try again.';
      msg.className = 'mf-error mf-visible';
    } finally {
      btn.disabled = false;
    }
  });

  // Data & Privacy — delete.
  // DESIGN NOTE: mf-account-extras.js's deleteDataFlow() is not reachable
  // from here — it's a private function inside that file's own IIFE
  // closure, never exposed on `window`, and per the brief that file is not
  // to be modified to expose it. A DOM-delegation trick (synthetically
  // clicking that file's real #mf-acct-delete / #mf-acct-confirm-yes
  // buttons from here) was considered, since it would call the literal
  // original function — but it would require hiding that popover off-
  // screen while doing so, which would also hide any failure message the
  // original flow shows, silently swallowing errors. That's worse than a
  // small, honest duplication, so this panel calls the same two Supabase
  // operations directly (identical table name and call shape to
  // mf-account-extras.js's version) instead.
  var manageDeleteBtn = manageModal.querySelector('#mf-manage-delete');
  var manageConfirm = manageModal.querySelector('#mf-manage-confirm');
  manageDeleteBtn.addEventListener('click', function () {
    manageConfirm.classList.add('mf-visible');
  });
  manageModal.querySelector('#mf-manage-confirm-cancel').addEventListener('click', function () {
    manageConfirm.classList.remove('mf-visible');
  });
  manageModal.querySelector('#mf-manage-confirm-yes').addEventListener('click', async function () {
    var yesBtn = this;
    var user = cachedSession && cachedSession.user;
    if (!user) return;
    yesBtn.disabled = true;
    yesBtn.textContent = 'Deleting\u2026';
    try {
      var delRes = await mfClient.from(PROGRESS_TABLE).delete().eq('user_id', user.id);
      if (delRes.error) throw delRes.error;
      await mfClient.auth.signOut();
      location.reload();
    } catch (err) {
      yesBtn.disabled = false;
      yesBtn.textContent = 'Yes, delete';
      var existingErr = manageConfirm.querySelector('.mf-manage-delete-err');
      if (!existingErr) {
        existingErr = document.createElement('p');
        existingErr.className = 'mf-manage-delete-err';
        existingErr.style.color = '#c98a6b';
        existingErr.style.fontSize = '11px';
        existingErr.style.margin = '8px 0 0';
        manageConfirm.appendChild(existingErr);
      }
      existingErr.textContent = (err && err.message) || 'Something went wrong. Try again.';
    }
  });
})();
