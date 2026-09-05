/**
 * Rotate the founder account's password.
 *
 * Reads the new plaintext password from FOUNDER_PASSWORD (required),
 * hashes it with bcrypt (matching the seed's 10 rounds), and UPDATEs
 * the users table. No plaintext is ever written to the repo.
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

const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL || 'kimiti.kariuki75@gmail.com';
const BCRYPT_ROUNDS = 10;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/jamiilink_db'
});

async function rotate() {
  const client = await pool.connect();
  try {
    const existing = await client.query(
      'SELECT id, email, role, is_founder FROM users WHERE email = $1',
      [FOUNDER_EMAIL]
    );
    if (existing.rows.length === 0) {
      console.error(`No user found with email ${FOUNDER_EMAIL}`);
      console.error('Run the seed first: node src/seeds/founder-postgres.js');
      process.exit(2);
    }

    const user = existing.rows[0];
    console.log(`Found user: id=${user.id} email=${user.email} role=${user.role} is_founder=${user.is_founder}`);

    console.log('Hashing new password...');
    const hashed = await bcrypt.hash(NEW_PASSWORD, BCRYPT_ROUNDS);

    const result = await client.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, updated_at',
      [hashed, user.id]
    );

    console.log('Password rotated successfully:');
    console.log(`  id:        ${result.rows[0].id}`);
    console.log(`  email:     ${result.rows[0].email}`);
    console.log(`  updated_at: ${result.rows[0].updated_at}`);
  } catch (err) {
    console.error('Rotation failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('PostgreSQL is not running. Start the service and retry.');
    } else if (err.code === '3D000') {
      console.error('Database does not exist. Create it first.');
    } else if (err.code === '42P01') {
      console.error('users table does not exist. Run migrations first: npm run db:migrate:all');
    } else if (err.code === '28P01') {
      console.error('Password authentication failed. Check DATABASE_URL credentials.');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

rotate();
