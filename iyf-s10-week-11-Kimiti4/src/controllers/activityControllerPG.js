/**
 * 🔹 Activity Controller - PostgreSQL Version
 * Aggregates the authenticated user's own actions across the platform.
 * No synthetic events: every row comes from a persisted user action.
 */
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/activity/me - own activity feed (paginated)
const getMyActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const result = await query(
    `SELECT * FROM (
       SELECT p.id::text AS id, 'post' AS type, 'Created post' AS action,
              p.title AS target, NULL AS author, p.created_at AS timestamp
       FROM posts p WHERE p.author_id = $1
       UNION ALL
       SELECT c.id::text, 'comment', 'Commented on',
              COALESCE((SELECT title FROM posts WHERE id = c.post_id), 'a post'),
              NULL, c.created_at
       FROM comments c WHERE c.author_id = $1
       UNION ALL
       SELECT ('follow:' || f.following_id)::text, 'follow', 'Followed',
              u.username, NULL, f.created_at
       FROM follows f JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       UNION ALL
       SELECT j.id::text, 'jam', 'Created jam', j.title, NULL, j.created_at
       FROM jams j WHERE j.creator_id = $1
       UNION ALL
       SELECT ('join:' || p.jam_id)::text, 'jam', 'Joined jam', j.title, NULL, p.joined_at
       FROM jam_participants p JOIN jams j ON j.id = p.jam_id
       WHERE p.user_id = $1 AND j.creator_id <> $1
       UNION ALL
       SELECT c.id::text, 'contribution', 'Contributed to jam', j.title, NULL, c.created_at
       FROM jam_contributions c JOIN jams j ON j.id = c.jam_id
       WHERE c.user_id = $1
     ) AS activity
     ORDER BY timestamp DESC
     LIMIT $2`,
    [req.user.id, limit]
  );
  const rows = result.rows.map((r) => ({
    id: r.id,
    type: r.type,
    action: r.action,
    target: r.target,
    author: r.author,
    timestamp: new Date(r.timestamp).getTime()
  }));
  const counts = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM posts WHERE author_id = $1) AS posts,
       (SELECT COUNT(*)::int FROM comments WHERE author_id = $1) AS comments,
       (SELECT COUNT(*)::int FROM follows WHERE follower_id = $1) AS follows,
       (SELECT COUNT(*)::int FROM jam_contributions WHERE user_id = $1) AS contributions`,
    [req.user.id]
  );
  res.json({ success: true, count: rows.length, stats: counts.rows[0], data: rows });
});

module.exports = { getMyActivity };
