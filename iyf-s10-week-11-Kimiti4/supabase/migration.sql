-- JamiiLink Schema Migration for Supabase
-- Run this in Supabase SQL Editor
-- Generated from iyf-s10-week-11-Kimiti4/src/database/schema.js

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'founder')),
  is_founder BOOLEAN DEFAULT FALSE,
  bio TEXT,
  location_county VARCHAR(100),
  location_settlement VARCHAR(100),
  location_ward VARCHAR(100),
  skills TEXT[],
  avatar_url TEXT,
  avatar_icon VARCHAR(10) DEFAULT '🦁',
  verification_is_verified BOOLEAN DEFAULT FALSE,
  verification_verified_at TIMESTAMP,
  verification_verified_by UUID REFERENCES users(id),
  verification_type VARCHAR(50) DEFAULT 'manual' CHECK (verification_type IN ('manual', 'document', 'email', 'phone', 'social', 'organization_admin')),
  verification_badge_level VARCHAR(20) DEFAULT 'bronze' CHECK (verification_badge_level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  verification_badge_color VARCHAR(20) DEFAULT '#CD7F32',
  verification_notes TEXT,
  verification_expires_at TIMESTAMP,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_require_all_methods BOOLEAN DEFAULT FALSE,
  mfa_last_verified TIMESTAMP,
  mfa_failed_attempts INTEGER DEFAULT 0,
  mfa_locked_until TIMESTAMP,
  current_organization_id UUID,
  reputation_score INTEGER DEFAULT 0,
  reputation_level VARCHAR(20) DEFAULT 'bronze',
  login_streak INTEGER DEFAULT 0,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Impact Metrics
CREATE TABLE IF NOT EXISTS impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  impact_value INTEGER DEFAULT 1,
  reference_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. User Skills
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  proficiency INTEGER DEFAULT 3,
  is_offering BOOLEAN DEFAULT true,
  is_seeking BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Skill Matches
CREATE TABLE IF NOT EXISTS skill_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill1 VARCHAR(100) NOT NULL,
  skill2 VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  quality_rating INTEGER,
  testimonial TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 5. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('school', 'university', 'estate', 'church', 'ngo', 'sme', 'coworking', 'community', 'youth_group', 'professional')),
  description TEXT,
  branding_logo TEXT,
  branding_primary_color VARCHAR(20) DEFAULT '#3b82f6',
  branding_secondary_color VARCHAR(20) DEFAULT '#8b5cf6',
  branding_banner_image TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_website TEXT,
  contact_street TEXT,
  contact_city VARCHAR(100),
  contact_county VARCHAR(100),
  contact_country VARCHAR(100) DEFAULT 'Kenya',
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired')),
  subscription_current_period_start TIMESTAMP,
  subscription_current_period_end TIMESTAMP,
  subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE,
  subscription_stripe_customer_id TEXT,
  subscription_stripe_subscription_id TEXT,
  settings_allow_public_join BOOLEAN DEFAULT FALSE,
  settings_require_approval BOOLEAN DEFAULT TRUE,
  settings_enable_marketplace BOOLEAN DEFAULT TRUE,
  settings_enable_events BOOLEAN DEFAULT TRUE,
  settings_enable_messaging BOOLEAN DEFAULT TRUE,
  settings_enable_reels BOOLEAN DEFAULT TRUE,
  settings_max_members INTEGER DEFAULT 100,
  settings_storage_limit_mb INTEGER DEFAULT 500,
  moderation_auto_approve_posts BOOLEAN DEFAULT FALSE,
  moderation_blocked_words TEXT[],
  moderation_report_threshold INTEGER DEFAULT 3,
  stats_member_count INTEGER DEFAULT 0,
  stats_post_count INTEGER DEFAULT 0,
  stats_active_members_7d INTEGER DEFAULT 0,
  stats_active_members_30d INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 7. Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('mtaani', 'skill', 'farm', 'gig', 'alert')),
  location_county VARCHAR(100),
  location_settlement VARCHAR(100),
  location_ward VARCHAR(100),
  location_zone VARCHAR(100),
  location_longitude DOUBLE PRECISION,
  location_latitude DOUBLE PRECISION,
  metadata JSONB,
  likes INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  tags TEXT[],
  published BOOLEAN DEFAULT TRUE,
  flagged BOOLEAN DEFAULT FALSE,
  moderation_checked BOOLEAN DEFAULT FALSE,
  moderation_timestamp TIMESTAMP,
  moderation_toxicity_score FLOAT DEFAULT 0,
  moderation_spam_score FLOAT DEFAULT 0,
  moderation_scam_score FLOAT DEFAULT 0,
  moderation_flagged BOOLEAN DEFAULT FALSE,
  moderation_categories TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Comments
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
);

