const express = require('express');
const { query } = require('express-validator');
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get(
  '/',
  validate([query('org_id').isUUID().withMessage('Valid org_id is required')]),
  async (req, res, next) => {
    try {
      const { org_id } = req.query;

      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('org_id', org_id);

      const projectIds = (projects || []).map((p) => p.id);

      let totalTasks = 0;
      let tasksByStatus = { todo: 0, in_progress: 0, in_review: 0, done: 0 };

      if (projectIds.length > 0) {
        const { count } = await supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds);

        totalTasks = count || 0;

        for (const status of Object.keys(tasksByStatus)) {
          const { count: sc } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .in('project_id', projectIds)
            .eq('status', status);

          tasksByStatus[status] = sc || 0;
        }
      }

      const { data: recentActivity } = await supabase
        .from('activities')
        .select('*, user:users(id, name, avatar_url)')
        .in('project_id', projectIds.length > 0 ? projectIds : ['00000000-0000-0000-0000-000000000000'])
        .order('created_at', { ascending: false })
        .limit(10);

      res.json({
        total_projects: projects?.length || 0,
        total_tasks: totalTasks,
        tasks_by_status: tasksByStatus,
        recent_activity: recentActivity || [],
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
