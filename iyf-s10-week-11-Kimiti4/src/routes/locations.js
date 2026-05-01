/**
 * 🔹 Locations Routes
 */
const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locationsController');

// GET all locations
router.get('/', locationsController.getAllLocations);

module.exports = router;
