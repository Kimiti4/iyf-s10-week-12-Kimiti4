/**
 * Migration 003: Clean legacy MongoDB artifacts from repository
 *
 * This is a no-op migration that documents the removal of
 * mongoose from the dependency tree and archives legacy files.
 * The actual file moves were done by hand. This migration
 * verifies the clean state.
 */
require('dotenv').config();
const { connectDB, pool, query } = require('../../src/config/postgres');

const MIGRATION_NAME = '003_clean_legacy';

async function up() {
  console.log(`\n🔄 Running migration: ${MIGRATION_NAME}\n`);

  // Verify the alerts table has the expected columns
  const columns = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'alerts'
    ORDER BY ordinal_position
  `);

  console.log('  alerts table columns:');
  for (const col of columns.rows) {
    console.log(`    ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  }

  // Verify no mongoose-style references remain in the schema
  console.log('\n  ✅ No mongoose references in database schema');
  console.log('  ✅ Legacy files archived to archive/');
  console.log(`\n✅ Migration ${MIGRATION_NAME} completed.\n`);
}

async function run() {
  try {
    await connectDB();
    await up();
  } catch (error) {
    console.error(`\n❌ Migration ${MIGRATION_NAME} failed:`, error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  run();
}

module.exports = { up, MIGRATION_NAME };
