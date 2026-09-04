/**
 * Migration 002: Add CHECK constraints to alerts table
 *
 * Runs on an existing database where the alerts table was created
 * by schema.js with CREATE TABLE IF NOT EXISTS (no constraints).
 *
 * Handles:
 *   - Existing rows with invalid severity values (fixes them to 'info')
 *   - Existing rows with invalid verification_level (fixes to 'unverified')
 *   - Adds radius_km column if missing
 *   - Adds CHECK constraints for severity + verification_level
 *   - Adds performance indexes
 */
require('dotenv').config();
const { connectDB, pool, query } = require('../../src/config/postgres');

const MIGRATION_NAME = '002_add_alert_constraints';

async function up() {
  console.log(`\n🔄 Running migration: ${MIGRATION_NAME}\n`);

  // 1. Fix existing invalid severity values before adding constraint
  console.log('  Fixing invalid severity values...');
  await query(`UPDATE alerts SET severity = 'info' WHERE severity NOT IN ('info', 'warning', 'critical')`);

  // 2. Fix existing invalid verification_level values
  console.log('  Fixing invalid verification_level values...');
  await query(`UPDATE alerts SET verification_level = 'unverified' WHERE verification_level NOT IN ('unverified', 'community_verified', 'mod_verified', 'official')`);

  // 3. Add radius_km column if missing
  console.log('  Adding radius_km column if missing...');
  try {
    await query(`ALTER TABLE alerts ADD COLUMN IF NOT EXISTS radius_km NUMERIC(6,2)`);
    console.log('    radius_km column ready (NUMERIC(6,2))');
  } catch (e) {
    console.log('    radius_km column already exists');
  }

  // 4. Add severity CHECK constraint (idempotent)
  console.log('  Adding severity CHECK constraint...');
  try {
    await query(`
      ALTER TABLE alerts
        ADD CONSTRAINT alerts_severity_check
        CHECK (severity IN ('info', 'warning', 'critical'))
    `);
    console.log('    alerts_severity_check added');
  } catch (e) {
    if (e.code === '42710') {
      console.log('    alerts_severity_check already exists');
    } else {
      throw e;
    }
  }

  // 5. Add verification_level CHECK constraint (idempotent)
  console.log('  Adding verification_level CHECK constraint...');
  try {
    await query(`
      ALTER TABLE alerts
        ADD CONSTRAINT alerts_verification_level_check
        CHECK (verification_level IN ('unverified', 'community_verified', 'mod_verified', 'official'))
    `);
    console.log('    alerts_verification_level_check added');
  } catch (e) {
    if (e.code === '42710') {
      console.log('    alerts_verification_level_check already exists');
    } else {
      throw e;
    }
  }

  // 6. Add performance indexes
  console.log('  Adding indexes...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_verification ON alerts(verification_level)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_radius ON alerts(radius_km)',
  ];
  for (const sql of indexes) {
    try {
      await query(sql);
    } catch {}
  }
  console.log('    indexes ready');

  // 7. Verify constraints are active
  console.log('\n  Verifying constraints...');
  const severityCheck = await query(`
    SELECT conname, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'alerts'::regclass
    AND conname = 'alerts_severity_check'
  `);
  if (severityCheck.rows.length > 0) {
    console.log(`    ✅ ${severityCheck.rows[0].conname}: ${severityCheck.rows[0].pg_get_constraintdef}`);
  } else {
    console.error('    ❌ alerts_severity_check NOT FOUND');
    process.exitCode = 1;
  }

  const verificationCheck = await query(`
    SELECT conname, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'alerts'::regclass
    AND conname = 'alerts_verification_level_check'
  `);
  if (verificationCheck.rows.length > 0) {
    console.log(`    ✅ ${verificationCheck.rows[0].conname}: ${verificationCheck.rows[0].pg_get_constraintdef}`);
  } else {
    console.error('    ❌ alerts_verification_level_check NOT FOUND');
    process.exitCode = 1;
  }

  // 8. Show current row counts by severity
  const counts = await query(`SELECT severity, COUNT(*)::int AS count FROM alerts GROUP BY severity ORDER BY count DESC`);
  if (counts.rows.length > 0) {
    console.log('\n  Current alerts by severity:');
    for (const r of counts.rows) {
      console.log(`    ${r.severity}: ${r.count}`);
    }
  }

  console.log(`\n✅ Migration ${MIGRATION_NAME} completed.\n`);
}

async function run() {
  try {
    await connectDB();
    await up();
  } catch (error) {
    console.error(`\n❌ Migration ${MIGRATION_NAME} failed:`, error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  run();
}

module.exports = { up, MIGRATION_NAME };
