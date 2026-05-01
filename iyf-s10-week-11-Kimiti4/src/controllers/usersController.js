/**
 * 🔹 Users Controller
 */
const store = require('../data/store');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// GET all users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, county, skill } = req.query;

  let result = [...store.users];

  if (role) {
    result = result.filter(u => u.role === role);
  }
  if (county) {
    result = result.filter(u => u.location?.county?.toLowerCase() === county.toLowerCase());
  }
  if (skill) {
    result = result.filter(u => u.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase())));
  }

  res.json({ success: true, count: result.length, data: result });
});

// GET single user
const getUserById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = store.users.find(u => u.id === id);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, data: user });
});

// POST create user
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, skills, farmProfile, location } = req.body;

  if (!name || !email) {
    throw new ApiError('Name and email are required', 400);
  }

  const newUser = {
    id: store.nextUserId(),
    name,
    email,
    role: role || 'member',
    skills: skills || [],
    farmProfile: farmProfile || null,
    location: location || {},
    rating: 0,
    completedExchanges: 0
  };

  store.users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};
