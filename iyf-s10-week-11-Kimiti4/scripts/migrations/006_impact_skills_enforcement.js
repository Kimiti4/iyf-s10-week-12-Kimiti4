const { query } = require('../../src/config/postgres');

const MIGRATION_NAME = '006_impact_skills_enforcement';

/**
 * Phase 4/5/6: enforcement indexes on the NOVEL tables.
 *
 * This migration is INCREMENTAL over 005 (which created the tables). It adds
 * only the enforcement surfaces the controllers now depend on:
 *   - impact_metrics: partial UNIQUE (user_id, event_type, reference_id) to
 *     dedupe authored impact events (biggest driver: SkillSwap completion
 *     credits both users with reference = match_id, so the pair never
 *     double-counts), plus a (user_id, created_at DESC) index for the
 *     monthly dashboard aggregation.
 *   - skill_matches: partial UNIQUE (user1_id, user2_id) WHERE status =
 *     'pending' so a pending pair cannot be duplicated and match ids stay
 *     stable/real; plus a (user2_id) lookup index for "matches I received".
 *
 * All statements are idempotent and safe to re-run.
 */
async function up() {
  console.log('Running migration 006_impact_skills_enforcement...');

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_impact_metrics_event
      ON impact_metrics (user_id, event_type, reference_id)
      WHERE reference_id IS NOT NULL
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_impact_metrics_created
      ON impact_metrics (user_id, created_at DESC)
  `)

  // skill_matches schemas in 005 include match_score/matching_skills/
  // requested_skills; if any of the three columns is still missing on the
  // live DB, add it here (idempotent) so controllers can depend on them.
  await query(`
    ALTER TABLE skill_matches
      ADD COLUMN IF NOT EXISTS match_score NUMERIC(4,2),
      ADD COLUMN IF NOT EXISTS matching_skills INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS requested_skills INT DEFAULT 0
  `)

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_skill_matches_pending_pair
      ON skill_matches (user1_id, user2_id)
      WHERE status = 'pending'
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_skill_matches_user2
      ON skill_matches (user2_id)
  `)

  console.log('Migration 006_impact_skills_enforcement completed successfully.');
}

async function down() {
  console.log('Reverting migration 006_impact_skills_enforcement...');

  await query(`DROP INDEX IF EXISTS uq_impact_metrics_event`);
  await query(`DROP INDEX IF EXISTS idx_impact_metrics_created`);
  await query(`DROP INDEX IF EXISTS uq_skill_matches_pending_pair`);
  await query(`DROP INDEX IF EXISTS idx_skill_matches_user2`);

  console.log('Reversion 006_impact_skills_enforcement completed.');
}

// Support running directly or being required
if (require.main === module) {
  up().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  module.exports = { up, down, MIGRATION_NAME };
}
