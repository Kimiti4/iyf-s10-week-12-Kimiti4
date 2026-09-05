/**
 * Rotate the founder account's password (or create it if missing).
 *
 * Reads the new plaintext password from FOUNDER_PASSWORD (required, min 12 chars),
 * hashes it with bcrypt (10 rounds, matching the seed), and either UPDATEs the
 * existing user or INSERTs a new founder row. Idempotent and safe to re-run.
 *
 * Adapts to the live flat-schema `users` table (not the legacy JSONB seed).
 *
 * Usage:
 *   $env:FOUNDER_PASSWORD = 'YourNewStrongPassword'
 *   node scripts/rotate-founder.js
 *
 * Optional env:
 *   FOUNDER_EMAIL  (default: kimiti.kariuki75@gmail.com)
 *   DATABASE_URL   (default: postgresql://postgres:@localhost:5432/jamiilink_db)
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const NEW_PASSWORD = process.env.FOUNDER_PASSWORD;
if (!NEW_PASSWORD) {
  console.error('FOUNDER_PASSWORD environment variable is required.');
  console.error('Example: $env:FOUNDER_PASSWORD="..." ; node scripts/rotate-founder.js');
  process.exit(1);
}
if (NEW_PASSWORD.length < 12) {
  console.error('FOUNDER_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

const EMAIL = process.env.FOUNDER_EMAIL || 'kimiti.kariuki75@gmail.com';
const BCRYPT_ROUNDS = 10;

const FOUNDER = {
  username: 'Snooz3',
  email: EMAIL,
  role: 'founder',
  is_founder: true,
  bio: 'Snoz# - Platform Founder & Creator | Building community-powered solutions for Kenya',
  location_county: 'Nairobi',
  location_settlement: 'Westlands',
  location_ward: null,
  skills: ['Full Stack Development', 'Community Building', 'Social Innovation', 'Mobile Apps'],
  avatar_url: null,
  avatar_icon: '👑',
  verification_is_verified: true,
  verification_type: 'manual',
  verification_badge_level: 'diamond',
  verification_badge_color: '#FFD700',
  verification_notes: 'Platform founder & creator - Diamond tier (highest level)',
  mfa_enabled: true,
  mfa_require_all_methods: true,
  reputation_score: 100,
  reputation_level: 'legendary',
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/jamiilink_db'
});

async function run() {
  const client = await pool.connect();
  try {
    const hashed = await bcrypt.hash(NEW_PASSWORD, BCRYPT_ROUNDS);
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [EMAIL]);

    if (existing.rows.length > 0) {
      await client.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
        [hashed, EMAIL]
      );
      console.log(`Rotated password for existing founder: ${EMAIL} (id=${existing.rows[0].id})`);
      return;
    }

    const result = await client.query(
      `INSERT INTO users (
        username, email, password, role, is_founder, bio,
        location_county, location_settlement, location_ward,
        skills, avatar_url, avatar_icon,
        verification_is_verified, verification_type, verification_badge_level,
        verification_badge_color, verification_notes,
        mfa_enabled, mfa_require_all_methods,
        reputation_score, reputation_level
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      ) RETURNING id, email, username, role, is_founder`,
      [
        FOUNDER.username, FOUNDER.email, hashed, FOUNDER.role, FOUNDER.is_founder,
        FOUNDER.bio, FOUNDER.location_county, FOUNDER.location_settlement,
        FOUNDER.location_ward, FOUNDER.skills, FOUNDER.avatar_url, FOUNDER.avatar_icon,
        FOUNDER.verification_is_verified, FOUNDER.verification_type,
        FOUNDER.verification_badge_level, FOUNDER.verification_badge_color,
        FOUNDER.verification_notes, FOUNDER.mfa_enabled, FOUNDER.mfa_require_all_methods,
        FOUNDER.reputation_score, FOUNDER.reputation_level,
      ]
    );
    console.log('Created founder:', result.rows[0]);
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.code === 'ECONNREFUSED') console.error('PostgreSQL is not running.');
    else if (err.code === '28P01') console.error('Auth failed. Check DATABASE_URL in .env.');
    else if (err.code === '3D000') console.error('Database does not exist.');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
