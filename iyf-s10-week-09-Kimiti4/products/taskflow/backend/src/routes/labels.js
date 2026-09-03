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
      const { data: labels, error } = await supabase
        .from('labels')
        .select('*')
        .eq('org_id', req.query.org_id)
        .order('name');

      if (error) throw error;
      res.json(labels);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  validate([
    body('org_id').isUUID(),
    body('name').trim().notEmpty().withMessage('Label name is required'),
    body('color').optional().trim(),
  ]),
  async (req, res, next) => {
    try {
      const { org_id, name, color } = req.body;

      const { data: label, error } = await supabase
        .from('labels')
        .insert({ org_id, name, color: color || '#6366f1' })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ label });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/tasks/:id/labels',
  validate([param('id').isUUID(), body('label_id').isUUID()]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { label_id } = req.body;

      const { data: taskLabel, error } = await supabase
        .from('task_labels')
        .insert({ task_id: id, label_id })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Label already assigned', code: 'ALREADY_ASSIGNED' });
        }
        throw error;
      }

      res.status(201).json({ task_label: taskLabel });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/tasks/:id/labels/:labelId',
  validate([param('id').isUUID(), param('labelId').isUUID()]),
  async (req, res, next) => {
    try {
      const { id, labelId } = req.params;

      const { error } = await supabase
        .from('task_labels')
        .delete()
        .eq('task_id', id)
        .eq('label_id', labelId);

      if (error) throw error;
      res.status(204).send();
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

      await supabase.from('task_labels').delete().eq('label_id', id);
      const { error } = await supabase.from('labels').delete().eq('id', id);
      if (error) throw error;
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
