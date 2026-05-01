/**
 * 🔹 Users Routes
 */
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

// Protected routes
router.post('/', requireAuth, usersController.createUser);

module.exports = router;
