const express = require('express');
const { body, param, query } = require('express-validator');
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

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*, tasks:tasks(count)')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result = projects.map((p) => ({
        ...p,
        task_count: p.tasks?.[0]?.count || 0,
        tasks: undefined,
      }));

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  validate([
    body('org_id').isUUID().withMessage('Valid org_id is required'),
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ]),
  async (req, res, next) => {
    try {
      const { org_id, name, description } = req.body;

      const { data: project, error } = await supabase
        .from('projects')
        .insert({ org_id, name, description, owner_id: req.user.id })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activities').insert({
        project_id: project.id,
        user_id: req.user.id,
        action: 'created',
        entity_type: 'project',
        entity_id: project.id,
      });

      res.status(201).json({ project });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  validate([param('id').isUUID().withMessage('Invalid project ID')]),
  async (req, res, next) => {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*, tasks:tasks(count)')
        .eq('id', req.params.id)
        .single();

      if (error || !project) {
        return res.status(404).json({ error: 'Project not found', code: 'NOT_FOUND' });
      }

      project.task_count = project.tasks?.[0]?.count || 0;
      delete project.tasks;

      res.json({ project });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  validate([
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['active', 'archived', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = {};
      for (const key of ['name', 'description', 'status', 'priority']) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      updates.updated_at = new Date().toISOString();

      const { data: project, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activities').insert({
        project_id: id,
        user_id: req.user.id,
        action: 'updated',
        entity_type: 'project',
        entity_id: id,
        metadata: updates,
      });

      res.json({ project });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  validate([param('id').isUUID()]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (!project) {
        return res.status(404).json({ error: 'Project not found', code: 'NOT_FOUND' });
      }

      const { data: caller } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', req.user.id)
        .single();

      if (project.owner_id !== req.user.id && (!caller || (caller.role !== 'owner' && caller.role !== 'admin'))) {
        return res.status(403).json({ error: 'Insufficient permissions', code: 'PERMISSION_DENIED' });
      }

      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