-- 9. Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  location VARCHAR(300),
  county VARCHAR(100),
  settlement VARCHAR(100),
  ward VARCHAR(100),
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  images JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  verification_level VARCHAR(30) NOT NULL DEFAULT 'unverified' CHECK (verification_level IN ('unverified', 'community_verified', 'mod_verified', 'official')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP,
  radius_km NUMERIC(6,2),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(county, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(settlement, '')), 'C')
  ) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. Alert Confirmations
CREATE TABLE IF NOT EXISTS alert_confirmations (
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (alert_id, user_id)
);

-- 11. Jams
CREATE TABLE IF NOT EXISTS jams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  prompt VARCHAR(500),
  category VARCHAR(50) NOT NULL DEFAULT 'creator',
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'active', 'ended', 'archived')),
  participation_types TEXT[] NOT NULL DEFAULT '{post}',
  deadline TIMESTAMP,
  cover_media_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. Jam Participants
CREATE TABLE IF NOT EXISTS jam_participants (
  jam_id UUID NOT NULL REFERENCES jams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (jam_id, user_id)
);

-- 13. Jam Contributions
CREATE TABLE IF NOT EXISTS jam_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jam_id UUID NOT NULL REFERENCES jams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'post'
    CHECK (type IN ('video', 'image', 'post', 'poll', 'location', 'skill', 'gig')),
  text_content TEXT,
  content_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (text_content IS NOT NULL OR content_url IS NOT NULL)
);

-- 14. MFA Methods
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
);

-- 15. Verification Documents
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
);

-- 16. Verification Codes (R2 P0-6)
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  purpose VARCHAR(40) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 17. Refresh Sessions (R5 P0-7)
CREATE TABLE IF NOT EXISTS refresh_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  rotated_at TIMESTAMP,
  revoked_at TIMESTAMP,
  user_agent TEXT,
  ip VARCHAR(64)
);

-- 18. Conversations (DMs)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (participant_one < participant_two),
  UNIQUE (participant_one, participant_two)
);

-- 19. Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP
);

-- 20. Follows
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (follower_id <> following_id),
  PRIMARY KEY (follower_id, following_id)
);

-- 21. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  reference_id UUID,
  target_type VARCHAR(30) NOT NULL DEFAULT 'post',
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 22. Post Likes
CREATE TABLE IF NOT EXISTS post_likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 23. Profile Views
CREATE TABLE IF NOT EXISTS profile_views (
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (viewer_id <> viewed_id),
  PRIMARY KEY (viewer_id, viewed_id)
);

-- 24. Stories (24h ephemeral)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text_content TEXT,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  CHECK (text_content IS NOT NULL OR image_url IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_current_org ON users(current_organization_id);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);

CREATE INDEX IF NOT EXISTS idx_verification_codes_active
  ON verification_codes (contact, purpose) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires
  ON verification_codes (expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user
  ON refresh_sessions (user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_hash
  ON refresh_sessions (token_hash);

CREATE INDEX IF NOT EXISTS idx_conversations_participants
  ON conversations (participant_one, participant_two);
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_follows_following
  ON follows (following_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (user_id) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_post_likes_post
  ON post_likes (post_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed
  ON profile_views (viewed_id);

CREATE INDEX IF NOT EXISTS idx_stories_user
  ON stories (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_org_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_org_owner ON organizations(owner_id);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_org ON posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(location_county, location_settlement);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

CREATE INDEX IF NOT EXISTS idx_mfa_user ON mfa_methods(user_id);

CREATE INDEX IF NOT EXISTS idx_jams_creator ON jams(creator_id);
CREATE INDEX IF NOT EXISTS idx_jams_status ON jams(status);
CREATE INDEX IF NOT EXISTS idx_jams_category ON jams(category);
CREATE INDEX IF NOT EXISTS idx_jams_created ON jams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jam_participants_user ON jam_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_jam_contributions_jam ON jam_contributions(jam_id, created_at);

CREATE INDEX IF NOT EXISTS idx_alerts_radius ON alerts(radius_km);
CREATE INDEX IF NOT EXISTS idx_alerts_county ON alerts(county) WHERE county IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_verification ON alerts(verification_level);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_search_vector ON alerts USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_alerts_title_trgm ON alerts USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_alerts_description_trgm ON alerts USING GIN (description gin_trgm_ops);
