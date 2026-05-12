/**
 * 🗄️ PostgreSQL Database Setup Script
 * 
 * This script creates the database and all required tables
 * Run this BEFORE running the founder seed script
 */

const { Pool } = require('pg');
require('dotenv').config();

// Connect to default postgres database to create our database
// Try different connection strings based on PostgreSQL configuration
const getConnectionString = () => {
  // If DATABASE_URL is set, use it for admin connection
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.replace('/jamiilink_db', '/postgres');
  }
  
  // Try common configurations
  const configs = [
    'postgresql://postgres:@localhost:5432/postgres',  // No password
    'postgresql://postgres:postgres@localhost:5432/postgres',  // Default password
    'postgresql://postgres:password@localhost:5432/postgres',  // Common password
  ];
  
  return configs[0]; // Default to no password
};

const adminPool = new Pool({
  connectionString: getConnectionString()
});

async function setupDatabase() {
  let client;
  
  try {
    console.log('\n🗄️  Starting PostgreSQL Database Setup...\n');
    
    // Connect to PostgreSQL
    client = await adminPool.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check if database exists
    const dbCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_database 
        WHERE datname = 'jamiilink_db'
      );
    `);

    if (!dbCheck.rows[0].exists) {
      console.log('📦 Creating database: jamiilink_db...');
      await client.query('CREATE DATABASE jamiilink_db');
      console.log('✅ Database created successfully\n');
    } else {
      console.log('ℹ️  Database already exists, skipping creation\n');
    }

    client.release();

    // Connect to our database
    const appPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/jamiilink_db'
    });

    client = await appPool.connect();
    console.log('✅ Connected to jamiilink_db database\n');

    // Create Users table
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_founder BOOLEAN DEFAULT false,
        profile JSONB DEFAULT '{}',
        verification JSONB DEFAULT '{"isVerified": false, "badgeLevel": "bronze"}'::jsonb,
        mfa JSONB DEFAULT '{"enabled": false, "methods": []}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    console.log('✅ Users table created\n');

    // Create Posts table
    console.log('📋 Creating posts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        author_id UUID REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID,
        location JSONB,
        images TEXT[],
        likes INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
      CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
      CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
    `);
    console.log('✅ Posts table created\n');

    // Create Organizations table
    console.log('📋 Creating organizations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        logo_url TEXT,
        cover_image TEXT,
        location JSONB,
        contact_info JSONB,
        member_count INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_org_slug ON organizations(slug);
    `);
    console.log('✅ Organizations table created\n');

    // Create Events table
    console.log('📋 Creating events table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        location VARCHAR(500),
        image_url TEXT,
        organizer_id UUID REFERENCES users(id),
        attendees UUID[] DEFAULT ARRAY[]::uuid[],
        max_attendees INTEGER,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
    `);
    console.log('✅ Events table created\n');

    // Create Alerts table
    console.log('📋 Creating alerts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        title VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        location VARCHAR(500),
        created_by UUID REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
      CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
    `);
    console.log('✅ Alerts table created\n');

    // Create Reactions table
    console.log('📋 Creating reactions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reaction_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
      CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);
    `);
    console.log('✅ Reactions table created\n');

    // Create Polls table
    console.log('📋 Creating polls table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        question VARCHAR(500) NOT NULL,
        options JSONB NOT NULL,
        total_votes INTEGER DEFAULT 0,
        ends_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_polls_post ON polls(post_id);
    `);
    console.log('✅ Polls table created\n');

    // Create Poll Votes table
    console.log('📋 Creating poll_votes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        option_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(poll_id, user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);
    `);
    console.log('✅ Poll votes table created\n');

    // Create Comments table
    console.log('📋 Creating comments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
    `);
    console.log('✅ Comments table created\n');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE SETUP COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📊 Tables Created:');
    console.log('   ✓ users');
    console.log('   ✓ posts');
    console.log('   ✓ organizations');
    console.log('   ✓ events');
    console.log('   ✓ alerts');
    console.log('   ✓ reactions');
    console.log('   ✓ polls');
    console.log('   ✓ poll_votes');
    console.log('   ✓ comments\n');

    console.log('🚀 NEXT STEPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. Run founder seed script:');
    console.log('      node src/seeds/founder-postgres.js\n');
    console.log('   2. Start backend server:');
    console.log('      npm run dev\n');
    console.log('   3. Start frontend:');
    console.log('      cd ../iyf-s10-week-09-Kimiti4 && npm run dev\n');
    console.log('   4. Login with founder credentials\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error setting up database:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL is not running!');
      console.error('   Windows: Start PostgreSQL service from Services app');
      console.error('   Mac: brew services start postgresql');
      console.error('   Linux: sudo systemctl start postgresql\n');
    }
  } finally {
    if (client) {
      client.release();
    }
    await adminPool.end();
    console.log('🔌 Database connections closed.\n');
  }
}

// Run setup
setupDatabase();
