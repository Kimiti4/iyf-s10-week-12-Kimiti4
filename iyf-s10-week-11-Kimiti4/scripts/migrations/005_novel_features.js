const { query } = require('../../src/config/postgres');

async function up() {
  console.log('Running migration 005_novel_features...');
  
  try {
    await query('BEGIN');

    // 1. Impact Metrics
    await query(`
      CREATE TABLE IF NOT EXISTS impact_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        impact_value INTEGER NOT NULL,
        reference_id VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_impact_reference UNIQUE (reference_id)
      );
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_impact_metrics_user_id ON impact_metrics(user_id);
      CREATE INDEX IF NOT EXISTS idx_impact_metrics_event_type ON impact_metrics(event_type);
    `);

    // 2. User Skills
    await query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        skill_name VARCHAR(100) NOT NULL,
        proficiency INTEGER DEFAULT 3 CHECK (proficiency >= 1 AND proficiency <= 5),
        is_offering BOOLEAN DEFAULT true,
        is_seeking BOOLEAN DEFAULT false,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_skill UNIQUE (user_id, skill_name, is_offering, is_seeking)
      );
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON user_skills(skill_name);
      CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
    `);

    // 3. Skill Matches
    await query(`
      CREATE TABLE IF NOT EXISTS skill_matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
        user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
        skill1 VARCHAR(100) NOT NULL,
        skill2 VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
        testimonial TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT prevent_self_match CHECK (user1_id != user2_id)
      );
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_skill_matches_users ON skill_matches(user1_id, user2_id);
    `);

    await query('COMMIT');
    console.log('Migration 005_novel_features completed successfully.');
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error running migration 005_novel_features:', error);
    throw error;
  }
}

async function down() {
  console.log('Reverting migration 005_novel_features...');
  try {
    await query('BEGIN');
    await query('DROP TABLE IF EXISTS skill_matches CASCADE;');
    await query('DROP TABLE IF EXISTS user_skills CASCADE;');
    await query('DROP TABLE IF EXISTS impact_metrics CASCADE;');
    await query('COMMIT');
    console.log('Reversion 005_novel_features completed.');
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error reverting migration 005_novel_features:', error);
    throw error;
  }
}

// Support running directly or being required
if (require.main === module) {
  up().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  module.exports = { up, down };
}
