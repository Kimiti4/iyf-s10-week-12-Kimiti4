/**
 * 🔹 Comment Queries - PostgreSQL
 * Replaces Mongoose Comment model with SQL queries
 */
const { query } = require('../../config/postgres');

class CommentRepository {
  /**
   * Create a new comment
   */
  async create(commentData) {
    const { content, authorId, postId, parentId } = commentData;

    const result = await query(`
      INSERT INTO comments (content, author_id, post_id, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [content, authorId, postId, parentId || null]);

    return result.rows[0];
  }

  /**
   * Get comments for a post with author info
   */
  async findByPost(postId, limit = 50) {
    const result = await query(`
      SELECT 
        c.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_icon', u.avatar_icon
        ) as author
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2
    `, [postId, limit]);

    return result.rows;
  }

  /**
   * Find comment by ID
   */
  async findById(commentId) {
    const result = await query(`
      SELECT * FROM comments WHERE id = $1
    `, [commentId]);

    return result.rows[0] || null;
  }

  /**
   * Delete a comment
   */
  async delete(commentId) {
    const result = await query(`
      DELETE FROM comments WHERE id = $1
      RETURNING *
    `, [commentId]);

    return result.rows[0] || null;
  }

  /**
   * Get comment count for a post
   */
  async countByPost(postId) {
    const result = await query(`
      SELECT COUNT(*) as count FROM comments WHERE post_id = $1
    `, [postId]);

    return parseInt(result.rows[0].count);
  }

  /**
   * Get replies to a comment (threaded comments)
   */
  async getReplies(parentId, limit = 20) {
    const result = await query(`
      SELECT 
        c.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'avatar_icon', u.avatar_icon
        ) as author
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.parent_id = $1
      ORDER BY c.created_at ASC
      LIMIT $2
    `, [parentId, limit]);

    return result.rows;
  }
}

module.exports = new CommentRepository();
