/**
 * MathForge — Account extras (layered on top of mf-signin.js)
 * ─────────────────────────────────────────────────────────────────────────
 * Does NOT modify mf-signin.js. Load it AFTER mf-signin.js:
 *   <script src="mf-signin.js" defer></script>
 *   <script src="mf-account-extras.js" defer></script>
 *
 * Adds:
 *   1. A signed-in account popover (display name, sign out, delete data) —
 *      intercepts clicks on the existing .mf-nav-icon button when the user
 *      is a real (non-anonymous) account, so the sign-in modal doesn't open.
 *   2. A "Forgot password?" link inserted next to the existing modal's
 *      #mf-btn-mode-toggle.
 *   3. Friendlier copy + auto mode-switch for the "email already registered"
 *      case, via a light monkey-patch of mfClient.auth.updateUser.
 *
 * IMPLEMENTATION NOTE on step 1 — capture-phase interception:
 * The brief asked for a capturing (3rd arg `true`) listener on the SAME
 * button element as mf-signin.js's own click handler. On a single element,
 * the DOM spec fires listeners in registration order regardless of the
 * capture flag — capture only changes *propagation* order across ancestors,
 * not ordering among listeners on the same node. Since mf-signin.js's
 * listener is registered first (it loads first), a same-element capturing
 * listener registered here would NOT reliably run before it.
 * To actually guarantee interception, this file instead:
 *   - attaches its capturing listener to `document` (a real ancestor), so
 *     it fires during the genuine capturing phase, before the button's own
 *     listener ever runs, and
 *   - keeps a locally-cached session (kept fresh via its own
 *     onAuthStateChange subscription) so the capturing handler can decide
 *     synchronously whether to stopPropagation(). An `await` inside the
 *     click handler would resume too late — the event has already finished
 *     dispatching by the time an async continuation runs — so the check
 *     can't be done with a fresh `await getSession()` call inside the
 *     listener itself.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.mfClient === 'undefined') {
    console.error('[mf-account-extras] mfClient (Supabase client) not found on window. Aborting.');
    return;
  }

  var mfClient = window.mfClient;
  var PROGRESS_TABLE = 'user_progress';

  // ── Styles (reuse --mf-* vars from mf-signin.js if present) ───────────
  var STYLE_ID = 'mf-account-extras-styles';
  if (!document.getElementById(STYLE_ID)) {
    var rootStyles = getComputedStyle(document.documentElement);
    var hasVars = rootStyles.getPropertyValue('--mf-ink').trim() !== '';

    var style = document.createElement('style');
    style.id = STYLE_ID;

    var rules = [];

    if (!hasVars) {
      // Fallback definitions only — mf-signin.js already defines these,
      // this block only fires if that file's stylesheet isn't present.
      rules.push(
        ':root {',
        '  --mf-ink: #070707;',
        '  --mf-gold: #a8883a;',
        '  --mf-gold-soft: rgba(168,136,58,0.35);',
        '  --mf-parchment: #e4ddd0;',
        '  --mf-parchment-dim: rgba(228,221,208,0.62);',
        '  --mf-display: "Cormorant Garamond", serif;',
        '  --mf-mono: "JetBrains Mono", monospace;',
        '}'
      );
    }

    rules.push(
      '.mf-acct-pop {',
      '  position: fixed; width: 240px; background: #0c0c0c;',
      '  border: 1px solid rgba(168,136,58,0.25); border-radius: 10px;',
      '  padding: 16px; z-index: 9997; box-shadow: 0 18px 44px rgba(0,0,0,0.5);',
      '  font-family: var(--mf-mono); color: var(--mf-parchment);',
      '  transform: scale(0.96) translateY(4px); opacity: 0;',
      '  transition: transform 180ms cubic-bezier(0.2,0.8,0.2,1), opacity 180ms ease;',
      '  transform-origin: top right;',
      '}',
      '.mf-acct-pop.mf-open { transform: scale(1) translateY(0); opacity: 1; }',
      '.mf-acct-pop[hidden] { display: none; }',
      '',
      '.mf-acct-identity {',
      '  font-size: 12.5px; color: var(--mf-parchment);',
      '  margin: 0 0 12px; padding-bottom: 12px;',
      '  border-bottom: 1px solid rgba(228,221,208,0.1);',
      '  word-break: break-word; line-height: 1.4;',
      '}',
      '',
      '.mf-acct-field { margin-bottom: 12px; }',
      '.mf-acct-field label {',
      '  display: block; font-size: 9.5px; color: var(--mf-parchment-dim);',
      '  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px;',
      '}',
      '.mf-acct-row { display: flex; gap: 6px; }',
      '.mf-acct-row input {',
      '  flex: 1; min-width: 0; box-sizing: border-box; background: #050505;',
      '  border: 1px solid rgba(228,221,208,0.16); border-radius: 6px;',
      '  padding: 7px 9px; font-family: var(--mf-mono); font-size: 12px;',
      '  color: var(--mf-parchment);',
      '}',
      '.mf-acct-row input:focus { outline: none; border-color: var(--mf-gold); }',
      '.mf-acct-save {',
      '  flex-shrink: 0; background: var(--mf-gold); border: 1px solid var(--mf-gold);',
      '  color: #0c0c0c; font-family: var(--mf-mono); font-size: 11px; font-weight: 500;',
      '  padding: 0 12px; border-radius: 6px; cursor: pointer;',
      '}',
      '.mf-acct-save:hover:not(:disabled) { filter: brightness(1.08); }',
      '.mf-acct-save:disabled { opacity: 0.6; cursor: default; }',
      '.mf-acct-msg { font-size: 10.5px; color: var(--mf-gold); margin-top: 5px; min-height: 13px; }',
      '',
      '.mf-acct-btn {',
      '  width: 100%; text-align: left; background: transparent; border: none;',
      '  color: var(--mf-parchment-dim); font-family: var(--mf-mono); font-size: 12px;',
      '  padding: 8px 6px; border-radius: 6px; cursor: pointer;',
      '  transition: background 140ms ease, color 140ms ease;',
      '}',
      '.mf-acct-btn:hover { background: rgba(228,221,208,0.06); color: var(--mf-parchment); }',
      '.mf-acct-btn.mf-danger { color: #c9756b; }',
      '.mf-acct-btn.mf-danger:hover { background: rgba(201,117,107,0.08); color: #e0897d; }',
      '',
      '.mf-acct-divider { height: 1px; background: rgba(228,221,208,0.1); margin: 8px 0; }',
      '',
      '.mf-acct-confirm {',
      '  display: none; margin-top: 6px; padding: 10px; border-radius: 6px;',
      '  background: rgba(201,117,107,0.06); border: 1px solid rgba(201,117,107,0.25);',
      '}',
      '.mf-acct-confirm.mf-visible { display: block; }',
      '.mf-acct-confirm p { margin: 0 0 8px; font-size: 11px; color: var(--mf-parchment-dim); line-height: 1.4; }',
      '.mf-acct-confirm-row { display: flex; gap: 6px; }',
      '.mf-acct-confirm-row button {',
      '  flex: 1; font-family: var(--mf-mono); font-size: 11px; padding: 6px; border-radius: 5px; cursor: pointer;',
      '}',
      '.mf-acct-confirm-cancel { background: transparent; border: 1px solid rgba(228,221,208,0.2); color: var(--mf-parchment-dim); }',
      '.mf-acct-confirm-cancel:hover { color: var(--mf-parchment); }',
      '.mf-acct-confirm-yes { background: #c9756b; border: 1px solid #c9756b; color: #0c0c0c; font-weight: 500; }',
      '.mf-acct-confirm-yes:hover:not(:disabled) { filter: brightness(1.1); }',
      '.mf-acct-confirm-yes:disabled { opacity: 0.6; cursor: default; }',
      '',
      '.mf-forgot-link {',
      '  display: block; text-align: center; margin-top: 10px;',
      '  font-family: var(--mf-mono); font-size: 11px; color: var(--mf-parchment-dim);',
      '  background: none; border: none; cursor: pointer; width: 100%; padding: 2px;',
      '  text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(228,221,208,0.2);',
      '  opacity: 0.85;',
      '}',
      '.mf-forgot-link:hover { opacity: 1; color: var(--mf-parchment); }',
      '',
      '.mf-forgot-msg {',
      '  font-family: var(--mf-mono); font-size: 11.5px; border-radius: 6px;',
      '  padding: 9px 11px; margin-top: 10px; line-height: 1.4; display: none;',
      '}',
      '.mf-forgot-msg.mf-visible { display: block; }',
      '.mf-forgot-msg.mf-is-success { color: var(--mf-gold); background: rgba(168,136,58,0.08); border: 1px solid rgba(168,136,58,0.25); }',
      '.mf-forgot-msg.mf-is-error { color: #c98a6b; background: rgba(201,138,107,0.08); border: 1px solid rgba(201,138,107,0.25); }',

      '@media (prefers-reduced-motion: reduce) {',
      '  .mf-acct-pop { transition: none !important; }',
      '}'
    );

    style.textContent = rules.join('\n');
    document.head.appendChild(style);
  }

  // ── Local session cache (kept fresh independently of mf-signin.js) ────
  var currentSession = null;

  mfClient.auth.getSession().then(function (res) {
    currentSession = res && res.data ? res.data.session : null;
  });

  mfClient.auth.onAuthStateChange(function (_event, session) {
    currentSession = session;
    closeAccountPopover();
  });

  // ── 1. Signed-in account popover ───────────────────────────────────────

  var popover = document.createElement('div');
  popover.className = 'mf-acct-pop';
  popover.hidden = true;
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Account');
  document.body.appendChild(popover);

  function renderPopoverContent(session) {
    var user = session.user;
    var meta = user.user_metadata || {};
    var identity = meta.full_name || meta.name || user.email || 'Signed in';
    var currentDisplayName = meta.display_name || meta.full_name || '';

    popover.innerHTML =
      '<div class="mf-acct-identity">' + escapeHtml(identity) + '</div>' +
      '<div class="mf-acct-field">' +
        '<label for="mf-acct-name-input">Display name</label>' +
        '<div class="mf-acct-row">' +
          '<input type="text" id="mf-acct-name-input" value="' + escapeHtml(currentDisplayName) + '" placeholder="Your name">' +
          '<button type="button" class="mf-acct-save" id="mf-acct-save-btn">Save</button>' +
        '</div>' +
        '<div class="mf-acct-msg" id="mf-acct-name-msg"></div>' +
      '</div>' +
      '<div class="mf-acct-divider"></div>' +
      '<button type="button" class="mf-acct-btn" id="mf-acct-signout">Sign out</button>' +
      '<button type="button" class="mf-acct-btn mf-danger" id="mf-acct-delete">Delete my data</button>' +
      '<div class="mf-acct-confirm" id="mf-acct-confirm">' +
        '<p>This permanently deletes your saved progress and signs you out. This can\u2019t be undone.</p>' +
        '<div class="mf-acct-confirm-row">' +
          '<button type="button" class="mf-acct-confirm-cancel" id="mf-acct-cancel">Cancel</button>' +
          '<button type="button" class="mf-acct-confirm-yes" id="mf-acct-confirm-yes">Yes, delete</button>' +
        '</div>' +
      '</div>';

    document.getElementById('mf-acct-save-btn').addEventListener('click', function () {
      saveDisplayName(user.id);
    });
    document.getElementById('mf-acct-signout').addEventListener('click', signOutFlow);
    document.getElementById('mf-acct-delete').addEventListener('click', function () {
      document.getElementById('mf-acct-confirm').classList.add('mf-visible');
    });
    document.getElementById('mf-acct-cancel').addEventListener('click', function () {
      document.getElementById('mf-acct-confirm').classList.remove('mf-visible');
    });
    document.getElementById('mf-acct-confirm-yes').addEventListener('click', function () {
      deleteDataFlow(user.id);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  async function saveDisplayName(userId) {
    var input = document.getElementById('mf-acct-name-input');
    var saveBtn = document.getElementById('mf-acct-save-btn');
    var msg = document.getElementById('mf-acct-name-msg');
    var value = input.value.trim();

    saveBtn.disabled = true;
    msg.textContent = '';
    msg.style.color = '';

    try {
      var res = await mfClient.auth.updateUser({ data: { display_name: value } });
      if (res.error) throw res.error;
      msg.textContent = 'Saved.';
    } catch (err) {
      msg.textContent = (err && err.message) || 'Could not save. Try again.';
      msg.style.color = '#c98a6b';
    } finally {
      saveBtn.disabled = false;
    }
  }

  async function signOutFlow() {
    var btn = document.getElementById('mf-acct-signout');
    btn.disabled = true;
    btn.textContent = 'Signing out…';
    try {
      await mfClient.auth.signOut();
    } finally {
      location.reload();
    }
  }

  async function deleteDataFlow(userId) {
    var yesBtn = document.getElementById('mf-acct-confirm-yes');
    yesBtn.disabled = true;
    yesBtn.textContent = 'Deleting…';
    try {
      var delRes = await mfClient.from(PROGRESS_TABLE).delete().eq('user_id', userId);
      if (delRes.error) throw delRes.error;
      await mfClient.auth.signOut();
    } catch (err) {
      yesBtn.disabled = false;
      yesBtn.textContent = 'Yes, delete';
      var confirmBox = document.getElementById('mf-acct-confirm');
      var errLine = document.createElement('p');
      errLine.style.color = '#c98a6b';
      errLine.style.margin = '8px 0 0';
      errLine.style.fontSize = '11px';
      errLine.textContent = (err && err.message) || 'Something went wrong. Try again.';
      confirmBox.appendChild(errLine);
      return;
    }
    location.reload();
  }

  function positionPopover(anchorEl) {
    var rect = anchorEl.getBoundingClientRect();
    var width = 240;
    var left = Math.min(rect.right - width, window.innerWidth - width - 10);
    left = Math.max(left, 10);
    var top = rect.bottom + 8;
    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
  }

  function openAccountPopover(anchorEl, session) {
    renderPopoverContent(session);
    positionPopover(anchorEl);
    popover.hidden = false;
    void popover.offsetWidth;
    popover.classList.add('mf-open');
    document.addEventListener('click', onOutsideClick, true);
    document.addEventListener('keydown', onPopoverKeydown);
    window.addEventListener('scroll', closeAccountPopover, true);
    window.addEventListener('resize', closeAccountPopover);
  }

  function closeAccountPopover() {
    if (popover.hidden) return;
    popover.classList.remove('mf-open');
    document.removeEventListener('click', onOutsideClick, true);
    document.removeEventListener('keydown', onPopoverKeydown);
    window.removeEventListener('scroll', closeAccountPopover, true);
    window.removeEventListener('resize', closeAccountPopover);
    window.setTimeout(function () { popover.hidden = true; }, 180);
  }

  function onOutsideClick(e) {
    if (popover.contains(e.target) || e.target.closest('.mf-nav-icon')) return;
    closeAccountPopover();
  }

  function onPopoverKeydown(e) {
    if (e.key === 'Escape') closeAccountPopover();
  }

  // Genuine capturing-phase listener on an ancestor (see header note) so it
  // reliably runs before the nav icon's own bubble-phase click handler.
  document.addEventListener('click', function (e) {
    var navIcon = e.target.closest && e.target.closest('.mf-nav-icon');
    if (!navIcon) return;

    var isRealUser = !!(currentSession && currentSession.user && currentSession.user.is_anonymous === false);
    if (!isRealUser) return; // anonymous/no session — let the sign-in modal open as normal

    e.stopPropagation();
    e.preventDefault();

    if (!popover.hidden && popover.classList.contains('mf-open')) {
      closeAccountPopover();
    } else {
      openAccountPopover(navIcon, currentSession);
    }
  }, true);

  // ── 2. Forgot password link ────────────────────────────────────────────

  function whenElementExists(id, cb) {
    var el = document.getElementById(id);
    if (el) { cb(el); return; }
    var observer = new MutationObserver(function () {
      var found = document.getElementById(id);
      if (found) {
        observer.disconnect();
        cb(found);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  whenElementExists('mf-btn-mode-toggle', function (modeToggleBtn) {
    var forgotLink = document.createElement('button');
    forgotLink.type = 'button';
    forgotLink.className = 'mf-forgot-link';
    forgotLink.textContent = 'Forgot password?';

    var msgEl = document.createElement('div');
    msgEl.className = 'mf-forgot-msg';

    modeToggleBtn.insertAdjacentElement('afterend', forgotLink);
    forgotLink.insertAdjacentElement('afterend', msgEl);

    forgotLink.addEventListener('click', async function () {
      var emailInput = document.getElementById('mf-input-email');
      var email = emailInput ? emailInput.value.trim() : '';

      msgEl.className = 'mf-forgot-msg';
      msgEl.textContent = '';

      if (!email) {
        msgEl.textContent = 'Enter your email above first, then tap this again.';
        msgEl.classList.add('mf-visible', 'mf-is-error');
        if (emailInput) emailInput.focus();
        return;
      }

      var originalText = forgotLink.textContent;
      forgotLink.disabled = true;
      forgotLink.textContent = 'Sending…';

      try {
        var res = await mfClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (res.error) throw res.error;
        msgEl.textContent = 'Check your inbox for a reset link.';
        msgEl.classList.add('mf-visible', 'mf-is-success');
      } catch (err) {
        msgEl.textContent = (err && err.message) || 'Could not send reset email. Try again.';
        msgEl.classList.add('mf-visible', 'mf-is-error');
      } finally {
        forgotLink.disabled = false;
        forgotLink.textContent = originalText;
      }
    });
  });

  // ── 3. Duplicate-email friendlier error + auto mode-switch ────────────
  // Light monkey-patch: rewrite the error message in place before the
  // existing form's own catch block reads it and calls showError(), so the
  // existing UI ends up displaying our friendlier copy without any change
  // to mf-signin.js itself.

  var originalUpdateUser = mfClient.auth.updateUser.bind(mfClient.auth);

  mfClient.auth.updateUser = async function (attributes) {
    var result = await originalUpdateUser(attributes);

    var isEmailLinkAttempt = attributes && typeof attributes.email === 'string' && attributes.email.length > 0;
    if (isEmailLinkAttempt && result && result.error) {
      var rawMsg = (result.error.message || '').toLowerCase();
      var code = result.error.code || '';
      var isConflict =
        rawMsg.indexOf('already') !== -1 ||
        code === 'email_exists' ||
        code === 'user_already_exists' ||
        result.error.status === 422;

      if (isConflict) {
        result.error.message = 'This email already has an account. Try signing in instead.';
        var modeToggleBtn = document.getElementById('mf-btn-mode-toggle');
        if (modeToggleBtn) modeToggleBtn.click();
      }
    }

    return result;
  };
})();
