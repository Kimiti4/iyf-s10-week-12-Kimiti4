const express = require('express');
const { param, query } = require('express-validator');
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get(
  '/projects/:id/activity',
  validate([
    param('id').isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 50;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*, user:users(id, name, email, avatar_url)')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      res.json(activities);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
