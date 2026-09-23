/**
 * Read-only migration parity inspector.
 *
 * Compares the canonical novel-feature contract (impact_metrics,
 * user_skills, skill_matches) against the live database so a fresh
 * production database and an upgraded existing database can be
 * proven to reach the same schema.
 *
 * Run: node scripts/verify-migration-parity.js
 * NEVER mutates the database.
 */
require('dotenv').config();
const { connectDB, pool, query } = require('../src/config/postgres');

let failed = 0;
let checked = 0;

function check(ok, label) {
  checked++;
  if (ok) {
    console.log(`  OK   ${label}`);
  } else {
    failed++;
    console.log(`  FAIL ${label}`);
  }
}

async function tableExists(name) {
  const r = await query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [name]
  );
  return r.rows.length > 0;
}

async function columnsOf(table) {
  const r = await query(
    `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1
     ORDER BY ordinal_position`,
    [table]
  );
  return r.rows;
}

async function constraintsOf(table) {
  const r = await query(
    `SELECT conname, pg_get_constraintdef(oid) AS def
     FROM pg_constraint
     WHERE conrelid = $1::regclass
     ORDER BY conname`,
    [table]
  );
  return r.rows;
}

async function indexesOf(table) {
  const r = await query(
    `SELECT indexname, indexdef
     FROM pg_indexes
     WHERE schemaname='public' AND tablename=$1
     ORDER BY indexname`,
    [table]
  );
  return r.rows;
}

