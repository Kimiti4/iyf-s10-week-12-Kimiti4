/**
 * 🔹 Organization Controller - PostgreSQL Version
 * Handles CRUD operations for organizations and memberships
 */
const { OrganizationRepository, UserRepository } = require('../database');
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../middleware/errorHandler');

// @desc    Create a new organization
// @route   POST /api/organizations
// @access  Private (authenticated users)
exports.createOrganization = asyncHandler(async (req, res, next) => {
  const { name, slug, type, description, contact, branding, settings } = req.body;
  
  // Check if slug is already taken
  if (slug) {
    const existingOrg = await OrganizationRepository.findBySlug(slug);
    if (existingOrg) {
      return next(new AppError('Organization slug is already taken', 400));
    }
  }
  
  // Create organization
  const organization = await OrganizationRepository.create({
    name,
    slug,
    type,
    description,
    contact: contact || {},
    branding: branding || {},
    settings: settings || {},
    ownerId: req.user.id
  });
  
  // Add creator as owner member
  await OrganizationRepository.addMember(organization.id, req.user.id, 'owner');
  
  // Set as user's current organization
  await UserRepository.setCurrentOrganization(req.user.id, organization.id);
  
  res.status(201).json({
    success: true,
    data: {
      organization,
      message: 'Organization created successfully'
    }
  });
});

// @desc    Get all organizations (with filtering)
// @route   GET /api/organizations
// @access  Public
exports.getOrganizations = asyncHandler(async (req, res, next) => {
  const { type, county, search, page = 1, limit = 10 } = req.query;
  
  const result = await OrganizationRepository.find({
    type,
    county,
    status: 'active',
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(200).json({
    success: true,
    count: result.organizations.length,
    total: result.pagination.total,
    pages: result.pagination.pages,
    currentPage: result.pagination.page,
    data: result.organizations
  });
});

// @desc    Get single organization by slug or ID
// @route   GET /api/organizations/:slug
// @access  Public
exports.getOrganization = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  
  // Try to find by slug first
  let organization = await OrganizationRepository.findBySlug(slug);
  
  // If not found by slug, try by ID
  if (!organization && slug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
    organization = await OrganizationRepository.findById(slug);
  }
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: organization
  });
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (admin/owner only)
exports.updateOrganization = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin or owner
  const isAdmin = await OrganizationRepository.isAdmin(req.params.id, req.user.id);
  if (!isAdmin) {
    return next(new AppError('Not authorized to update this organization', 403));
  }
  
  // Update allowed fields
  const allowedFields = ['name', 'description', 'branding', 'contact', 'settings', 'moderation'];
  const updates = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  
  const updatedOrg = await OrganizationRepository.update(req.params.id, updates);
  
  res.status(200).json({
    success: true,
    data: updatedOrg
  });
});

// @desc    Delete organization (archive)
// @route   DELETE /api/organizations/:id
// @access  Private (owner only)
exports.deleteOrganization = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Only owner can delete
  if (organization.owner.id !== req.user.id) {
    return next(new AppError('Only the owner can delete this organization', 403));
  }
  
  // Archive instead of hard delete
  await OrganizationRepository.update(req.params.id, { status: 'archived' });
  
  res.status(200).json({
    success: true,
    message: 'Organization archived successfully'
  });
});

// @desc    Get user's organizations
// @route   GET /api/organizations/my
// @access  Private
exports.getMyOrganizations = asyncHandler(async (req, res, next) => {
  const organizations = await UserRepository.getUserOrganizations(req.user.id);
  
  res.status(200).json({
    success: true,
    count: organizations.length,
    data: organizations
  });
});

