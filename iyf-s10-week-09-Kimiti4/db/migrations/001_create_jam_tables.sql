-- JamiiLink Jam Domain Schema
-- Migration: 001_create_jam_tables.sql
-- Creates the core tables for the Jam feature.

-- ===== JAMS TABLE =====

CREATE TABLE IF NOT EXISTS jams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  cover_media_url TEXT,
  prompt VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'active', 'ended', 'archived')),
  participation_types JSONB NOT NULL DEFAULT '["post"]',
  category VARCHAR(50) DEFAULT 'other',
  location JSONB,
  deadline TIMESTAMPTZ,
  participant_count INTEGER NOT NULL DEFAULT 0,
  contribution_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for jams
CREATE INDEX idx_jams_creator_id ON jams(creator_id);
CREATE INDEX idx_jams_status ON jams(status);
CREATE INDEX idx_jams_category ON jams(category);
CREATE INDEX idx_jams_created_at ON jams(created_at DESC);
CREATE INDEX idx_jams_deadline ON jams(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_jams_tags ON jams USING GIN(tags);
CREATE INDEX idx_jams_location ON jams USING GIN(location);
CREATE INDEX idx_jams_participation_types ON jams USING GIN(participation_types);

-- ===== PARTICIPATIONS TABLE =====

CREATE TABLE IF NOT EXISTS jam_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jam_id UUID NOT NULL REFERENCES jams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(jam_id, user_id)
);

-- Indexes for participations
CREATE INDEX idx_participations_jam_id ON jam_participations(jam_id);
CREATE INDEX idx_participations_user_id ON jam_participations(user_id);
CREATE INDEX idx_participations_jam_user ON jam_participations(jam_id, user_id);

-- ===== CONTRIBUTIONS TABLE =====

CREATE TABLE IF NOT EXISTS jam_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jam_id UUID NOT NULL REFERENCES jams(id) ON DELETE CASCADE,
  participation_id UUID NOT NULL REFERENCES jam_participations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('video', 'image', 'post', 'poll', 'location', 'skill', 'gig')),
  content_url TEXT NOT NULL,
  text_content TEXT,
  location JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for contributions
CREATE INDEX idx_contributions_jam_id ON jam_contributions(jam_id);
CREATE INDEX idx_contributions_participation_id ON jam_contributions(participation_id);
CREATE INDEX idx_contributions_user_id ON jam_contributions(user_id);
CREATE INDEX idx_contributions_type ON jam_contributions(type);
CREATE INDEX idx_contributions_status ON jam_contributions(status);
CREATE INDEX idx_contributions_jam_status ON jam_contributions(jam_id, status);
CREATE INDEX idx_contributions_vote_count ON jam_contributions(vote_count DESC);

-- ===== REACTIONS TABLE =====

CREATE TABLE IF NOT EXISTS jam_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES jam_contributions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('upvote', 'downvote', 'fire', 'clap', 'love')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(contribution_id, user_id, type)
);

-- Indexes for reactions
CREATE INDEX idx_reactions_contribution_id ON jam_reactions(contribution_id);
CREATE INDEX idx_reactions_user_id ON jam_reactions(user_id);
CREATE INDEX idx_reactions_contribution_type ON jam_reactions(contribution_id, type);

-- ===== DENORMALIZED COUNTERS =====
-- These are updated via application logic or database triggers.

-- Trigger to update jam participant_count on INSERT/DELETE
CREATE OR REPLACE FUNCTION update_jam_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jams SET participant_count = participant_count + 1 WHERE id = NEW.jam_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jams SET participant_count = GREATEST(participant_count - 1, 0) WHERE id = OLD.jam_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jam_participant_count
  AFTER INSERT OR DELETE ON jam_participations
  FOR EACH ROW EXECUTE FUNCTION update_jam_participant_count();

-- Trigger to update jam contribution_count on INSERT/DELETE
CREATE OR REPLACE FUNCTION update_jam_contribution_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jams SET contribution_count = contribution_count + 1 WHERE id = NEW.jam_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jams SET contribution_count = GREATEST(contribution_count - 1, 0) WHERE id = OLD.jam_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jam_contribution_count
  AFTER INSERT OR DELETE ON jam_contributions
  FOR EACH ROW EXECUTE FUNCTION update_jam_contribution_count();

-- Trigger to update contribution vote_count on INSERT/DELETE
CREATE OR REPLACE FUNCTION update_contribution_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jam_contributions SET vote_count = vote_count + 1 WHERE id = NEW.contribution_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jam_contributions SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.contribution_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contribution_vote_count
  AFTER INSERT OR DELETE ON jam_reactions
  FOR EACH ROW EXECUTE FUNCTION update_contribution_vote_count();

-- ===== UPDATED_AT TRIGGER =====

CREATE OR REPLACE FUNCTION update_jam_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jams_updated_at
  BEFORE UPDATE ON jams
  FOR EACH ROW EXECUTE FUNCTION update_jam_updated_at();
