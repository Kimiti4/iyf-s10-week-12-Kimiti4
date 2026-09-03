const express = require('express');
const { body, param } = require('express-validator');
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get(
  '/projects/:projectId/tasks',
  validate([param('projectId').isUUID()]),
  async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { status, assignee_id, priority } = req.query;

      let q = supabase
        .from('tasks')
        .select('*, assignee:users!tasks_assignee_id_fkey(id, name, email, avatar_url), labels:task_labels(label_id, labels(id, name, color))')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (status) q = q.eq('status', status);
      if (assignee_id) q = q.eq('assignee_id', assignee_id);
      if (priority) q = q.eq('priority', priority);

      const { data: tasks, error } = await q;
      if (error) throw error;

      const result = tasks.map((t) => ({
        ...t,
        labels: t.labels?.map((tl) => tl.labels).filter(Boolean) || [],
      }));

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/projects/:projectId/tasks',
  validate([
    param('projectId').isUUID(),
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().trim(),
    body('assignee_id').optional().isUUID(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('due_date').optional().isISO8601().withMessage('Invalid date format'),
  ]),
  async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { title, description, assignee_id, priority, due_date } = req.body;

      const { count } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title,
          description,
          assignee_id,
          priority: priority || 'medium',
          due_date,
          created_by: req.user.id,
          position: count || 0,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activities').insert({
        project_id: projectId,
        user_id: req.user.id,
        action: 'created',
        entity_type: 'task',
        entity_id: task.id,
        metadata: { title },
      });

      res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/tasks/:id',
  validate([param('id').isUUID()]),
  async (req, res, next) => {
    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*, assignee:users!tasks_assignee_id_fkey(id, name, email, avatar_url), creator:users!tasks_created_by_fkey(id, name, email, avatar_url), labels:task_labels(label_id, labels(id, name, color))')
        .eq('id', req.params.id)
        .single();

      if (error || !task) {
        return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
      }

      task.labels = task.labels?.map((tl) => tl.labels).filter(Boolean) || [];

      res.json({ task });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/tasks/:id',
  validate([
    param('id').isUUID(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('assignee_id').optional().isUUID().withMessage('Invalid assignee'),
    body('due_date').optional().isISO8601(),
  ]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = {};
      for (const key of ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date']) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      updates.updated_at = new Date().toISOString();

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { data: existing } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('id', id)
        .single();

      await supabase.from('activities').insert({
        project_id: existing?.project_id,
        user_id: req.user.id,
        action: 'updated',
        entity_type: 'task',
        entity_id: id,
        metadata: updates,
      });

      res.json({ task });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/tasks/:id',
  validate([param('id').isUUID()]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: task } = await supabase
        .from('tasks')
        .select('project_id, title')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;

      if (task) {
        await supabase.from('activities').insert({
          project_id: task.project_id,
          user_id: req.user.id,
          action: 'deleted',
          entity_type: 'task',
          entity_id: id,
          metadata: { title: task.title },
        });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/tasks/:id/move',
  validate([
    param('id').isUUID(),
    body('status').isIn(['todo', 'in_progress', 'in_review', 'done']).withMessage('Invalid status'),
    body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  ]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, position } = req.body;

      const { data: currentTask } = await supabase
        .from('tasks')
        .select('project_id, status')
        .eq('id', id)
        .single();

      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, position')
        .eq('project_id', currentTask.project_id)
        .eq('status', status)
        .order('position', { ascending: true });

      const toUpdate = tasks || [];
      for (const t of toUpdate) {
        if (t.id === id) continue;
        const newPos = t.position >= position ? t.position + 1 : t.position;
        if (newPos !== t.position) {
          await supabase
            .from('tasks')
            .update({ position: newPos })
            .eq('id', t.id);
        }
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update({ status, position, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activities').insert({
        project_id: currentTask?.project_id,
        user_id: req.user.id,
        action: 'moved',
        entity_type: 'task',
        entity_id: id,
        metadata: { from_status: currentTask?.status, to_status: status, position },
      });

      res.json({ task });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
