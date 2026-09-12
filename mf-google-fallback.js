/**
 * MathForge — Google re-link fallback
 * ─────────────────────────────────────────────────────────────────────────
 * linkIdentity() for an OAuth provider redirects the browser immediately —
 * it can't fail inside a click handler's try/catch, because by the time
 * Google approves and Supabase's own callback discovers the identity is
 * already linked to a different user, we're on a fresh page load, not
 * inside the original click's async flow. That error arrives instead as
 * ?error_code=identity_already_exists (or #error_code=... in the hash) on
 * the URL of the page you land back on.
 *
 * This file checks for exactly that on page load and — since the identity
 * IS a real, already-existing account — silently retries as a normal
 * sign-in instead of another link attempt. A sessionStorage flag stops it
 * from retrying more than once per tab, in case something unexpected loops.
 *
 * Load LAST, after mf-account-panel.js.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (typeof window.mfClient === 'undefined') return;
  var mfClient = window.mfClient;
  var RETRY_FLAG = 'mf_google_relink_retry_done';

  function paramsFrom(str) {
    return new URLSearchParams(str.replace(/^[?#]/, ''));
  }

  var searchParams = paramsFrom(window.location.search);
  var hashParams = paramsFrom(window.location.hash);
  var errorCode = searchParams.get('error_code') || hashParams.get('error_code');

  if (errorCode !== 'identity_already_exists') return;

  // Always clean the ugly error out of the address bar, whether or not
  // we retry.
  history.replaceState(null, '', window.location.pathname);

  var alreadyRetried = false;
  try { alreadyRetried = sessionStorage.getItem(RETRY_FLAG) === '1'; } catch (e) { /* ignore */ }

  if (alreadyRetried) {
    // Retried once already this tab and still ended up back here — stop
    // looping and just leave the user on a clean guest session rather than
    // bouncing them to Google again.
    try { sessionStorage.removeItem(RETRY_FLAG); } catch (e) { /* ignore */ }
    return;
  }

  try { sessionStorage.setItem(RETRY_FLAG, '1'); } catch (e) { /* ignore */ }

  // This identity is a real, already-existing account — a normal sign-in
  // is the correct call here, not another link attempt. Typically instant/
  // silent since Google just approved access moments ago.
  mfClient.auth.signInWithOAuth({ provider: 'google' });
})();
