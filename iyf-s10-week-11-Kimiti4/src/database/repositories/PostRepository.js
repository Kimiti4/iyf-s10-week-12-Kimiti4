/**
 * 🔹 Post Queries - PostgreSQL
 * Replaces Mongoose Post model with SQL queries
 */
const { query } = require('../../config/postgres');

class PostRepository {
  /**
   * Create a new post
   */
  async create(postData) {
    const {
      title,
      content,
      authorId,
      organizationId,
      category,
      location = {},
      metadata = {},
      tags = []
    } = postData;

    const result = await query(`
      INSERT INTO posts (
        title, content, author_id, organization_id, category,
        location_county, location_settlement, location_ward, location_zone,
        location_longitude, location_latitude,
        metadata, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      title,
      content,
      authorId,
      organizationId || null,
      category,
      location.county || null,
      location.settlement || null,
      location.ward || null,
      location.zone || null,
      location.coordinates?.[0] || null, // longitude
      location.coordinates?.[1] || null, // latitude
      JSON.stringify(metadata),
      `{${tags.join(',')}}`
    ]);

    return this.formatPost(result.rows[0]);
  }

  /**
   * Find post by ID
   */
  async findById(id) {
    const result = await query(`
      SELECT p.*, u.username as author_username, u.avatar_icon as author_avatar_icon,
             o.name as organization_name, o.slug as organization_slug
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN organizations o ON p.organization_id = o.id
      WHERE p.id = $1
    `, [id]);

    if (!result.rows[0]) return null;
    return this.formatPost(result.rows[0]);
  }

  /**
   * Get posts with filters
   */
  async find(filters = {}) {
    const {
      category,
      organizationId,
      authorId,
      county,
      settlement,
      search,
      sort = 'newest',
      page = 1,
      limit = 10
    } = filters;

    let whereConditions = ['p.published = true'];
    const values = [];
    let valueIndex = 1;

    if (category) {
      whereConditions.push(`p.category = $${valueIndex}`);
      values.push(category);
      valueIndex++;
    }

    if (organizationId) {
      whereConditions.push(`p.organization_id = $${valueIndex}`);
      values.push(organizationId);
      valueIndex++;
    }

    if (authorId) {
      whereConditions.push(`p.author_id = $${valueIndex}`);
      values.push(authorId);
      valueIndex++;
    }

    if (county) {
      whereConditions.push(`p.location_county = $${valueIndex}`);
      values.push(county);
      valueIndex++;
    }

    if (settlement) {
      whereConditions.push(`p.location_settlement = $${valueIndex}`);
      values.push(settlement);
      valueIndex++;
    }

    if (search) {
      whereConditions.push(`(p.title ILIKE $${valueIndex} OR p.content ILIKE $${valueIndex})`);
      values.push(`%${search}%`);
      valueIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Sorting
    const sortOptions = {
      newest: 'p.created_at DESC',
      oldest: 'p.created_at ASC',
      popular: 'p.likes DESC',
      urgent: "CASE p.metadata->>'urgency' WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END ASC, p.upvotes DESC"
    };

    const orderBy = sortOptions[sort] || sortOptions.newest;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT p.*, u.username as author_username, u.avatar_icon as author_avatar_icon,
             o.name as organization_name, o.slug as organization_slug
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN organizations o ON p.organization_id = o.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM posts p WHERE ${whereClause}
    `, values);

    return {
      posts: result.rows.map(row => this.formatPost(row)),
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    };
  }

  /**
   * Update post
   */
  async update(id, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const snakeKey = this.camelToSnake(key);
        
        // Handle JSONB metadata specially
        if (key === 'metadata') {
          fields.push(`${snakeKey} = $${index}::jsonb`);
        } else if (Array.isArray(updates[key])) {
          fields.push(`${snakeKey} = $${index}::text[]`);
        } else {
          fields.push(`${snakeKey} = $${index}`);
        }
        
        values.push(updates[key]);
        index++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(`
      UPDATE posts SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `, values);

    return this.formatPost(result.rows[0]);
  }

  /**
   * Delete post
   */
  async delete(id) {
    await query(`DELETE FROM posts WHERE id = $1`, [id]);
    return true;
  }

  /**
   * Like a post
   */
  async like(id) {
    const result = await query(`
      UPDATE posts SET likes = likes + 1, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    return this.formatPost(result.rows[0]);
  }

  /**
   * Upvote a post (for alerts)
   */
  async upvote(id) {
    const result = await query(`
      UPDATE posts SET upvotes = upvotes + 1, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    return this.formatPost(result.rows[0]);
  }

  /**
   * Increment views
   */
  async incrementViews(id) {
    await query(`
      UPDATE posts SET views = views + 1
      WHERE id = $1
    `, [id]);
  }

  /**
   * Format post object
   */
  formatPost(row) {
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      author: {
        id: row.author_id,
        username: row.author_username,
        avatarIcon: row.author_avatar_icon
      },
      organization: row.organization_id ? {
        id: row.organization_id,
        name: row.organization_name,
        slug: row.organization_slug
      } : null,
      category: row.category,
      location: {
        county: row.location_county,
        settlement: row.location_settlement,
        ward: row.location_ward,
        zone: row.location_zone,
        coordinates: row.location_longitude && row.location_latitude
          ? [row.location_longitude, row.location_latitude]
          : null
      },
      metadata: row.metadata || {},
      likes: row.likes,
      upvotes: row.upvotes,
      views: row.views,
      tags: row.tags || [],
      published: row.published,
      flagged: row.flagged,
      moderation: {
        checked: row.moderation_checked,
        timestamp: row.moderation_timestamp,
        scores: {
          toxicity: row.moderation_toxicity_score,
          spam: row.moderation_spam_score,
          scam: row.moderation_scam_score
        },
        flagged: row.moderation_flagged,
        categories: row.moderation_categories || []
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Convert camelCase to snake_case
   */
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = new PostRepository();
