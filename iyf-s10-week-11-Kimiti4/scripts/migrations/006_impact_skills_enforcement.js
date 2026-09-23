const { query } = require('../../src/config/postgres');

const MIGRATION_NAME = '006_impact_skills_enforcement';

/**
 * Phase 4/5/6: canonical novel-feature schema convergence.
 *
 * Idempotent upgrade path. After this migration, an upgraded existing
 * database matches a fresh database created by schema.js (001) and by
 * supabase/migration.sql:
 *
 *   - impact_metrics: NO unique_impact_reference (legacy 005 bug — made
 *     reference_id globally unique and blocked dual-credit SkillSwap
 *     completions). Instead: partial UNIQUE (user_id, event_type,
 *     reference_id) for deterministic dedupe, plus aggregation indexes.
 *   - user_skills: case-sensitive unique_user_skill dropped; replaced by
 *     normalized LOWER(skill_name) uniqueness + proficiency range CHECK.
 *   - skill_matches: match_score/matching_skills/requested_skills columns,
 *     status/quality_rating/prevent_self_match CHECKs, pending-pair
 *     uniqueness, and lookup indexes.
 *
 * All statements are idempotent and safe to re-run.
 */
async function up() {
  console.log(`Running migration: ${MIGRATION_NAME}...`);

  // ===== impact_metrics: drop legacy global uniqueness if present =====
  await query(`ALTER TABLE impact_metrics DROP CONSTRAINT IF EXISTS unique_impact_reference`);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_impact_metrics_event
      ON impact_metrics (user_id, event_type, reference_id)
      WHERE reference_id IS NOT NULL
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_impact_metrics_created
      ON impact_metrics (user_id, created_at DESC)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_impact_metrics_user_id
      ON impact_metrics (user_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_impact_metrics_event_type
      ON impact_metrics (event_type)
  `);

  // ===== user_skills: drop case-sensitive unique, add normalized + CHECK =====
  await query(`ALTER TABLE user_skills DROP CONSTRAINT IF EXISTS unique_user_skill`);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_user_skills_normalized
      ON user_skills (user_id, LOWER(skill_name), is_offering, is_seeking)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name
      ON user_skills (skill_name)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_user_skills_user_id
      ON user_skills (user_id)
  `);

  // proficiency range CHECK (idempotent via named constraint guard)
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'user_skills'::regclass
          AND pg_get_constraintdef(oid) LIKE '%proficiency%'
      ) THEN
        ALTER TABLE user_skills
          ADD CONSTRAINT user_skills_proficiency_check
          CHECK (proficiency >= 1 AND proficiency <= 5);
      END IF;
    END $$;
  `);

  // ===== skill_matches: enforcement columns =====
  await query(`
    ALTER TABLE skill_matches
      ADD COLUMN IF NOT EXISTS match_score NUMERIC(4,2),
      ADD COLUMN IF NOT EXISTS matching_skills INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS requested_skills INT DEFAULT 0
  `);

  // status domain CHECK
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'skill_matches'::regclass
          AND conname = 'skill_matches_status_check'
      ) THEN
        ALTER TABLE skill_matches
          ADD CONSTRAINT skill_matches_status_check
          CHECK (status IN ('pending', 'completed', 'cancelled'));
      END IF;
    END $$;
  `);

  // quality_rating range CHECK
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'skill_matches'::regclass
          AND pg_get_constraintdef(oid) LIKE '%quality_rating%'
      ) THEN
        ALTER TABLE skill_matches
          ADD CONSTRAINT skill_matches_quality_rating_check
          CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5));
      END IF;
    END $$;
  `);

  // prevent_self_match CHECK
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'skill_matches'::regclass
          AND pg_get_constraintdef(oid) LIKE '%user1_id%<>%user2_id%'
      ) THEN
        ALTER TABLE skill_matches
          ADD CONSTRAINT prevent_self_match
          CHECK (user1_id != user2_id);
      END IF;
    END $$;
  `);

  // Exactly one PENDING match per user pair.
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_skill_matches_pending_pair
      ON skill_matches (user1_id, user2_id)
      WHERE status = 'pending'
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_skill_matches_user2
      ON skill_matches (user2_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_skill_matches_users
      ON skill_matches (user1_id, user2_id)
  `);

  console.log(`Migration ${MIGRATION_NAME} completed.`);
}

async function down() {
  console.log(`Reverting migration: ${MIGRATION_NAME}...`);

  await query(`DROP INDEX IF EXISTS uq_impact_metrics_event`);
  await query(`DROP INDEX IF EXISTS idx_impact_metrics_created`);
  await query(`DROP INDEX IF EXISTS idx_impact_metrics_user_id`);
  await query(`DROP INDEX IF EXISTS idx_impact_metrics_event_type`);
  await query(`DROP INDEX IF EXISTS uq_user_skills_normalized`);
  await query(`DROP INDEX IF EXISTS idx_skill_matches_pending_pair`);
  await query(`DROP INDEX IF EXISTS uq_skill_matches_pending_pair`);
  await query(`DROP INDEX IF EXISTS idx_skill_matches_user2`);
  await query(`ALTER TABLE user_skills DROP CONSTRAINT IF EXISTS user_skills_proficiency_check`);
  await query(`ALTER TABLE skill_matches DROP CONSTRAINT IF EXISTS skill_matches_status_check`);
  await query(`ALTER TABLE skill_matches DROP CONSTRAINT IF EXISTS skill_matches_quality_rating_check`);
  await query(`ALTER TABLE skill_matches DROP CONSTRAINT IF EXISTS prevent_self_match`);

  console.log(`Reversion ${MIGRATION_NAME} completed.`);
}

// Support running directly or being required
if (require.main === module) {
  up().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
} else {
  module.exports = { up, down, MIGRATION_NAME };
}
