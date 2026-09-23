/**
 * MathForge Newsletter — subscribe form
 * ─────────────────────────────────────────────────────────────────────────
 * Additive site file, following the existing convention: mounts into a
 * container already present on whichever page includes it, touches
 * nothing else on that page.
 *
 *   <div id="mf-newsletter-form"></div>
 *   <script src="mf-newsletter-form.js" defer></script>
 *
 * Uses the site's existing shared anon client (window.mfClient) — no new
 * Supabase client instance. Note: this depends on the same `mfClient`
 * every other mf-*.js file on this site depends on, so it inherits the
 * earlier-flagged `supabase-client.js.` trailing-dot script-tag typo —
 * fix that first, or this (and everything else) silently no-ops.
 *
 * ASSUMED SCHEMA: newsletter_subscribers has columns email, deadline_
 * reminders (bool), feature_updates (bool), reminder_days_before (int).
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.mfClient === 'undefined') {
    console.error('[mf-newsletter-form] mfClient not found. Aborting.');
    return;
  }

  var mfClient = window.mfClient;

  var STYLE_ID = 'mf-newsletter-form-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.mf-newsletter-form {',
      '  font-family: var(--mf-mono, "JetBrains Mono", monospace);',
      '  color: var(--mf-parchment, #e4ddd0); max-width: 380px;',
      '}',
      '.mf-newsletter-field { margin-bottom: 12px; }',
      '.mf-newsletter-field > label {',
      '  display: flex; align-items: center; gap: 8px; font-size: 12.5px;',
      '  color: var(--mf-parchment-dim, rgba(228,221,208,0.62));',
      '}',
      '.mf-newsletter-field input[type="email"] {',
      '  width: 100%; box-sizing: border-box; background: #050505;',
      '  border: 1px solid rgba(228,221,208,0.16); border-radius: 6px;',
      '  padding: 10px 12px; font-family: inherit; font-size: 13px;',
      '  color: var(--mf-parchment, #e4ddd0);',
      '}',
      '.mf-newsletter-field input[type="email"]:focus {',
      '  outline: none; border-color: var(--mf-gold, #a8883a);',
      '}',
      '.mf-newsletter-field select {',
      '  background: #050505; border: 1px solid rgba(228,221,208,0.16);',
      '  border-radius: 6px; padding: 6px 8px; font-family: inherit;',
      '  font-size: 12.5px; color: var(--mf-parchment, #e4ddd0);',
      '}',
      '.mf-newsletter-submit {',
      '  width: 100%; background: var(--mf-gold, #a8883a);',
      '  border: 1px solid var(--mf-gold, #a8883a); color: #0c0c0c;',
      '  font-family: inherit; font-size: 13px; font-weight: 500;',
      '  padding: 11px; border-radius: 7px; cursor: pointer;',
      '}',
      '.mf-newsletter-submit:hover:not(:disabled) { filter: brightness(1.08); }',
      '.mf-newsletter-submit:disabled { opacity: 0.6; cursor: default; }',
      '.mf-newsletter-msg {',
      '  font-size: 12px; margin-top: 10px; padding: 9px 11px;',
      '  border-radius: 6px; display: none;',
      '}',
      '.mf-newsletter-msg.mf-visible { display: block; }',
      '.mf-newsletter-msg.mf-is-success {',
      '  color: var(--mf-gold, #a8883a); background: rgba(168,136,58,0.08);',
      '  border: 1px solid rgba(168,136,58,0.25);',
      '}',
      '.mf-newsletter-msg.mf-is-error {',
      '  color: #c98a6b; background: rgba(201,138,107,0.08);',
      '  border: 1px solid rgba(201,138,107,0.25);',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function isDuplicateEmailError(err) {
    if (!err) return false;
    var code = err.code || '';
    var msg = (err.message || '').toLowerCase();
    return code === '23505' || msg.indexOf('duplicate key') !== -1 || msg.indexOf('unique constraint') !== -1;
  }

  function mount(container) {
    container.innerHTML =
      '<form class="mf-newsletter-form" novalidate>' +
        '<div class="mf-newsletter-field">' +
          '<input type="email" id="mf-nl-email" placeholder="you@example.com" required>' +
        '</div>' +
        '<div class="mf-newsletter-field">' +
          '<label><input type="checkbox" id="mf-nl-deadlines" checked> Deadline reminders</label>' +
        '</div>' +
        '<div class="mf-newsletter-field">' +
          '<label><input type="checkbox" id="mf-nl-features"> Feature updates</label>' +
        '</div>' +
        '<div class="mf-newsletter-field">' +
          '<label>Remind me' +
            ' <select id="mf-nl-window">' +
              '<option value="3">3 days before</option>' +
              '<option value="7" selected>7 days before</option>' +
              '<option value="14">14 days before</option>' +
            '</select>' +
          '</label>' +
        '</div>' +
        '<button type="submit" class="mf-newsletter-submit">Subscribe</button>' +
        '<div class="mf-newsletter-msg"></div>' +
      '</form>';

    var form = container.querySelector('form');
    var emailInput = container.querySelector('#mf-nl-email');
    var deadlinesInput = container.querySelector('#mf-nl-deadlines');
    var featuresInput = container.querySelector('#mf-nl-features');
    var windowSelect = container.querySelector('#mf-nl-window');
    var submitBtn = container.querySelector('.mf-newsletter-submit');
    var msgEl = container.querySelector('.mf-newsletter-msg');

    function showMsg(text, isError) {
      msgEl.textContent = text;
      msgEl.className = 'mf-newsletter-msg mf-visible ' + (isError ? 'mf-is-error' : 'mf-is-success');
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var email = emailInput.value.trim();
      if (!email) {
        showMsg('Enter an email address.', true);
        return;
      }

      submitBtn.disabled = true;
      msgEl.className = 'mf-newsletter-msg';

      try {
        var res = await mfClient.from('newsletter_subscribers').insert({
          email: email,
          deadline_reminders: deadlinesInput.checked,
          feature_updates: featuresInput.checked,
          reminder_days_before: parseInt(windowSelect.value, 10)
        });

        if (res.error) throw res.error;

        showMsg('Subscribed! You\u2019re all set.', false);
        emailInput.value = '';
        deadlinesInput.checked = true;
        featuresInput.checked = false;
        windowSelect.value = '7';
      } catch (err) {
        if (isDuplicateEmailError(err)) {
          showMsg('You\u2019re already subscribed \u2014 check your inbox for a preferences link.', true);
        } else {
          showMsg('Something went wrong. Please try again.', true);
        }
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  function init() {
    var container = document.getElementById('mf-newsletter-form');
    if (!container) {
      console.error('[mf-newsletter-form] #mf-newsletter-form container not found on this page.');
      return;
    }
    mount(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
