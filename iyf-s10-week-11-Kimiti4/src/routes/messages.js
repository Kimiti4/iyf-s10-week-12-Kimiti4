/**
 * 🔹 Direct Message Routes
 */
const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesControllerPG');
const { protect } = require('../middleware/authPG');

router.get('/conversations', protect, messagesController.listConversations);
router.post('/conversations', protect, messagesController.getOrCreateConversation);
router.get('/conversations/:id', protect, messagesController.getMessages);
router.post('/conversations/:id/messages', protect, messagesController.sendMessage);
router.patch('/conversations/:id/read', protect, messagesController.markRead);

module.exports = router;
