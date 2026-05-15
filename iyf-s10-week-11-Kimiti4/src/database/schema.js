/**
 * 🔹 Database Schema Migration - PostgreSQL
 * Creates all tables for JamiiLink multi-tenant platform
 */
const { query } = require('../config/postgres');

const createTables = async () => {
  console.log('🔧 Creating database tables...');

  try {
    // 1. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(30) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'founder')),
        is_founder BOOLEAN DEFAULT FALSE,
        
        -- Profile
        bio TEXT,
        location_county VARCHAR(100),
        location_settlement VARCHAR(100),
        location_ward VARCHAR(100),
        skills TEXT[],
        avatar_url TEXT,
        avatar_icon VARCHAR(10) DEFAULT '🦁',
        
        -- Verification
        verification_is_verified BOOLEAN DEFAULT FALSE,
        verification_verified_at TIMESTAMP,
        verification_verified_by UUID REFERENCES users(id),
        verification_type VARCHAR(50) DEFAULT 'manual' CHECK (verification_type IN ('manual', 'document', 'email', 'phone', 'social', 'organization_admin')),
        verification_badge_level VARCHAR(20) DEFAULT 'bronze' CHECK (verification_badge_level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
        verification_badge_color VARCHAR(20) DEFAULT '#CD7F32',
        verification_notes TEXT,
        verification_expires_at TIMESTAMP,
        
        -- MFA
        mfa_enabled BOOLEAN DEFAULT FALSE,
        mfa_require_all_methods BOOLEAN DEFAULT FALSE,
        mfa_last_verified TIMESTAMP,
        mfa_failed_attempts INTEGER DEFAULT 0,
        mfa_locked_until TIMESTAMP,
        
        -- Current organization context
        current_organization_id UUID,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Organizations Table
    await query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('school', 'university', 'estate', 'church', 'ngo', 'sme', 'coworking', 'community', 'youth_group', 'professional')),
        description TEXT,
        
        -- Branding
        branding_logo TEXT,
        branding_primary_color VARCHAR(20) DEFAULT '#3b82f6',
        branding_secondary_color VARCHAR(20) DEFAULT '#8b5cf6',
        branding_banner_image TEXT,
        
        -- Contact
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_website TEXT,
        contact_street TEXT,
        contact_city VARCHAR(100),
        contact_county VARCHAR(100),
        contact_country VARCHAR(100) DEFAULT 'Kenya',
        
        -- Subscription
        plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
        subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired')),
        subscription_current_period_start TIMESTAMP,
        subscription_current_period_end TIMESTAMP,
        subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE,
        subscription_stripe_customer_id TEXT,
        subscription_stripe_subscription_id TEXT,
        
        -- Settings
        settings_allow_public_join BOOLEAN DEFAULT FALSE,
        settings_require_approval BOOLEAN DEFAULT TRUE,
        settings_enable_marketplace BOOLEAN DEFAULT TRUE,
        settings_enable_events BOOLEAN DEFAULT TRUE,
        settings_enable_messaging BOOLEAN DEFAULT TRUE,
        settings_enable_reels BOOLEAN DEFAULT TRUE,
        settings_max_members INTEGER DEFAULT 100,
        settings_storage_limit_mb INTEGER DEFAULT 500,
        
        -- Moderation
        moderation_auto_approve_posts BOOLEAN DEFAULT FALSE,
        moderation_blocked_words TEXT[],
        moderation_report_threshold INTEGER DEFAULT 3,
        
        -- Statistics
        stats_member_count INTEGER DEFAULT 0,
        stats_post_count INTEGER DEFAULT 0,
        stats_active_members_7d INTEGER DEFAULT 0,
        stats_active_members_30d INTEGER DEFAULT 0,
        
        -- Status
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
        
        -- Owner and admins
        owner_id UUID NOT NULL REFERENCES users(id),
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Organization Memberships Table (many-to-many)
    await query(`
      CREATE TABLE IF NOT EXISTS memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
        joined_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, organization_id)
      )
    `);

    // 4. Posts Table
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('mtaani', 'skill', 'farm', 'gig', 'alert')),
        
        -- Location
        location_county VARCHAR(100),
        location_settlement VARCHAR(100),
        location_ward VARCHAR(100),
        location_zone VARCHAR(100),
        location_longitude DOUBLE PRECISION,
        location_latitude DOUBLE PRECISION,
        
        -- Category-specific metadata (JSONB for flexibility)
        metadata JSONB,
        
        -- Engagement
        likes INTEGER DEFAULT 0,
        upvotes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        
        -- Tags
        tags TEXT[],
        
        -- Status
        published BOOLEAN DEFAULT TRUE,
        flagged BOOLEAN DEFAULT FALSE,
        
        -- AI Moderation
        moderation_checked BOOLEAN DEFAULT FALSE,
        moderation_timestamp TIMESTAMP,
        moderation_toxicity_score FLOAT DEFAULT 0,
        moderation_spam_score FLOAT DEFAULT 0,
        moderation_scam_score FLOAT DEFAULT 0,
        moderation_flagged BOOLEAN DEFAULT FALSE,
        moderation_categories TEXT[],
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 5. Comments Table
    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        likes INTEGER DEFAULT 0,
        flagged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 6. MFA Methods Table
    await query(`
      CREATE TABLE IF NOT EXISTS mfa_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('totp', 'sms', 'email', 'hardware_key', 'biometric')),
        verified BOOLEAN DEFAULT FALSE,
        primary_method BOOLEAN DEFAULT FALSE,
        secret TEXT,
        backup_codes TEXT[],
        phone_number VARCHAR(50),
        email VARCHAR(255),
        added_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 7. Verification Documents Table
    await query(`
      CREATE TABLE IF NOT EXISTS verification_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW(),
        verified BOOLEAN DEFAULT FALSE,
        verified_by UUID REFERENCES users(id),
        verified_at TIMESTAMP,
        notes TEXT
      )
    `);

    // Create indexes for performance
    console.log('📊 Creating indexes...');
    
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    
    // Add current_organization_id column if it doesn't exist
    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS current_organization_id UUID`);
    } catch (err) {
      console.log('ℹ️  Column current_organization_id may already exist or cannot be added');
    }
    await query(`CREATE INDEX IF NOT EXISTS idx_users_current_org ON users(current_organization_id)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_org_slug ON organizations(slug)`);
    
    // Add type column if it doesn't exist
    try {
      await query(`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS type VARCHAR(50)`);
    } catch (err) {
      console.log('ℹ️  Column type may already exist or cannot be added');
    }
    await query(`CREATE INDEX IF NOT EXISTS idx_org_type ON organizations(type)`);
    
    // Add owner_id column if it doesn't exist
    try {
      await query(`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id)`);
    } catch (err) {
      console.log('ℹ️  Column owner_id may already exist or cannot be added');
    }
    await query(`CREATE INDEX IF NOT EXISTS idx_org_owner ON organizations(owner_id)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_org ON posts(organization_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`);
    
    // Add location columns if they don't exist
    try {
      await query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_county VARCHAR(100)`);
      await query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_settlement VARCHAR(100)`);
    } catch (err) {
      console.log('ℹ️  Location columns may already exist or cannot be added');
    }
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(location_county, location_settlement)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id)`);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_mfa_user ON mfa_methods(user_id)`);

    console.log('✅ All tables and indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };
