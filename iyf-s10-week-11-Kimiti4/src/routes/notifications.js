/**
 * 🔹 Notification Routes
 */
const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsControllerPG');
const { protect } = require('../middleware/authPG');

router.get('/unread-count', protect, notificationsController.getUnreadCount);
router.patch('/read-all', protect, notificationsController.markAllRead);
router.get('/', protect, notificationsController.listNotifications);
router.patch('/:id/read', protect, notificationsController.markRead);

module.exports = router;