// @desc    Join organization (or request to join)
// @route   POST /api/organizations/:id/join
// @access  Private
exports.joinOrganization = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  if (organization.status !== 'active') {
    return next(new AppError('Organization is not accepting members', 403));
  }
  
  // Check if already a member
  const existingMembers = await OrganizationRepository.getMembers(req.params.id, { 
    status: 'active' 
  });
  
  const isAlreadyMember = existingMembers.members.some(m => m.user_id === req.user.id);
  
  if (isAlreadyMember) {
    return next(new AppError('You are already a member of this organization', 400));
  }
  
  // Determine if approval is needed
  const requiresApproval = organization.settings.requireApproval;
  const status = requiresApproval ? 'pending' : 'active';
  
  // Create membership
  const membership = await OrganizationRepository.addMember(
    req.params.id,
    req.user.id,
    'member'
  );
  
  // If approval required, update status to pending
  if (requiresApproval) {
    await query(`
      UPDATE memberships SET status = 'pending' WHERE id = $1
    `, [membership.id]);
  }
  
  res.status(201).json({
    success: true,
    data: {
      membership,
      message: requiresApproval
        ? 'Join request submitted. Waiting for approval.'
        : 'Successfully joined organization'
    }
  });
});

// @desc    Leave organization
// @route   POST /api/organizations/:id/leave
// @access  Private
exports.leaveOrganization = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Owner cannot leave without transferring ownership
  if (organization.owner.id === req.user.id) {
    return next(new AppError('Owner must transfer ownership before leaving', 400));
  }
  
  // Remove membership
  await OrganizationRepository.removeMember(req.params.id, req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'Successfully left organization'
  });
});

// @desc    Get organization members
// @route   GET /api/organizations/:id/members
// @access  Private (members only)
exports.getMembers = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is a member
  const userMemberships = await UserRepository.getUserOrganizations(req.user.id);
  const isMember = userMemberships.some(org => org.id === req.params.id);
  
  if (!isMember) {
    return next(new AppError('You must be a member to view the member list', 403));
  }
  
  const { role, page = 1, limit = 50 } = req.query;
  
  const members = await OrganizationRepository.getMembers(req.params.id, {
    role,
    status: 'active',
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(200).json({
    success: true,
    count: members.members.length,
    total: members.pagination.total,
    pages: members.pagination.pages,
    currentPage: members.pagination.page,
    data: members.members
  });
});

// @desc    Update member role
// @route   PUT /api/organizations/:id/members/:userId
// @access  Private (admin/owner only)
exports.updateMemberRole = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin
  const isAdmin = await OrganizationRepository.isAdmin(req.params.id, req.user.id);
  if (!isAdmin) {
    return next(new AppError('Not authorized to manage members', 403));
  }
  
  const { role } = req.body;
  
  if (!['admin', 'moderator', 'member'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }
  
  // Cannot change owner's role
  if (organization.owner.id === req.params.userId) {
    return next(new AppError('Cannot change owner role. Use transfer ownership endpoint.', 400));
  }
  
  // Update membership role
  await query(`
    UPDATE memberships SET role = $1 WHERE organization_id = $2 AND user_id = $3
  `, [role, req.params.id, req.params.userId]);
  
  // Update organization admins array if promoting/demoting admin
  if (role === 'admin') {
    await query(`
      UPDATE organizations 
      SET admins = array_append(admins, $1::uuid)
      WHERE id = $2 AND NOT ($1::uuid = ANY(admins))
    `, [req.params.userId, req.params.id]);
  } else {
    await query(`
      UPDATE organizations 
      SET admins = array_remove(admins, $1::uuid)
      WHERE id = $2
    `, [req.params.userId, req.params.id]);
  }
  
  res.status(200).json({
    success: true,
    message: 'Member role updated successfully'
  });
});

// @desc    Approve pending membership
// @route   POST /api/organizations/:id/members/:userId/approve
// @access  Private (admin/owner only)
exports.approveMember = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin
  const isAdmin = await OrganizationRepository.isAdmin(req.params.id, req.user.id);
  if (!isAdmin) {
    return next(new AppError('Not authorized', 403));
  }
  
  // Approve membership
  const result = await query(`
    UPDATE memberships 
    SET status = 'active' 
    WHERE organization_id = $1 AND user_id = $2 AND status = 'pending'
    RETURNING *
  `, [req.params.id, req.params.userId]);
  
  if (result.rows.length === 0) {
    return next(new AppError('Pending membership not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Member approved successfully',
    data: result.rows[0]
  });
});

