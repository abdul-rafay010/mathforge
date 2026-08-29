/**
 * MathForge — Spaced repetition (SM-2 simplified)
 * ─────────────────────────────────────────────────────────────────────────
 * Verified against the real index__5_.html (not the earlier prose
 * description): loadProgress()/saveProgress()/recordAttempt(qid, scored,
 * marks, note) match exactly, recordAttempt() does create
 * progress.questions[qid] = { flagged, attempts: [] } before pushing the
 * new attempt, and isDueForReview()/weightedSample() live as plain
 * top-level functions in the same (non-module, non-IIFE-wrapped) inline
 * <script> — confirmed NOT wrapped in a closure, so reassigning
 * window.isDueForReview really does redirect weightedSample()'s internal
 * calls with zero changes to that function.
 *
 * One real data-shape note: recordAttempt() caps each question's attempts
 * array to the most recent 10 (`.slice(-10)`). That cap doesn't affect this
 * file — the scheduler only ever reads the `scored`/`marks` passed directly
 * into recordAttempt(), never the historical attempts array.
 *
 * Load after index.html's inline script (so window.recordAttempt and
 * window.isDueForReview already exist), and before any script that builds
 * a practice session using isDueForReview / weightedSample.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (typeof window.loadProgress !== 'function' || typeof window.saveProgress !== 'function') {
    console.error('[mf-spaced-repetition] loadProgress()/saveProgress() not found. Aborting.');
    return;
  }
  if (typeof window.recordAttempt !== 'function') {
    console.error('[mf-spaced-repetition] recordAttempt() not found. Aborting.');
    return;
  }

  var DEFAULT_EASE = 2.5;
  var MIN_EASE = 1.3;

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysStr(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function updateSchedule(qid, scored, marks) {
    var progress = window.loadProgress();
    if (!progress || !progress.questions || !progress.questions[qid]) {
      // recordAttempt is expected to have created this record already;
      // if it hasn't (contract mismatch), there's nothing safe to update.
      console.warn('[mf-spaced-repetition] no progress.questions["' + qid + '"] after recordAttempt — skipping schedule update.');
      return;
    }

    var rec = progress.questions[qid];
    if (typeof rec.interval !== 'number') rec.interval = 0;
    if (typeof rec.ease !== 'number') rec.ease = DEFAULT_EASE;

    if (scored >= marks) {
      if (rec.interval === 0) {
        rec.interval = 1;
      } else if (rec.interval === 1) {
        rec.interval = 6;
      } else {
        rec.interval = Math.round(rec.interval * rec.ease);
      }
      rec.ease = Math.min(DEFAULT_EASE, rec.ease + 0.1);
    } else {
      rec.interval = 1;
      rec.ease = Math.max(MIN_EASE, rec.ease - 0.2);
    }

    rec.dueDate = addDaysStr(rec.interval);

    window.saveProgress(progress);
  }

  // ── Wrap recordAttempt (don't replace its behavior, only add to it) ────
  var originalRecordAttempt = window.recordAttempt;
  window.recordAttempt = function (qid, scored, marks, note) {
    var result = originalRecordAttempt.apply(this, arguments);
    try {
      updateSchedule(qid, scored, marks);
    } catch (err) {
      console.error('[mf-spaced-repetition] schedule update failed', err);
    }
    return result;
  };

  // ── Public: is this question due for review under the new schedule? ───
  window.isDueForSpacedReview = function (qid) {
    var progress = window.loadProgress();
    var rec = progress && progress.questions && progress.questions[qid];
    if (!rec || !rec.dueDate) return true; // no schedule yet → treat as new/due
    return todayStr() >= rec.dueDate;
  };

  // ── Override the crude existing check so session-building code that
  //    already calls isDueForReview(qid) picks up the smarter logic with
  //    zero changes on its end. isDueForReview is a plain global function
  //    (classic script scope), so reassigning window.isDueForReview here
  //    affects every subsequent call to the bare identifier, including
  //    from inside weightedSample() — no need to touch that function. ────
  if (typeof window.isDueForReview === 'function') {
    window._mfOriginalIsDueForReview = window.isDueForReview; // kept for reference/rollback only, not called
  } else {
    console.warn('[mf-spaced-repetition] window.isDueForReview was not already defined — overriding anyway.');
  }

  window.isDueForReview = function (qid) {
    return window.isDueForSpacedReview(qid);
  };
})();
