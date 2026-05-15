/**
 * 🔹 Organization Queries - PostgreSQL
 * Handles multi-tenant organization management
 */
const { query } = require('../../config/postgres');

class OrganizationRepository {
  /**
   * Create a new organization
   */
  async create(orgData) {
    const {
      name,
      slug,
      type,
      description,
      branding = {},
      contact = {},
      plan = 'free',
      settings = {},
      moderation = {},
      ownerId
    } = orgData;

    const result = await query(`
      INSERT INTO organizations (
        name, slug, type, description,
        branding_logo, branding_primary_color, branding_secondary_color, branding_banner_image,
        contact_email, contact_phone, contact_website, contact_street, contact_city, contact_county,
        plan,
        settings_allow_public_join, settings_require_approval, settings_enable_marketplace,
        settings_enable_events, settings_enable_messaging, settings_enable_reels,
        settings_max_members, settings_storage_limit_mb,
        moderation_auto_approve_posts, moderation_blocked_words, moderation_report_threshold,
        owner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *
    `, [
      name,
      slug,
      type,
      description || null,
      branding.logo || null,
      branding.primaryColor || '#3b82f6',
      branding.secondaryColor || '#8b5cf6',
      branding.bannerImage || null,
      contact.email || null,
      contact.phone || null,
      contact.website || null,
      contact.address?.street || null,
      contact.address?.city || null,
      contact.address?.county || null,
      plan,
      settings.allowPublicJoin || false,
      settings.requireApproval !== undefined ? settings.requireApproval : true,
      settings.enableMarketplace !== undefined ? settings.enableMarketplace : true,
      settings.enableEvents !== undefined ? settings.enableEvents : true,
      settings.enableMessaging !== undefined ? settings.enableMessaging : true,
      settings.enableReels !== undefined ? settings.enableReels : true,
      settings.maxMembers || 100,
      settings.storageLimitMB || 500,
      moderation.autoApprovePosts || false,
      moderation.blockedWords ? `{${moderation.blockedWords.join(',')}}` : null,
      moderation.reportThreshold || 3,
      ownerId
    ]);

    return this.formatOrganization(result.rows[0]);
  }

  /**
   * Find organization by ID
   */
  async findById(id) {
    const result = await query(`
      SELECT o.*, u.username as owner_username
      FROM organizations o
      LEFT JOIN users u ON o.owner_id = u.id
      WHERE o.id = $1
    `, [id]);

    if (!result.rows[0]) return null;
    return this.formatOrganization(result.rows[0]);
  }

  /**
   * Find organization by slug
   */
  async findBySlug(slug) {
    const result = await query(`
      SELECT o.*, u.username as owner_username
      FROM organizations o
      LEFT JOIN users u ON o.owner_id = u.id
      WHERE o.slug = $1 AND o.status = 'active'
    `, [slug]);

    if (!result.rows[0]) return null;
    return this.formatOrganization(result.rows[0]);
  }

  /**
   * Get all organizations with filters
   */
  async find(filters = {}) {
    const { type, county, status = 'active', page = 1, limit = 10 } = filters;

    let whereConditions = [`o.status = $1`];
    const values = [status];
    let valueIndex = 2;

    if (type) {
      whereConditions.push(`o.type = $${valueIndex}`);
      values.push(type);
      valueIndex++;
    }

    if (county) {
      whereConditions.push(`o.contact_county = $${valueIndex}`);
      values.push(county);
      valueIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT o.*, u.username as owner_username
      FROM organizations o
      LEFT JOIN users u ON o.owner_id = u.id
      WHERE ${whereClause}
      ORDER BY o.stats_member_count DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM organizations o WHERE ${whereClause}
    `, values);

    return {
      organizations: result.rows.map(row => this.formatOrganization(row)),
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    };
  }

  /**
   * Update organization
   */
  async update(id, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const snakeKey = this.camelToSnake(key);
        
        if (Array.isArray(updates[key])) {
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
      UPDATE organizations SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `, values);

    return this.formatOrganization(result.rows[0]);
  }

  /**
   * Delete organization
   */
  async delete(id) {
    await query(`UPDATE organizations SET status = 'archived' WHERE id = $1`, [id]);
    return true;
  }

  /**
   * Add member to organization
   */
  async addMember(orgId, userId, role = 'member') {
    const result = await query(`
      INSERT INTO memberships (organization_id, user_id, role, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (user_id, organization_id) DO UPDATE
      SET status = 'active', role = $3
      RETURNING *
    `, [orgId, userId, role]);

    // Increment member count
    await query(`
      UPDATE organizations SET stats_member_count = stats_member_count + 1
      WHERE id = $1
    `, [orgId]);

    return result.rows[0];
  }

  /**
   * Remove member from organization
   */
  async removeMember(orgId, userId) {
    await query(`
      DELETE FROM memberships WHERE organization_id = $1 AND user_id = $2
    `, [orgId, userId]);

    // Decrement member count
    await query(`
      UPDATE organizations 
      SET stats_member_count = GREATEST(stats_member_count - 1, 0)
      WHERE id = $1
    `, [orgId]);
  }

  /**
   * Get organization members
   */
  async getMembers(orgId, filters = {}) {
    const { role, status = 'active', page = 1, limit = 20 } = filters;

    let whereConditions = ['m.organization_id = $1', 'm.status = $2'];
    const values = [orgId, status];
    let valueIndex = 3;

    if (role) {
      whereConditions.push(`m.role = $${valueIndex}`);
      values.push(role);
      valueIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT m.*, u.username, u.email, u.avatar_icon, u.profile.bio
      FROM memberships m
      JOIN users u ON m.user_id = u.id
      WHERE ${whereClause}
      ORDER BY m.joined_at DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `, [...values, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM memberships m WHERE ${whereClause}
    `, values);

    return {
      members: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    };
  }

  /**
   * Check if user is admin of organization
   */
  async isAdmin(orgId, userId) {
    const result = await query(`
      SELECT COUNT(*) as count FROM memberships
      WHERE organization_id = $1 AND user_id = $2 
      AND role IN ('owner', 'admin') AND status = 'active'
    `, [orgId, userId]);

    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Format organization object
   */
  formatOrganization(row) {
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.type,
      description: row.description,
      branding: {
        logo: row.branding_logo,
        primaryColor: row.branding_primary_color,
        secondaryColor: row.branding_secondary_color,
        bannerImage: row.branding_banner_image
      },
      contact: {
        email: row.contact_email,
        phone: row.contact_phone,
        website: row.contact_website,
        address: {
          street: row.contact_street,
          city: row.contact_city,
          county: row.contact_county,
          country: row.contact_country
        }
      },
      plan: row.plan,
      subscription: {
        status: row.subscription_status,
        currentPeriodStart: row.subscription_current_period_start,
        currentPeriodEnd: row.subscription_current_period_end,
        cancelAtPeriodEnd: row.subscription_cancel_at_period_end,
        stripeCustomerId: row.subscription_stripe_customer_id,
        stripeSubscriptionId: row.subscription_stripe_subscription_id
      },
      settings: {
        allowPublicJoin: row.settings_allow_public_join,
        requireApproval: row.settings_require_approval,
        enableMarketplace: row.settings_enable_marketplace,
        enableEvents: row.settings_enable_events,
        enableMessaging: row.settings_enable_messaging,
        enableReels: row.settings_enable_reels,
        maxMembers: row.settings_max_members,
        storageLimitMB: row.settings_storage_limit_mb
      },
      moderation: {
        autoApprovePosts: row.moderation_auto_approve_posts,
        blockedWords: row.moderation_blocked_words || [],
        reportThreshold: row.moderation_report_threshold
      },
      stats: {
        memberCount: row.stats_member_count,
        postCount: row.stats_post_count,
        activeMembersLast7Days: row.stats_active_members_7d,
        activeMembersLast30Days: row.stats_active_members_30d
      },
      status: row.status,
      owner: {
        id: row.owner_id,
        username: row.owner_username
      },
      url: `/${row.slug}`,
      domain: `${row.slug}.jamiilink.com`,
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

module.exports = new OrganizationRepository();