// @desc    Remove/ban member
// @route   DELETE /api/organizations/:id/members/:userId
// @access  Private (admin/owner only)
exports.removeMember = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin
  const isAdmin = await OrganizationRepository.isAdmin(req.params.id, req.user.id);
  if (!isAdmin) {
    return next(new AppError('Not authorized', 403));
  }
  
  // Cannot remove owner
  if (organization.owner.id === req.params.userId) {
    return next(new AppError('Cannot remove owner', 400));
  }
  
  const { ban } = req.query;
  
  if (ban === 'true') {
    // Ban member
    await query(`
      UPDATE memberships SET status = 'banned' 
      WHERE organization_id = $1 AND user_id = $2
    `, [req.params.id, req.params.userId]);
  } else {
    // Remove membership
    await OrganizationRepository.removeMember(req.params.id, req.params.userId);
  }
  
  res.status(200).json({
    success: true,
    message: ban === 'true' ? 'Member banned' : 'Member removed'
  });
});

// @desc    Transfer organization ownership
// @route   POST /api/organizations/:id/transfer
// @access  Private (owner only)
exports.transferOwnership = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Only owner can transfer
  if (organization.owner.id !== req.user.id) {
    return next(new AppError('Only owner can transfer ownership', 403));
  }
  
  const { newOwnerId } = req.body;
  
  if (!newOwnerId) {
    return next(new AppError('New owner ID is required', 400));
  }
  
  // Check if new owner is a member
  const userMemberships = await UserRepository.getUserOrganizations(newOwnerId);
  const isNewOwnerMember = userMemberships.some(org => org.id === req.params.id);
  
  if (!isNewOwnerMember) {
    return next(new AppError('New owner must be a member first', 400));
  }
  
  // Update old owner to admin
  await query(`
    UPDATE memberships SET role = 'admin' 
    WHERE organization_id = $1 AND user_id = $2
  `, [req.params.id, req.user.id]);
  
  // Update new owner to owner
  await query(`
    UPDATE memberships SET role = 'owner' 
    WHERE organization_id = $1 AND user_id = $2
  `, [req.params.id, newOwnerId]);
  
  // Update organization owner
  await OrganizationRepository.update(req.params.id, { ownerId: newOwnerId });
  
  res.status(200).json({
    success: true,
    message: 'Ownership transferred successfully'
  });
});

// @desc    Get organization analytics
// @route   GET /api/organizations/:id/analytics
// @access  Private (admin only)
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const organization = await OrganizationRepository.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user has permission
  const isAdmin = await OrganizationRepository.isAdmin(req.params.id, req.user.id);
  if (!isAdmin) {
    return next(new AppError('Not authorized to view analytics', 403));
  }
  
  // Get basic stats from organization
  const memberCount = organization.stats.memberCount;
  
  // Calculate new members
  const newMembersResult = await query(`
    SELECT COUNT(*) as count FROM memberships
    WHERE organization_id = $1 AND status = 'active'
    AND joined_at >= NOW() - INTERVAL '7 days'
  `, [req.params.id]);
  
  const newMembersLast7Days = parseInt(newMembersResult.rows[0].count);
  
  const newMembers30Result = await query(`
    SELECT COUNT(*) as count FROM memberships
    WHERE organization_id = $1 AND status = 'active'
    AND joined_at >= NOW() - INTERVAL '30 days'
  `, [req.params.id]);
  
  const newMembersLast30Days = parseInt(newMembers30Result.rows[0].count);
  
  // Members by role
  const membersByRoleResult = await query(`
    SELECT role, COUNT(*) as count FROM memberships
    WHERE organization_id = $1 AND status = 'active'
    GROUP BY role
  `, [req.params.id]);
  
  const membersByRole = membersByRoleResult.rows.reduce((acc, item) => {
    acc[item.role] = parseInt(item.count);
    return acc;
  }, {});
  
  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalMembers: memberCount,
        newMembersLast7Days,
        newMembersLast30Days,
        posts: organization.stats.postCount
      },
      membersByRole,
      subscription: {
        plan: organization.plan,
        status: organization.subscription.status,
        periodEnd: organization.subscription.currentPeriodEnd
      }
    }
  });
});
