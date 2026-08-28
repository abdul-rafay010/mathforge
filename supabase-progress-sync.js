// Cloud sync layer for MathForge's existing localStorage progress system.
// This does NOT replace loadProgress/saveProgress/recordAttempt/etc. —
// it wraps them, so the app keeps working instantly and offline exactly
// as it does now. A copy of the data mirrors to Supabase in the
// background, keyed to the current session (guest or signed-in).
//
// Load this AFTER: the supabase cdn script, supabase-config.js,
// supabase-client.js, AND the main app's inline <script> block
// (it needs PROGRESS_KEY / loadProgress / saveProgress / buildProgressScreen
// / refreshStreakChips to already exist).

(async function () {
  const session = await mfBootstrapSession();
  if (!session) {
    console.warn('MathForge: no session — progress stays local-only this visit.');
    return;
  }
  const userId = session.user.id;

  // If this device's localStorage is empty (e.g. a new device after
  // signing in), pull down whatever's already saved in the cloud.
  // If this device already has data, leave it alone — don't overwrite it.
  async function pullIfLocalEmpty() {
    const local = localStorage.getItem(PROGRESS_KEY);
    if (local) return;

    const { data, error } = await mfClient
      .from('user_progress')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('MathForge: cloud pull failed —', error.message);
      return;
    }
    if (data && data.data && Object.keys(data.data).length) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.data));
      if (typeof buildProgressScreen === 'function') buildProgressScreen();
      if (typeof refreshStreakChips === 'function') refreshStreakChips();
      console.log('MathForge: progress restored from cloud for', userId);
    }
  }

  await pullIfLocalEmpty();

  // Push local -> cloud whenever saveProgress runs, debounced so a burst
  // of attempts doesn't fire a request per keystroke/click.
  let pushTimer = null;
  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      const p = loadProgress();
      const { error } = await mfClient
        .from('user_progress')
        .upsert({ user_id: userId, data: p, updated_at: new Date().toISOString() });
      if (error) console.error('MathForge: cloud sync failed —', error.message);
    }, 1500);
  }

  const _origSaveProgress = window.saveProgress;
  window.saveProgress = function (p) {
    _origSaveProgress(p);
    schedulePush();
  };

  console.log('MathForge: cloud progress sync active for', userId);
})();
