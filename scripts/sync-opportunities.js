#!/usr/bin/env node
/**
 * MathForge Newsletter — sync-opportunities.js
 * ─────────────────────────────────────────────────────────────────────────
 * Mirrors competitions-data.js's `competitions` array (filtered to
 * entries with a regCloses value) into Supabase's `opportunities` table,
 * so send-deadline-reminders has a server-side source to query — the
 * static file itself has no server counterpart. Note the naming: the
 * source file's top-level variable is `competitions` (confirmed against
 * the real file), the Supabase table it's synced into is called
 * `opportunities` — those are two different names for the same data,
 * not a mismatch to "fix."
 *
 * competitions-data.js declares `const competitions = [...]` for browser
 * use (loaded directly by opportunities.html, a flat file at the repo
 * root — not a subfolder), not as a Node-importable module (no
 * module.exports, and it may not even be valid to `require()` directly if
 * it references browser globals elsewhere in the file).
 *
 * REVISION — the previous version of this file used Node's `vm` module
 * (vm.createContext + vm.runInContext) to evaluate the source, then read
 * the result off the sandbox object as sandbox.competitions. That's the
 * actual bug behind "No top-level `competitions` array found" persisting
 * even after the variable name was corrected: a top-level `const` (or
 * `let`) declaration, when run via vm.runInContext, does NOT attach to
 * the context object as a property — only `var` does. This is a genuine,
 * confirmed quirk of that API, not a guess; reproduced locally before
 * writing this fix. Since competitions-data.js uses `const`, sandbox.
 * competitions was always going to be undefined regardless of the
 * variable's actual name.
 *
 * Fixed by using the `Function` constructor instead: the file's source is
 * pasted directly into a new function body, followed by an explicit
 * `return competitions;` — because that return statement lives in the
 * SAME function scope as the pasted `const` declaration, it can see it
 * directly, with no object-property step involved at all.
 *
 * Run manually or via CI:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/sync-opportunities.js
 *
 * ASSUMED SCHEMA (confirm against the real `opportunities` table before
 * running): columns id (text/uuid, primary key), name (text),
 * reg_closes (date/timestamp), url (text).
 * ─────────────────────────────────────────────────────────────────────────
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SOURCE_FILE = path.join(__dirname, '..', 'competitions-data.js');

function loadCompetitionsArray(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const evaluate = new Function(
    src + '\nreturn (typeof competitions !== "undefined") ? competitions : undefined;'
  );
  const result = evaluate();

  if (!Array.isArray(result)) {
    throw new Error('No top-level `competitions` array found after evaluating ' + filePath);
  }
  return result;
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set in the environment.');
    process.exit(1);
  }

  let opportunities;
  try {
    opportunities = loadCompetitionsArray(SOURCE_FILE);
  } catch (err) {
    console.error('Failed to load the opportunities array:', err.message);
    process.exit(1);
  }

  const rows = opportunities
    .filter((o) => !!(o && o.regCloses))
    .map((o) => ({
      id: o.id,
      name: o.name,
      reg_closes: o.regCloses,
      url: o.url
    }));

  // Not in the original spec, added defensively: if the array parsed but
  // yielded zero qualifying rows, that's far more likely a bug in this
  // script (or a source-file change that broke the vm evaluation) than a
  // genuine "no opportunities have deadlines" state — abort rather than
  // silently upserting nothing.
  if (rows.length === 0) {
    console.error('No opportunities with a regCloses value were found — aborting without touching the table.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from('opportunities')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Upsert into `opportunities` failed:', error.message);
    process.exit(1);
  }

  console.log('Synced ' + rows.length + ' opportunit' + (rows.length === 1 ? 'y' : 'ies') + ' into Supabase.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
