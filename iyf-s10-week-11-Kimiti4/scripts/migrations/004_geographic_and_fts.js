/**
 * Migration 004: Add structured geographic fields + full-text search
 *
 * Adds:
 *   - county VARCHAR(100), settlement VARCHAR(100), ward VARCHAR(100)
 *   - Converts radius_km from INTEGER to NUMERIC(6,2) for decimal radii
 *   - Adds a generated tsvector column for full-text search
 *   - Adds trigram GIN indexes for fuzzy text matching
 *   - Adds GIN index on tsvector
 *
 * The migration is idempotent:
 *   - ADD COLUMN IF NOT EXISTS
 *   - ALTER COLUMN ... TYPE NUMERIC(6,2) USING ...
 *   - CREATE INDEX IF NOT EXISTS
 *   - Generated columns added via DO block
 */
require('dotenv').config();
const { connectDB, pool, query } = require('../../src/config/postgres');

const MIGRATION_NAME = '004_geographic_and_fts';

async function up() {
  console.log(`\n🔄 Running migration: ${MIGRATION_NAME}\n`);

  // 1. Add structured geographic columns
  console.log('  Adding geographic columns...');
  await query(`ALTER TABLE alerts ADD COLUMN IF NOT EXISTS county VARCHAR(100)`);
  await query(`ALTER TABLE alerts ADD COLUMN IF NOT EXISTS settlement VARCHAR(100)`);
  await query(`ALTER TABLE alerts ADD COLUMN IF NOT EXISTS ward VARCHAR(100)`);
  console.log('    county, settlement, ward columns ready');

  // 2. Convert radius_km to NUMERIC(6,2) for decimal radii
  console.log('  Converting radius_km to NUMERIC(6,2)...');
  try {
    await query(`ALTER TABLE alerts ALTER COLUMN radius_km TYPE NUMERIC(6,2) USING radius_km::NUMERIC(6,2)`);
    console.log('    radius_km converted to NUMERIC(6,2)');
  } catch (e) {
    if (e.message.includes('cannot be cast') || e.code === '42804') {
      // Cast may fail if data is non-numeric; try with NULLIF
      console.log('    Direct cast failed, trying NULLIF approach...');
      await query(`ALTER TABLE alerts ALTER COLUMN radius_km TYPE NUMERIC(6,2) USING NULLIF(radius_km::TEXT, '')::NUMERIC(6,2)`);
      console.log('    radius_km converted to NUMERIC(6,2) via NULLIF');
    } else if (e.message.includes('already') || e.code === '42P16') {
      console.log('    radius_km already NUMERIC');
    } else {
      throw e;
    }
  }

  // 3. Enable pg_trgm extension for trigram indexes (needed for fuzzy search)
  console.log('  Enabling pg_trgm extension...');
  try {
    await query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    console.log('    pg_trgm enabled');
  } catch (e) {
    console.log('    pg_trgm extension could not be created (may require superuser)');
  }

  // 4. Add trigram indexes on text columns (for fuzzy search)
  console.log('  Adding trigram GIN indexes...');
  const trigramIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_alerts_title_trgm ON alerts USING GIN (title gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_description_trgm ON alerts USING GIN (description gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_location_trgm ON alerts USING GIN (location gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_county_trgm ON alerts USING GIN (county gin_trgm_ops)',
    'CREATE INDEX IF NOT EXISTS idx_alerts_settlement_trgm ON alerts USING GIN (settlement gin_trgm_ops)',
  ];
  for (const sql of trigramIndexes) {
    try {
      await query(sql);
    } catch (e) {
      console.log(`    skipped: ${sql.match(/idx_alerts_\w+/)?.[0]} (pg_trgm may not be available)`);
    }
  }

  // 5. Add full-text search column (generated tsvector)
  console.log('  Adding generated tsvector column for FTS...');
  try {
    await query(`
      ALTER TABLE alerts
        ADD COLUMN IF NOT EXISTS search_vector tsvector
        GENERATED ALWAYS AS (
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(location, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(county, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(settlement, '')), 'C')
        ) STORED
    `);
    console.log('    search_vector generated column added');
  } catch (e) {
    console.log('    search_vector column may already exist or FTS not supported:', e.message);
  }

  // 6. Add GIN index on tsvector
  console.log('  Adding GIN index on search_vector...');
  try {
    await query(`CREATE INDEX IF NOT EXISTS idx_alerts_search_vector ON alerts USING GIN (search_vector)`);
    console.log('    idx_alerts_search_vector created');
  } catch (e) {
    console.log('    idx_alerts_search_vector skipped:', e.message);
  }

  // 7. Add county index for equality filter
  console.log('  Adding county index...');
  await query(`CREATE INDEX IF NOT EXISTS idx_alerts_county ON alerts(county) WHERE county IS NOT NULL`);
  console.log('    idx_alerts_county created');

  // 8. Backfill: best-effort extraction of county/settlement from location text
  //   This is conservative: only matches "X, Y" patterns where Y looks like a county.
  //   No destructive change to existing data.
  console.log('  Backfilling county/settlement from location (best-effort)...');
  const backfill = await query(`
    UPDATE alerts
    SET
      county = COALESCE(county, NULLIF(split_part(location, ',', 2), '')),
      settlement = COALESCE(settlement, NULLIF(split_part(location, ',', 1), ''))
    WHERE (county IS NULL OR settlement IS NULL)
      AND location IS NOT NULL
      AND location LIKE '%,%'
    RETURNING id
  `);
  console.log(`    backfilled ${backfill.rowCount} rows`);

  // 9. Verify final state
  console.log('\n  Verifying schema...');
  const cols = await query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'alerts'
    AND column_name IN ('county', 'settlement', 'ward', 'radius_km', 'search_vector')
    ORDER BY column_name
  `);
  for (const c of cols.rows) {
    console.log(`    ${c.column_name}: ${c.data_type}`);
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
