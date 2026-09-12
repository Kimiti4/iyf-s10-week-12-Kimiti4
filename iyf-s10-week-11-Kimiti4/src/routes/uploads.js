/**
 * 🔹 Upload Routes
 */
const express = require('express');
const router = express.Router();
const uploadsController = require('../controllers/uploadsControllerPG');
const { protect } = require('../middleware/authPG');

router.post('/', protect, uploadsController.uploadImage);

module.exports = router;
