const express = require('express');
const { body, param } = require('express-validator');
const supabase = require('../config/database');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth);

router.get(
  '/:id/members',
  validate([param('id').isUUID().withMessage('Invalid org ID')]),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: members, error } = await supabase
        .from('organization_members')
        .select('role, user:users(id, name, email, avatar_url)')
        .eq('org_id', id);

      if (error) throw error;
      res.json(members || []);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('org_id, role, organizations(id, name, slug, description)')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const orgs = data.map((m) => ({
      ...m.organizations,
      role: m.role,
    }));

    res.json(orgs);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('Organization name is required'),
    body('description').optional().trim(),
  ]),
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { data: org, error } = await supabase
        .from('organizations')
        .insert({ name, slug, description, owner_id: req.user.id })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('organization_members').insert({
        org_id: org.id,
        user_id: req.user.id,
        role: 'owner',
      });

      res.status(201).json({ org });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/members',
  validate([
    param('id').isUUID().withMessage('Invalid org ID'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member'),
  ]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email, role } = req.body;

      const { data: caller } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', id)
        .eq('user_id', req.user.id)
        .single();

      if (!caller || (caller.role !== 'owner' && caller.role !== 'admin')) {
        return res.status(403).json({ error: 'Insufficient permissions', code: 'PERMISSION_DENIED' });
      }

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!user) {
        return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
      }

      const { data: member, error } = await supabase
        .from('organization_members')
        .insert({ org_id: id, user_id: user.id, role })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'User is already a member', code: 'ALREADY_MEMBER' });
        }
        throw error;
      }

      res.status(201).json({ member });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id/members/:userId',
  validate([param('id').isUUID(), param('userId').isUUID()]),
  async (req, res, next) => {
    try {
      const { id, userId } = req.params;

      const { data: caller } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', id)
        .eq('user_id', req.user.id)
        .single();

      if (!caller || (caller.role !== 'owner' && caller.role !== 'admin')) {
        return res.status(403).json({ error: 'Insufficient permissions', code: 'PERMISSION_DENIED' });
      }

      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('org_id', id)
        .eq('user_id', userId);

      if (error) throw error;
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