async function main() {
  await connectDB();
  console.log('\n=== Migration parity verification (read-only) ===\n');

  // ---- tables exist ----
  console.log('Tables:');
  for (const t of ['impact_metrics', 'user_skills', 'skill_matches']) {
    check(await tableExists(t), `${t} exists`);
  }

  // ---- impact_metrics ----
  console.log('\nimpact_metrics columns:');
  const imCols = await columnsOf('impact_metrics');
  const im = Object.fromEntries(imCols.map((c) => [c.column_name, c]));
  check(!!im.event_type, 'event_type present');
  check(im.event_type && im.event_type.character_maximum_length >= 50, 'event_type length >= 50');
  check(!!im.impact_value, 'impact_value present');
  check(!!im.reference_id, 'reference_id present');
  check(im.reference_id && im.reference_id.is_nullable === 'YES', 'reference_id nullable (dual-credit + bare inserts)');
  check(!!im.user_id && !!im.created_at, 'user_id + created_at present');

  console.log('\nimpact_metrics constraints/indexes:');
  const imCons = await constraintsOf('impact_metrics');
  const imIdx = await indexesOf('impact_metrics');
  const imConsNames = imCons.map((c) => c.conname);
  const imIdxNames = imIdx.map((i) => i.indexname);
  check(!imConsNames.includes('unique_impact_reference'), 'NO unique_impact_reference (legacy 005 bug absent)');
  check(
    imIdxNames.includes('uq_impact_metrics_event') ||
      imConsNames.some((n) => n.includes('impact') && n.includes('event')),
    'uq_impact_metrics_event present (user, event, reference dedupe)'
  );
  check(imIdxNames.includes('idx_impact_metrics_created'), 'idx_impact_metrics_created present');

  // ---- user_skills ----
  console.log('\nuser_skills columns:');
  const usCols = await columnsOf('user_skills');
  const us = Object.fromEntries(usCols.map((c) => [c.column_name, c]));
  check(!!us.skill_name && !!us.proficiency && !!us.is_offering && !!us.is_seeking, 'core columns present');

  console.log('\nuser_skills constraints/indexes:');
  const usCons = await constraintsOf('user_skills');
  const usIdx = await indexesOf('user_skills');
  const usConsNames = usCons.map((c) => c.conname);
  const usIdxNames = usIdx.map((i) => i.indexname);
  check(!usConsNames.includes('unique_user_skill'), 'NO case-sensitive unique_user_skill');
  check(
    usIdxNames.includes('uq_user_skills_normalized') ||
      usCons.some((c) => c.def && c.def.includes('lower(')),
    'normalized skill uniqueness present (LOWER(skill_name))'
  );
  check(
    usCons.some((c) => c.def && /proficiency/i.test(c.def) && /(1)|(5)/.test(c.def)),
    'proficiency range CHECK present'
  );
  check(usIdxNames.includes('idx_user_skills_user_id') || usIdxNames.includes('idx_user_skills_skill_name'), 'user_skills lookup index present');

  // ---- skill_matches ----
  console.log('\nskill_matches columns:');
  const smCols = await columnsOf('skill_matches');
  const sm = Object.fromEntries(smCols.map((c) => [c.column_name, c]));
  check(!!sm.user1_id && !!sm.user2_id && !!sm.status, 'core columns present');
  check(!!sm.match_score, 'match_score column present');
  check(!!sm.matching_skills && !!sm.requested_skills, 'matching_skills + requested_skills present');
  check(!!sm.quality_rating && !!sm.completed_at, 'quality_rating + completed_at present');

  console.log('\nskill_matches constraints/indexes:');
  const smCons = await constraintsOf('skill_matches');
  const smIdx = await indexesOf('skill_matches');
  const smConsNames = smCons.map((c) => c.conname);
  const smIdxNames = smIdx.map((i) => i.indexname);
  check(
    smCons.some((c) => c.def && /user1_id/i.test(c.def) && /user2_id/i.test(c.def) && /<>|!=/.test(c.def)),
    'prevent_self_match CHECK present'
  );
  check(
    smCons.some((c) => c.def && /status/i.test(c.def) && /pending/.test(c.def)),
    'status domain CHECK present'
  );
  check(
    smCons.some((c) => c.def && /quality_rating/i.test(c.def)),
    'quality_rating range CHECK present'
  );
  check(smIdxNames.includes('uq_skill_matches_pending_pair'), 'uq_skill_matches_pending_pair present');
  check(smIdxNames.includes('idx_skill_matches_user2'), 'idx_skill_matches_user2 present');
  check(smIdxNames.includes('idx_skill_matches_users'), 'idx_skill_matches_users present');

  // ---- migration registration sanity (source file, not DB) ----
  console.log('\nSource chain:');
  const fs = require('fs');
  const path = require('path');
  const migrateSrc = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');
  check(migrateSrc.includes("005_novel_features"), 'migrate.js registers 005');
  check(migrateSrc.includes("006_impact_skills_enforcement"), 'migrate.js registers 006');
  check(!migrateSrc.includes("006_novel_features_enforcement"), 'migrate.js does NOT register orphan 006_novel_features_enforcement');

  const supabaseSql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migration.sql'), 'utf8');
  check(supabaseSql.includes('match_score'), 'supabase/migration.sql has match_score');
  check(supabaseSql.includes('uq_impact_metrics_event'), 'supabase/migration.sql has uq_impact_metrics_event');
  check(supabaseSql.includes('uq_skill_matches_pending_pair'), 'supabase/migration.sql has uq_skill_matches_pending_pair');
  check(supabaseSql.includes('uq_user_skills_normalized') || supabaseSql.includes('LOWER(skill_name)'), 'supabase/migration.sql has normalized skill uniqueness');
  check(!supabaseSql.includes('unique_impact_reference'), 'supabase/migration.sql has NO unique_impact_reference');
  check(!supabaseSql.includes('CONSTRAINT unique_user_skill'), 'supabase/migration.sql has NO unique_user_skill');

  console.log(`\n=== Result: ${checked - failed}/${checked} checks passed ===`);
  if (failed > 0) {
    console.log(`${failed} FAIL(S) — schema is not at parity.`);
    process.exitCode = 1;
  } else {
    console.log('Parity OK.');
  }
  await pool.end();
}

main().catch((e) => {
  console.error('Parity check crashed:', e.message);
  process.exitCode = 2;
});
