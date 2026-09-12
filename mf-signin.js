/**
 * MathForge — Sign-in modal system
 * ─────────────────────────────────────────────────────────────────────────
 * Self-contained. Injects its own HTML/CSS into the page. Load with:
 *   <script src="/mf-signin.js" defer></script>
 * AFTER `mfClient` (the global Supabase client) has been created and its
 * initial anonymous session has resolved.
 *
 * MINIMAL EXISTING MARKUP NEEDED:
 * Add an empty container wherever your top-right nav icon should sit, e.g.:
 *   <div id="mf-nav-account"></div>
 * This script renders the entry-point icon into that container. If the
 * container isn't found, the icon is appended to the end of <body> instead
 * (still functional, just not nav-positioned) and a console warning fires.
 *
 * Everything else (modal, backdrop, guest banner, styles) is injected
 * automatically — nothing else needs to be added to your HTML.
 *
 * Public API:
 *   window.mfOpenSignInModal()   — opens the modal programmatically
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.mfClient === 'undefined') {
    console.error('[mf-signin] mfClient (Supabase client) not found on window. Aborting.');
    return;
  }

  var mfClient = window.mfClient;
  var NAV_CONTAINER_ID = 'mf-nav-account';
  var BANNER_DISMISS_KEY = 'mf_guest_banner_dismissed';

  // ── Styles ────────────────────────────────────────────────────────────
  var STYLE_ID = 'mf-signin-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap");',
      '',
      ':root {',
      '  --mf-ink: #070707;',
      '  --mf-gold: #a8883a;',
      '  --mf-gold-soft: rgba(168,136,58,0.35);',
      '  --mf-parchment: #e4ddd0;',
      '  --mf-parchment-dim: rgba(228,221,208,0.62);',
      '  --mf-display: "Cormorant Garamond", serif;',
      '  --mf-mono: "JetBrains Mono", monospace;',
      '}',
      '',
      '.mf-nav-icon {',
      '  width: 34px; height: 34px; border-radius: 50%;',
      '  border: 1px solid rgba(228,221,208,0.28);',
      '  background: transparent; cursor: pointer;',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  padding: 0; color: var(--mf-parchment-dim);',
      '  transition: border-color 180ms ease, color 180ms ease, box-shadow 180ms ease;',
      '  font-family: var(--mf-mono); overflow: hidden;',
      '}',
      '.mf-nav-icon:hover { border-color: var(--mf-gold-soft); color: var(--mf-parchment); }',
      '.mf-nav-icon:focus-visible { outline: 2px solid var(--mf-gold); outline-offset: 2px; }',
      '.mf-nav-icon svg { width: 16px; height: 16px; }',
      '.mf-nav-icon.mf-signed-in {',
      '  border-color: var(--mf-gold); box-shadow: 0 0 0 2px rgba(168,136,58,0.18);',
      '  color: var(--mf-parchment); font-size: 11px; font-weight: 500; letter-spacing: 0.02em;',
      '}',
      '.mf-nav-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }',
      '',
      '.mf-backdrop {',
      '  position: fixed; inset: 0; background: rgba(7,7,7,0.72);',
      '  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);',
      '  display: flex; align-items: center; justify-content: center;',
      '  z-index: 9998; opacity: 0; transition: opacity 200ms ease;',
      '  padding: 20px;',
      '}',
      '.mf-backdrop.mf-open { opacity: 1; }',
      '.mf-backdrop[hidden] { display: none; }',
      '',
      '.mf-modal {',
      '  width: 100%; max-width: 380px; background: #0c0c0c;',
      '  border: 1px solid rgba(168,136,58,0.25); border-radius: 10px;',
      '  padding: 36px 32px 28px; position: relative;',
      '  transform: scale(0.96) translateY(6px); opacity: 0;',
      '  transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms ease;',
      '  box-shadow: 0 24px 60px rgba(0,0,0,0.5);',
      '}',
      '.mf-backdrop.mf-open .mf-modal { transform: scale(1) translateY(0); opacity: 1; }',
      '',
      '.mf-modal-close {',
      '  position: absolute; top: 14px; right: 14px; width: 28px; height: 28px;',
      '  border: none; background: transparent; color: var(--mf-parchment-dim);',
      '  cursor: pointer; font-family: var(--mf-mono); font-size: 16px; line-height: 1;',
      '  display: flex; align-items: center; justify-content: center; border-radius: 6px;',
      '  transition: color 150ms ease, background 150ms ease;',
      '}',
      '.mf-modal-close:hover { color: var(--mf-parchment); background: rgba(228,221,208,0.06); }',
      '.mf-modal-close:focus-visible { outline: 2px solid var(--mf-gold); outline-offset: 1px; }',
      '',
      '.mf-modal-title {',
      '  font-family: var(--mf-display); font-weight: 500; font-size: 26px;',
      '  color: var(--mf-parchment); margin: 0 0 6px; letter-spacing: 0.01em;',
      '}',
      '.mf-modal-sub {',
      '  font-family: var(--mf-mono); font-size: 12px; color: var(--mf-parchment-dim);',
      '  margin: 0 0 26px; line-height: 1.5;',
      '}',
      '',
      '.mf-btn {',
      '  width: 100%; font-family: var(--mf-mono); font-size: 13px; font-weight: 500;',
      '  letter-spacing: 0.01em; padding: 12px 16px; border-radius: 7px; cursor: pointer;',
      '  display: flex; align-items: center; justify-content: center; gap: 10px;',
      '  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, border-color 150ms ease;',
      '  box-sizing: border-box;',
      '}',
      '.mf-btn:disabled { cursor: default; opacity: 0.7; }',
      '.mf-btn + .mf-btn { margin-top: 10px; }',
      '.mf-btn-primary { background: var(--mf-gold); border: 1px solid var(--mf-gold); color: #0c0c0c; }',
      '.mf-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(168,136,58,0.28); }',
      '.mf-btn-primary:focus-visible { outline: 2px solid var(--mf-parchment); outline-offset: 2px; }',
      '.mf-btn-outline { background: transparent; border: 1px solid var(--mf-gold-soft); color: var(--mf-parchment); }',
      '.mf-btn-outline:hover:not(:disabled) { border-color: var(--mf-gold); background: rgba(168,136,58,0.06); }',
      '.mf-btn-outline:focus-visible { outline: 2px solid var(--mf-gold); outline-offset: 2px; }',
      '',
      '.mf-btn-spinner {',
      '  width: 14px; height: 14px; border-radius: 50%;',
      '  border: 2px solid rgba(12,12,12,0.3); border-top-color: #0c0c0c;',
      '  animation: mf-spin 700ms linear infinite;',
      '}',
      '.mf-btn-outline .mf-btn-spinner { border: 2px solid rgba(228,221,208,0.25); border-top-color: var(--mf-parchment); }',
      '@keyframes mf-spin { to { transform: rotate(360deg); } }',
      '',
      '.mf-divider-row { display: flex; align-items: center; gap: 12px; margin: 18px 0; }',
      '.mf-divider-row .mf-line { flex: 1; height: 1px; background: rgba(228,221,208,0.12); }',
      '.mf-divider-row span { font-family: var(--mf-mono); font-size: 10px; color: var(--mf-parchment-dim); letter-spacing: 0.08em; text-transform: uppercase; }',
      '',
      '.mf-field { margin-bottom: 12px; }',
      '.mf-field label {',
      '  display: block; font-family: var(--mf-mono); font-size: 10.5px;',
      '  color: var(--mf-parchment-dim); margin-bottom: 6px; letter-spacing: 0.05em; text-transform: uppercase;',
      '}',
      '.mf-field input {',
      '  width: 100%; box-sizing: border-box; background: #050505;',
      '  border: 1px solid rgba(228,221,208,0.16); border-radius: 6px;',
      '  padding: 10px 12px; font-family: var(--mf-mono); font-size: 13px;',
      '  color: var(--mf-parchment); transition: border-color 150ms ease;',
      '}',
      '.mf-field input:focus { outline: none; border-color: var(--mf-gold); }',
      '.mf-field input:focus-visible { outline: 2px solid var(--mf-gold); outline-offset: 1px; }',
      '',
      '.mf-toggle-link {',
      '  display: block; text-align: center; margin-top: 16px;',
      '  font-family: var(--mf-mono); font-size: 11.5px; color: var(--mf-parchment-dim);',
      '  background: none; border: none; cursor: pointer; width: 100%; padding: 4px;',
      '  text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(228,221,208,0.25);',
      '}',
      '.mf-toggle-link:hover { color: var(--mf-parchment); }',
      '',
      '.mf-guest-link {',
      '  display: block; text-align: center; margin-top: 20px;',
      '  font-family: var(--mf-mono); font-size: 11px; color: var(--mf-parchment-dim);',
      '  background: none; border: none; cursor: pointer; width: 100%; padding: 2px;',
      '  opacity: 0.7; transition: opacity 150ms ease;',
      '}',
      '.mf-guest-link:hover { opacity: 1; text-decoration: underline; text-underline-offset: 3px; }',
      '',
      '.mf-error {',
      '  display: none; font-family: var(--mf-mono); font-size: 11.5px;',
      '  color: #c98a6b; background: rgba(201,138,107,0.08);',
      '  border: 1px solid rgba(201,138,107,0.25); border-radius: 6px;',
      '  padding: 9px 11px; margin-bottom: 14px; line-height: 1.4;',
      '}',
      '.mf-error.mf-visible { display: block; }',
      '',
      '.mf-success {',
      '  display: none; font-family: var(--mf-mono); font-size: 11.5px;',
      '  color: var(--mf-gold); background: rgba(168,136,58,0.08);',
      '  border: 1px solid rgba(168,136,58,0.25); border-radius: 6px;',
      '  padding: 9px 11px; margin-bottom: 14px; line-height: 1.5;',
      '}',
      '.mf-success.mf-visible { display: block; }',
      '',
      '.mf-panel { display: none; }',
      '.mf-panel.mf-active { display: block; }',
      '',
      '.mf-guest-banner {',
      '  position: relative; width: 100%; box-sizing: border-box;',
      '  background: #0c0c0c; border-bottom: 1px solid rgba(168,136,58,0.22);',
      '  padding: 9px 44px 9px 16px; display: flex; align-items: center; gap: 10px;',
      '  font-family: var(--mf-mono); font-size: 11.5px; color: var(--mf-parchment-dim);',
      '  flex-wrap: wrap;',
      '}',
      '.mf-guest-banner[hidden] { display: none; }',
      '.mf-guest-banner .mf-signin-link {',
      '  color: var(--mf-gold); background: none; border: none; cursor: pointer;',
      '  font-family: var(--mf-mono); font-size: 11.5px; padding: 0;',
      '  text-decoration: underline; text-underline-offset: 3px;',
      '}',
      '.mf-guest-banner .mf-signin-link:hover { color: var(--mf-parchment); }',
      '.mf-guest-banner-close {',
      '  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);',
      '  width: 24px; height: 24px; border: none; background: transparent;',
      '  color: var(--mf-parchment-dim); cursor: pointer; font-family: var(--mf-mono);',
      '  font-size: 14px; border-radius: 5px; transition: color 150ms ease, background 150ms ease;',
      '}',
      '.mf-guest-banner-close:hover { color: var(--mf-parchment); background: rgba(228,221,208,0.06); }',
      '',
      '@media (max-width: 420px) {',
      '  .mf-modal { padding: 30px 22px 24px; }',
      '  .mf-modal-title { font-size: 23px; }',
      '}',
      '',
      '@media (prefers-reduced-motion: reduce) {',
      '  .mf-backdrop, .mf-modal, .mf-btn, .mf-nav-icon { transition: none !important; }',
      '  .mf-btn-spinner { animation-duration: 1ms; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Icons (inline SVG, currentColor) ─────────────────────────────────
  var ICON_GUEST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 19.5c1.4-3.2 4-4.8 6.5-4.8s5.1 1.6 6.5 4.8"/></svg>';
  var ICON_GOOGLE = '<svg viewBox="0 0 20 20" width="16" height="16"><path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.97-4.33 2.97-7.31z"/><path fill="#34A853" d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H1.06v2.59A10 10 0 0 0 10 20z"/><path fill="#FBBC05" d="M4.41 11.9a5.99 5.99 0 0 1 0-3.8V5.5H1.06a10 10 0 0 0 0 9l3.35-2.6z"/><path fill="#EA4335" d="M10 3.98c1.47 0 2.79.5 3.83 1.49l2.87-2.87C14.95.99 12.7 0 10 0A10 10 0 0 0 1.06 5.5l3.35 2.6C5.2 5.74 7.4 3.98 10 3.98z"/></svg>';

  // ── Nav entry-point icon ─────────────────────────────────────────────
  var navBtn = document.createElement('button');
  navBtn.type = 'button';
  navBtn.className = 'mf-nav-icon';
  navBtn.setAttribute('aria-label', 'Account');
  navBtn.innerHTML = ICON_GUEST;
  navBtn.addEventListener('click', function () { openModal(); });

  var navContainer = document.getElementById(NAV_CONTAINER_ID);
  if (navContainer) {
    navContainer.appendChild(navBtn);
  } else {
    console.warn('[mf-signin] #' + NAV_CONTAINER_ID + ' not found — appending account icon to <body>.');
    navBtn.style.position = 'fixed';
    navBtn.style.top = '14px';
    navBtn.style.right = '14px';
    navBtn.style.zIndex = '9990';
    document.body.appendChild(navBtn);
  }

  function initials(nameOrEmail) {
    if (!nameOrEmail) return '?';
    var base = nameOrEmail.split('@')[0];
    var parts = base.replace(/[._-]+/g, ' ').trim().split(/\s+/);
    var s = parts.length > 1 ? (parts[0][0] + parts[1][0]) : base.slice(0, 2);
    return s.toUpperCase();
  }

  function updateNavIcon(session) {
    var user = session && session.user;
    if (!user || user.is_anonymous) {
      navBtn.classList.remove('mf-signed-in');
      navBtn.innerHTML = ICON_GUEST;
      navBtn.setAttribute('aria-label', 'Account — signed out');
      return;
    }
    navBtn.classList.add('mf-signed-in');
    var meta = user.user_metadata || {};
    var photo = meta.avatar_url || meta.picture;
    var label = meta.full_name || meta.name || user.email || '';
    if (photo) {
      navBtn.innerHTML = '<img src="' + photo + '" alt="" referrerpolicy="no-referrer">';
    } else {
      navBtn.textContent = initials(label || user.email);
    }
    navBtn.setAttribute('aria-label', 'Account — signed in' + (label ? ' as ' + label : ''));
  }

  // ── Modal markup ──────────────────────────────────────────────────────
  var backdrop = document.createElement('div');
  backdrop.className = 'mf-backdrop';
  backdrop.hidden = true;
  backdrop.innerHTML =
    '<div class="mf-modal" role="dialog" aria-modal="true" aria-labelledby="mf-modal-title">' +
      '<button type="button" class="mf-modal-close" aria-label="Close">&times;</button>' +

      '<div class="mf-panel mf-panel-main mf-active">' +
        '<h2 class="mf-modal-title" id="mf-modal-title">Save your progress</h2>' +
        '<p class="mf-modal-sub">You already have an account — sign in to keep it with you everywhere.</p>' +
        '<div class="mf-error" id="mf-error-main"></div>' +
        '<button type="button" class="mf-btn mf-btn-primary" id="mf-btn-google">' +
          '<span class="mf-btn-label">' + ICON_GOOGLE + '<span>Continue with Google</span></span>' +
        '</button>' +
        '<button type="button" class="mf-btn mf-btn-outline" id="mf-btn-email-toggle">' +
          '<span class="mf-btn-label">Continue with email</span>' +
        '</button>' +
        '<button type="button" class="mf-guest-link" id="mf-btn-guest">Continue as guest</button>' +
      '</div>' +

      '<div class="mf-panel mf-panel-email">' +
        '<h2 class="mf-modal-title" id="mf-email-title">Create your account</h2>' +
        '<p class="mf-modal-sub" id="mf-email-sub">Your current progress carries over automatically.</p>' +
        '<div class="mf-error" id="mf-error-email"></div>' +
        '<div class="mf-success" id="mf-success-email"></div>' +
        '<form id="mf-email-form" novalidate>' +
          '<div class="mf-field">' +
            '<label for="mf-input-email">Email</label>' +
            '<input type="email" id="mf-input-email" autocomplete="email" required>' +
          '</div>' +
          '<div class="mf-field">' +
            '<label for="mf-input-password">Password</label>' +
            '<input type="password" id="mf-input-password" autocomplete="current-password" required minlength="6">' +
          '</div>' +
          '<button type="submit" class="mf-btn mf-btn-primary" id="mf-btn-email-submit">' +
            '<span class="mf-btn-label" id="mf-email-submit-label">Create account</span>' +
          '</button>' +
        '</form>' +
        '<button type="button" class="mf-toggle-link" id="mf-btn-mode-toggle">Already have an account? Sign in</button>' +
        '<button type="button" class="mf-guest-link" id="mf-btn-guest-2">Continue as guest</button>' +
      '</div>' +

    '</div>';
  document.body.appendChild(backdrop);

  // ── Guest banner ──────────────────────────────────────────────────────
  var banner = document.createElement('div');
  banner.className = 'mf-guest-banner';
  banner.hidden = true;
  banner.innerHTML =
    '<span>Your progress is saved to this device only. ' +
      '<button type="button" class="mf-signin-link" id="mf-banner-signin">Sign in</button> to keep it safe.</span>' +
    '<button type="button" class="mf-guest-banner-close" aria-label="Dismiss">&times;</button>';
  document.body.insertBefore(banner, document.body.firstChild);

  // ── Element refs ──────────────────────────────────────────────────────
  var modalEl = backdrop.querySelector('.mf-modal');
  var panelMain = backdrop.querySelector('.mf-panel-main');
  var panelEmail = backdrop.querySelector('.mf-panel-email');
  var closeBtn = backdrop.querySelector('.mf-modal-close');
  var googleBtn = document.getElementById('mf-btn-google');
  var emailToggleBtn = document.getElementById('mf-btn-email-toggle');
  var guestBtn1 = document.getElementById('mf-btn-guest');
  var guestBtn2 = document.getElementById('mf-btn-guest-2');
  var modeToggleBtn = document.getElementById('mf-btn-mode-toggle');
  var emailForm = document.getElementById('mf-email-form');
  var emailInput = document.getElementById('mf-input-email');
  var passwordInput = document.getElementById('mf-input-password');
  var emailSubmitBtn = document.getElementById('mf-btn-email-submit');
  var emailSubmitLabel = document.getElementById('mf-email-submit-label');
  var emailTitle = document.getElementById('mf-email-title');
  var emailSub = document.getElementById('mf-email-sub');
  var errorMain = document.getElementById('mf-error-main');
  var errorEmail = document.getElementById('mf-error-email');
  var successEmail = document.getElementById('mf-success-email');
  var bannerSigninLink = document.getElementById('mf-banner-signin');
  var bannerCloseBtn = banner.querySelector('.mf-guest-banner-close');

  var emailMode = 'signup'; // 'signup' | 'signin' — decided per current session state on open
  var lastFocused = null;

  function clearMessages() {
    errorMain.className = 'mf-error';
    errorMain.textContent = '';
    errorEmail.className = 'mf-error';
    errorEmail.textContent = '';
    successEmail.className = 'mf-success';
    successEmail.textContent = '';
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.className = 'mf-error mf-visible';
  }

  function showSuccess(el, msg) {
    el.textContent = msg;
    el.className = 'mf-success mf-visible';
  }

  function setLoading(btn, labelEl, isLoading, loadingText) {
    btn.disabled = isLoading;
    if (isLoading) {
      btn.dataset.prevHtml = labelEl.innerHTML;
      labelEl.innerHTML = '<span class="mf-btn-spinner"></span>' + (loadingText ? '<span>' + loadingText + '</span>' : '');
    } else if (btn.dataset.prevHtml) {
      labelEl.innerHTML = btn.dataset.prevHtml;
    }
  }

  function showPanel(panel) {
    panelMain.classList.remove('mf-active');
    panelEmail.classList.remove('mf-active');
    panel.classList.add('mf-active');
  }

  function setEmailModeCopy() {
    if (emailMode === 'signup') {
      emailTitle.textContent = 'Create your account';
      emailSub.textContent = 'Your current progress carries over automatically.';
      emailSubmitLabel.textContent = 'Create account';
      modeToggleBtn.textContent = 'Already have an account? Sign in';
      passwordInput.setAttribute('autocomplete', 'new-password');
    } else {
      emailTitle.textContent = 'Sign in';
      emailSub.textContent = 'Sign in to load your saved progress.';
      emailSubmitLabel.textContent = 'Sign in';
      modeToggleBtn.textContent = 'New here? Create account';
      passwordInput.setAttribute('autocomplete', 'current-password');
    }
  }

  function openModal() {
    clearMessages();
    emailForm.reset();
    emailMode = 'signup';
    setEmailModeCopy();
    showPanel(panelMain);
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    // Force reflow so the transition runs.
    void backdrop.offsetWidth;
    backdrop.classList.add('mf-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    backdrop.classList.remove('mf-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    window.setTimeout(function () {
      backdrop.hidden = true;
      clearMessages();
    }, 200);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  window.mfOpenSignInModal = openModal;

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeModal();
  });
  guestBtn1.addEventListener('click', closeModal);
  guestBtn2.addEventListener('click', closeModal);

  emailToggleBtn.addEventListener('click', function () {
    clearMessages();
    showPanel(panelEmail);
    emailInput.focus();
  });

  modeToggleBtn.addEventListener('click', function () {
    emailMode = emailMode === 'signup' ? 'signin' : 'signup';
    clearMessages();
    setEmailModeCopy();
    emailInput.focus();
  });

  // ── Auth actions ──────────────────────────────────────────────────────

  async function getCurrentSession() {
    var res = await mfClient.auth.getSession();
    return res && res.data ? res.data.session : null;
  }

  function friendlyError(err) {
    if (!err) return 'Something went wrong. Please try again.';
    var msg = err.message || String(err);
    return msg;
  }

  function onAuthSuccess() {
    closeModal();
    window.setTimeout(function () {
      location.reload();
    }, 600);
  }

  googleBtn.addEventListener('click', async function () {
    clearMessages();
    var label = googleBtn.querySelector('.mf-btn-label');
    setLoading(googleBtn, label, true);
    try {
      var session = await getCurrentSession();
      var isAnon = !!(session && session.user && session.user.is_anonymous);
      var result;
      if (isAnon) {
        result = await mfClient.auth.linkIdentity({ provider: 'google' });
      } else {
        result = await mfClient.auth.signInWithOAuth({ provider: 'google' });
      }
      if (result && result.error) throw result.error;
      // Successful call triggers a browser redirect to Google; Supabase
      // handles the callback automatically via detectSessionInUrl, so no
      // further action is needed here.
    } catch (err) {
      setLoading(googleBtn, label, false);
      showError(errorMain, friendlyError(err));
    }
  });

  emailForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearMessages();

    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!email || !password) {
      showError(errorEmail, 'Enter both an email and a password.');
      return;
    }
    if (password.length < 6) {
      showError(errorEmail, 'Password must be at least 6 characters.');
      return;
    }

    setLoading(emailSubmitBtn, emailSubmitLabel, true);

    try {
      var session = await getCurrentSession();
      var isAnon = !!(session && session.user && session.user.is_anonymous);

      if (emailMode === 'signup') {
        if (!isAnon) {
          // Already a real, non-anonymous session trying to "sign up" again —
          // route to plain sign-in behavior instead of double-creating.
          var res1 = await mfClient.auth.signInWithPassword({ email: email, password: password });
          if (res1.error) throw res1.error;
          onAuthSuccess();
          return;
        }
        var res2 = await mfClient.auth.updateUser({ email: email, password: password });
        if (res2.error) throw res2.error;
        setLoading(emailSubmitBtn, emailSubmitLabel, false);
        showSuccess(
          successEmail,
          'Check your inbox to confirm ' + email + '. Your progress is already saved to this login — no need to wait for confirmation to keep using MathForge.'
        );
        emailForm.reset();
      } else {
        // signin
        var res3 = await mfClient.auth.signInWithPassword({ email: email, password: password });
        if (res3.error) throw res3.error;
        onAuthSuccess();
        return;
      }
    } catch (err) {
      setLoading(emailSubmitBtn, emailSubmitLabel, false);
      showError(errorEmail, friendlyError(err));
    }
  });

  // ── Guest banner ──────────────────────────────────────────────────────
  bannerSigninLink.addEventListener('click', openModal);
  bannerCloseBtn.addEventListener('click', function () {
    banner.hidden = true;
    try { sessionStorage.setItem(BANNER_DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
  });

  function maybeShowBanner(session) {
    var user = session && session.user;
    var isAnon = !!(user && user.is_anonymous);
    var dismissed = false;
    try { dismissed = sessionStorage.getItem(BANNER_DISMISS_KEY) === '1'; } catch (e) { /* ignore */ }
    banner.hidden = !(isAnon && !dismissed);
  }

  // ── Auth state wiring ─────────────────────────────────────────────────
  mfClient.auth.onAuthStateChange(function (_event, session) {
    updateNavIcon(session);
    maybeShowBanner(session);
  });

  // Initial paint from whatever session already exists on load.
  getCurrentSession().then(function (session) {
    updateNavIcon(session);
    maybeShowBanner(session);
  });
})();
