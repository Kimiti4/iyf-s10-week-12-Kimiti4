/**
 * 🌱 Seed Script - Create Founder Account in PostgreSQL
 * 
 * This script creates the founder account directly in PostgreSQL database
 * Run this after setting up PostgreSQL and creating the database
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/jamiilink_db'
});

// Founder account details
const FOUNDER_DATA = {
  username: 'Snooz3',
  email: 'kimiti.kariuki75@gmail.com',
  password: '#gunzNroz3z_6G1GWY#',
  role: 'founder',
  isFounder: true,
  profile: {
    bio: 'Snoz# - Platform Founder & Creator | Building community-powered solutions for Kenya 🇰🇪',
    location: {
      county: 'Nairobi',
      settlement: 'Westlands'
    },
    skills: ['Full Stack Development', 'Community Building', 'Social Innovation', 'Mobile Apps'],
    avatarIcon: '👑'
  },
  verification: {
    isVerified: true,
    badgeLevel: 'diamond',
    verificationType: 'manual',
    verifiedAt: new Date().toISOString(),
    verificationNotes: 'Platform founder & creator - Diamond tier (highest level)',
    badgeColor: '#FFD700'
  },
  mfa: {
    enabled: true,
    methods: [
      { type: 'totp', verified: true, primary: true },
      { type: 'email', verified: true, primary: false, email: 'amos.kimiti@jamiilink.ke' },
      { type: 'sms', verified: false, primary: false }
    ],
    requireAllMethods: true,
    lastVerified: new Date().toISOString(),
    failedAttempts: 0
  }
};

async function seedFounderAccount() {
  let client;
  
  try {
    console.log('\n🌱 Starting Founder Account Seed...\n');
    
    // Get database client
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database\n');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist!');
      console.log('💡 Run migrations first: node src/migrations/001-create-users.js\n');
      return;
    }

    // Check if founder already exists
    const existingUser = await client.query(
      'SELECT id, username, email FROM users WHERE email = $1 OR username = $2',
      [FOUNDER_DATA.email, FOUNDER_DATA.username]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Founder account already exists!');
      console.log(`   Username: ${existingUser.rows[0].username}`);
      console.log(`   Email: ${existingUser.rows[0].email}\n`);
      console.log('💡 To recreate, delete the existing user first:\n');
      console.log(`   DELETE FROM users WHERE email = '${FOUNDER_DATA.email}';\n`);
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(FOUNDER_DATA.password, 10);
    console.log('✅ Password hashed successfully\n');

    // Insert founder account
    console.log('📝 Creating founder account...');
    const result = await client.query(`
      INSERT INTO users (
        username,
        email,
        password,
        role,
        is_founder,
        profile,
        verification,
        mfa,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, username, email, role, is_founder, created_at
    `, [
      FOUNDER_DATA.username,
      FOUNDER_DATA.email,
      hashedPassword,
      FOUNDER_DATA.role,
      FOUNDER_DATA.isFounder,
      JSON.stringify(FOUNDER_DATA.profile),
      JSON.stringify(FOUNDER_DATA.verification),
      JSON.stringify(FOUNDER_DATA.mfa)
    ]);

    const newUser = result.rows[0];

    console.log('\n✅ Founder Account Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Account Details:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   Is Founder: ${newUser.is_founder}`);
    console.log(`   Created: ${newUser.created_at}`);
    console.log('');
    console.log('🎨 Profile Features:');
    console.log(`   Avatar Icon: ${FOUNDER_DATA.profile.avatarIcon}`);
    console.log(`   Badge Level: ${FOUNDER_DATA.verification.badgeLevel} 💎`);
    console.log(`   Badge Color: ${FOUNDER_DATA.verification.badgeColor}`);
    console.log(`   MFA Enabled: ${FOUNDER_DATA.mfa.enabled} (3-Factor)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🚀 HOW TO LOGIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. Start frontend: cd iyf-s10-week-09-Kimiti4 && npm run dev');
    console.log('   2. Go to: http://localhost:5173/login');
    console.log('   3. Email: amos.kimiti@jamiilink.ke');
    console.log('   4. Password: Kimiti@2026!Founder#MFA');
    console.log('   5. Click "👑 Founder" button in navbar');
    console.log('   6. Access dashboard at: /admin/founder');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   - Change password immediately after first login');
    console.log('   - Setup MFA authenticator app (Google Authenticator/Authy)');
    console.log('   - Save backup codes in secure location');
    console.log('   - Never share credentials with anyone');
    console.log('   - Use strong, unique passwords\n');

  } catch (error) {
    console.error('\n❌ Error seeding founder account:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL is not running!');
      console.error('   Start PostgreSQL service and try again.\n');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist!');
      console.error('   Create database: psql -U postgres -c "CREATE DATABASE jamiilink_db;"\n');
    } else if (error.code === '42P01') {
      console.error('\n💡 Users table does not exist!');
      console.error('   Run migrations first.\n');
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('🔌 Database connection closed.\n');
  }
}

// Run the seed function
seedFounderAccount();
