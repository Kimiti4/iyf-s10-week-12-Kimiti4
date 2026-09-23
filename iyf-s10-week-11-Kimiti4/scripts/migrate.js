require('dotenv').config();

const { connectDB, pool } = require('../src/config/postgres');
const { createTables } = require('../src/database/schema');
const m002 = require('./migrations/002_add_alert_constraints');
const m004 = require('./migrations/004_geographic_and_fts');
const m005 = require('./migrations/005_novel_features');
const m006 = require('./migrations/006_impact_skills_enforcement');

async function migrate() {
  await connectDB();
  // 001: Bootstrap (creates tables if they don't exist)
  await createTables();
  console.log('✅ 001: Tables created (idempotent)');

  // 002: Add CHECK constraints for severity + verification_level,
  //     add radius_km column, performance indexes
  await m002.up();
  console.log(`✅ 002: ${m002.MIGRATION_NAME} applied`);

  // 004: Add structured geographic fields (county, settlement, ward),
  //     convert radius_km to NUMERIC(6,2), full-text search + trigram
  await m004.up();
  console.log(`✅ 004: ${m004.MIGRATION_NAME} applied`);

  // 005: Novel features enforcement (alert constraints, dedupe, fts triggers)
  await m005.up();
  console.log(`✅ 005: ${m005.MIGRATION_NAME} applied`);

  // 006: Impact Metrics + Skill Matches enforcement (dedupe indexes,
  //     match_score columns, pending-pair uniqueness)
  await m006.up();
  console.log(`✅ 006: ${m006.MIGRATION_NAME} applied`);

  console.log('\n✅ All PostgreSQL migrations completed.');
}

migrate()
  .catch((error) => {
    console.error('❌ PostgreSQL migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });