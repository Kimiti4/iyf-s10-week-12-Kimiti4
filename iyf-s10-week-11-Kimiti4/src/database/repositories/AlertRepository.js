const { query } = require('../../config/postgres');

class AlertRepository {
  async find(filters = {}) {
    const values = [];
    const conditions = [];
    let index = 1;
    if (filters.status) { conditions.push(`a.status = $${index++}`); values.push(filters.status); }
    if (filters.category) { conditions.push(`a.category = $${index++}`); values.push(filters.category); }
    if (filters.severity) { conditions.push(`a.severity = $${index++}`); values.push(filters.severity); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Number(filters.limit) || 50, 100);
    const page = Math.max(Number(filters.page) || 1, 1);
    const offset = (page - 1) * limit;
    values.push(limit, offset);
    const result = await query(`
      SELECT a.*, u.username AS author_username, u.avatar_icon AS author_avatar_icon,
             o.name AS organization_name, o.slug AS organization_slug,
             (SELECT COUNT(*) FROM alert_confirmations c WHERE c.alert_id = a.id) AS confirmation_count
      FROM alerts a LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN organizations o ON o.id = a.organization_id
      ${where} ORDER BY a.created_at DESC LIMIT $${index++} OFFSET $${index}
    `, values);
    const total = await query(`SELECT COUNT(*) FROM alerts a ${where}`, values.slice(0, -2));
    return { alerts: result.rows.map((row) => this.format(row)), total: Number(total.rows[0].count), page, limit };
  }

  async findById(id) {
    const result = await query(`
      SELECT a.*, u.username AS author_username, u.avatar_icon AS author_avatar_icon,
             o.name AS organization_name, o.slug AS organization_slug,
             (SELECT COUNT(*) FROM alert_confirmations c WHERE c.alert_id = a.id) AS confirmation_count
      FROM alerts a LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN organizations o ON o.id = a.organization_id WHERE a.id = $1
    `, [id]);
    return this.format(result.rows[0]);
  }

  async create(data) {
    const result = await query(`INSERT INTO alerts
      (title, description, category, severity, location, longitude, latitude, images, tags, author_id, organization_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`, [
      data.title, data.description, data.category, data.severity, data.location || null,
      data.coordinates?.[0] || null, data.coordinates?.[1] || null,
      JSON.stringify(data.images || []), data.tags || [], data.authorId, data.organizationId || null
    ]);
    return this.findById(result.rows[0].id);
  }

  async update(id, updates) {
    const allowed = { title: 'title', description: 'description', location: 'location', tags: 'tags', status: 'status' };
    const fields = []; const values = []; let index = 1;
    for (const [key, column] of Object.entries(allowed)) {
      if (updates[key] !== undefined) { fields.push(`${column} = $${index++}`); values.push(updates[key]); }
    }
    if (!fields.length) return this.findById(id);
    values.push(id);
    await query(`UPDATE alerts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index}`, values);
    return this.findById(id);
  }

  async remove(id) { await query('DELETE FROM alerts WHERE id = $1', [id]); }

  async incrementViews(id) { await query('UPDATE alerts SET views = views + 1 WHERE id = $1', [id]); }

  async confirm(id, userId) {
    await query('INSERT INTO alert_confirmations (alert_id, user_id) VALUES ($1, $2)', [id, userId]);
    await query(`UPDATE alerts SET verification_level = 'community_verified', updated_at = NOW()
      WHERE id = $1 AND verification_level = 'unverified' AND
      (SELECT COUNT(*) FROM alert_confirmations WHERE alert_id = $1) >= 5`, [id]);
    return this.findById(id);
  }

  async unconfirm(id, userId) {
    await query('DELETE FROM alert_confirmations WHERE alert_id = $1 AND user_id = $2', [id, userId]);
    return this.findById(id);
  }

  async verify(id, userId, verificationLevel, reviewNotes) {
    await query(`UPDATE alerts SET verification_level = $1, reviewed_by = $2, reviewed_at = NOW(), review_notes = $3, updated_at = NOW() WHERE id = $4`, [verificationLevel, userId, reviewNotes || null, id]);
    return this.findById(id);
  }

  format(row) {
    if (!row) return null;
    return { ...row, author: { id: row.author_id, username: row.author_username, avatarIcon: row.author_avatar_icon }, organization: row.organization_id ? { id: row.organization_id, name: row.organization_name, slug: row.organization_slug } : null, coordinates: row.longitude == null ? null : [row.longitude, row.latitude], confirmationCount: Number(row.confirmation_count || 0), tags: row.tags || [], images: row.images || [] };
  }
}

module.exports = new AlertRepository();