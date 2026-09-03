const express = require('express');
const { query } = require('express-validator');
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get(
  '/',
  validate([
    query('q').trim().notEmpty().withMessage('Search query is required'),
    query('org_id').isUUID().withMessage('Valid org_id is required'),
  ]),
  async (req, res, next) => {
    try {
      const { q, org_id } = req.query;

      const { data: orgProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('org_id', org_id);

      const projectIds = (orgProjects || []).map((p) => p.id);
      if (projectIds.length === 0) return res.json([]);

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority, project_id, projects(name)')
        .in('project_id', projectIds)
        .ilike('title', `%${q}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const result = (tasks || []).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        project_name: t.projects?.name,
      }));

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
