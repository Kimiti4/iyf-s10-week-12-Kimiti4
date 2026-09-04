/**
 * 🔹 Organization Controller
 * Handles CRUD operations for organizations and memberships
 */
const Organization = require('../models/Organization');
const Membership = require('../models/Membership');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../middleware/errorHandler');

// @desc    Create a new organization
// @route   POST /api/organizations
// @access  Private (authenticated users)
exports.createOrganization = asyncHandler(async (req, res, next) => {
  const { name, slug, type, description, contact } = req.body;
  
  // Check if slug is already taken
  if (slug) {
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return next(new AppError('Organization slug is already taken', 400));
    }
  }
  
  // Create organization
  const organization = await Organization.create({
    name,
    slug,
    type,
    description,
    contact,
    owner: req.user._id,
    admins: [req.user._id]
  });
  
  // Create membership for creator (as owner)
  await Membership.create({
    organization: organization._id,
    user: req.user._id,
    role: 'owner',
    status: 'active',
    joinedAt: new Date()
  });
  
  // Update user's organizations array
  await User.findByIdAndUpdate(req.user._id, {
    $push: { organizations: organization._id },
    currentOrganization: organization._id
  });
  
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
  
  const result = await Organization.search(search, {
    type,
    county,
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  const total = await Organization.countDocuments({ status: 'active' });
  
  res.status(200).json({
    success: true,
    count: result.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: result
  });
});

// @desc    Get single organization by slug or ID
// @route   GET /api/organizations/:slug
// @access  Public
exports.getOrganization = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  
  // Try to find by slug first, then by ID
  let organization = await Organization.findBySlug(slug);
  
  if (!organization) {
    organization = await Organization.findById(slug).populate('owner', 'username profile.avatar');
  }
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Get member count
  const memberCount = await Membership.countDocuments({
    organization: organization._id,
    status: 'active'
  });
  
  res.status(200).json({
    success: true,
    data: {
      ...organization.toObject(),
      stats: {
        ...organization.stats,
        memberCount
      }
    }
  });
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (admin/owner only)
exports.updateOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin or owner
  if (!organization.isAdmin(req.user._id)) {
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
  
  const updatedOrg = await Organization.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: updatedOrg
  });
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (owner only)
exports.deleteOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Only owner can delete
  if (!organization.isOwner(req.user._id)) {
    return next(new AppError('Only the owner can delete this organization', 403));
  }
  
  // Archive instead of hard delete
  organization.status = 'archived';
  await organization.save();
  
  res.status(200).json({
    success: true,
    message: 'Organization archived successfully'
  });
});

// @desc    Get user's organizations
// @route   GET /api/organizations/my
// @access  Private
exports.getMyOrganizations = asyncHandler(async (req, res, next) => {
  const memberships = await Membership.find({
    user: req.user._id,
    status: 'active'
  }).populate('organization');
  
  const organizations = memberships.map(m => ({
    ...m.organization.toObject(),
    membershipRole: m.role,
    membershipId: m._id
  }));
  
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
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  if (organization.status !== 'active') {
    return next(new AppError('Organization is not accepting members', 403));
  }
  
  // Check if already a member
  const existingMembership = await Membership.findOne({
    organization: organization._id,
    user: req.user._id
  });
  
  if (existingMembership) {
    return next(new AppError('You are already a member of this organization', 400));
  }
  
  // Determine if approval is needed
  const requiresApproval = organization.settings.requireApproval;
  const status = requiresApproval ? 'pending' : 'active';
  
  // Create membership
  const membership = await Membership.create({
    organization: organization._id,
    user: req.user._id,
    role: 'member',
    status,
    joinedAt: new Date()
  });
  
  // If no approval needed, add to organization's member list
  if (!requiresApproval) {
    await organization.incrementMemberCount();
    await User.findByIdAndUpdate(req.user._id, {
      $push: { organizations: organization._id }
    });
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
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Owner cannot leave without transferring ownership
  if (organization.isOwner(req.user._id)) {
    return next(new AppError('Owner must transfer ownership before leaving', 400));
  }
  
  // Remove membership
  await Membership.findOneAndDelete({
    organization: organization._id,
    user: req.user._id
  });
  
  // Update counts
  await organization.decrementMemberCount();
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { organizations: organization._id }
  });
  
  res.status(200).json({
    success: true,
    message: 'Successfully left organization'
  });
});

// @desc    Get organization members
// @route   GET /api/organizations/:id/members
// @access  Private (members only)
exports.getMembers = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is a member
  const membership = await Membership.findOne({
    organization: organization._id,
    user: req.user._id,
    status: 'active'
  });
  
  if (!membership) {
    return next(new AppError('You must be a member to view the member list', 403));
  }
  
  const { role, page = 1, limit = 50 } = req.query;
  
  const members = await Membership.findMembers(organization._id, {
    role,
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  const total = await Membership.countDocuments({
    organization: organization._id,
    status: 'active'
  });
  
  res.status(200).json({
    success: true,
    count: members.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: members
  });
});

// @desc    Update member role
// @route   PUT /api/organizations/:id/members/:userId
// @access  Private (admin/owner only)
exports.updateMemberRole = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin
  if (!organization.isAdmin(req.user._id)) {
    return next(new AppError('Not authorized to manage members', 403));
  }
  
  const { role } = req.body;
  
  if (!['admin', 'moderator', 'member'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }
  
  // Cannot change owner's role
  const targetMembership = await Membership.findOne({
    organization: organization._id,
    user: req.params.userId
  });
  
  if (!targetMembership) {
    return next(new AppError('User is not a member', 404));
  }
  
  if (targetMembership.role === 'owner') {
    return next(new AppError('Cannot change owner role. Use transfer ownership endpoint.', 400));
  }
  
  targetMembership.role = role;
  await targetMembership.save();
  
  // Update organization admins array if promoting/demoting admin
  if (role === 'admin') {
    if (!organization.admins.includes(req.params.userId)) {
      organization.admins.push(req.params.userId);
      await organization.save();
    }
  } else {
    organization.admins = organization.admins.filter(
      id => id.toString() !== req.params.userId
    );
    await organization.save();
  }
  
  res.status(200).json({
    success: true,
    data: targetMembership
  });
});

// @desc    Approve pending membership
// @route   POST /api/organizations/:id/members/:userId/approve
// @access  Private (admin/owner only)
exports.approveMember = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin
  if (!organization.isAdmin(req.user._id)) {
    return next(new AppError('Not authorized', 403));
  }
  
  const membership = await Membership.findOne({
    organization: organization._id,
    user: req.params.userId,
    status: 'pending'
  });
  
  if (!membership) {
    return next(new AppError('Pending membership not found', 404));
  }
  
  membership.status = 'active';
  membership.approvedBy = req.user._id;
  await membership.save();
  
  await organization.incrementMemberCount();
  await User.findByIdAndUpdate(req.params.userId, {
    $push: { organizations: organization._id }
  });
  
  res.status(200).json({
    success: true,
    message: 'Member approved successfully',
    data: membership
  });
});

// @desc    Remove/ban member
// @route   DELETE /api/organizations/:id/members/:userId
// @access  Private (admin/owner only)
exports.removeMember = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user is admin
  if (!organization.isAdmin(req.user._id)) {
    return next(new AppError('Not authorized', 403));
  }
  
  // Cannot remove owner
  if (organization.isOwner(req.params.userId)) {
    return next(new AppError('Cannot remove owner', 400));
  }
  
  const { ban } = req.query;
  
  if (ban === 'true') {
    // Ban member
    await Membership.findOneAndUpdate(
      { organization: organization._id, user: req.params.userId },
      { status: 'banned' }
    );
  } else {
    // Remove membership
    await Membership.findOneAndDelete({
      organization: organization._id,
      user: req.params.userId
    });
  }
  
  await organization.decrementMemberCount();
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { organizations: organization._id }
  });
  
  res.status(200).json({
    success: true,
    message: ban === 'true' ? 'Member banned' : 'Member removed'
  });
});

// @desc    Transfer organization ownership
// @route   POST /api/organizations/:id/transfer
// @access  Private (owner only)
exports.transferOwnership = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Only owner can transfer
  if (!organization.isOwner(req.user._id)) {
    return next(new AppError('Only owner can transfer ownership', 403));
  }
  
  const { newOwnerId } = req.body;
  
  if (!newOwnerId) {
    return next(new AppError('New owner ID is required', 400));
  }
  
  // Check if new owner is a member
  const newOwnerMembership = await Membership.findOne({
    organization: organization._id,
    user: newOwnerId
  });
  
  if (!newOwnerMembership) {
    return next(new AppError('New owner must be a member first', 400));
  }
  
  // Update old owner to admin
  const oldOwnerMembership = await Membership.findOne({
    organization: organization._id,
    user: req.user._id
  });
  oldOwnerMembership.role = 'admin';
  await oldOwnerMembership.save();
  
  // Update new owner to owner
  newOwnerMembership.role = 'owner';
  await newOwnerMembership.save();
  
  // Update organization
  organization.owner = newOwnerId;
  if (!organization.admins.includes(newOwnerId)) {
    organization.admins.push(newOwnerId);
  }
  await organization.save();
  
  res.status(200).json({
    success: true,
    message: 'Ownership transferred successfully'
  });
});

// @desc    Get organization analytics
// @route   GET /api/organizations/:id/analytics
// @access  Private (admin only)
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new AppError('Organization not found', 404));
  }
  
  // Check if user has permission
  const membership = await Membership.findOne({
    organization: organization._id,
    user: req.user._id,
    status: 'active'
  });
  
  if (!membership || !membership.hasPermission('canViewAnalytics')) {
    return next(new AppError('Not authorized to view analytics', 403));
  }
  
  // Get basic stats
  const memberCount = await Membership.countDocuments({
    organization: organization._id,
    status: 'active'
  });
  
  const newMembersLast7Days = await Membership.countDocuments({
    organization: organization._id,
    status: 'active',
    joinedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  
  const newMembersLast30Days = await Membership.countDocuments({
    organization: organization._id,
    status: 'active',
    joinedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
  
  // Members by role
  const membersByRole = await Membership.countByRole(organization._id);
  
  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalMembers: memberCount,
        newMembersLast7Days,
        newMembersLast30Days,
        posts: organization.stats.postCount
      },
      membersByRole: membersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      subscription: {
        plan: organization.plan,
        status: organization.subscription.status,
        periodEnd: organization.subscription.currentPeriodEnd
      }
    }
  });
});
