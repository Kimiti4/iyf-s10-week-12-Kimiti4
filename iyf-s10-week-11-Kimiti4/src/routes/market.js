/**
 * 🔹 Market Routes
 */
const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// GET farm produce prices
router.get('/prices', marketController.getPrices);

module.exports = router;
