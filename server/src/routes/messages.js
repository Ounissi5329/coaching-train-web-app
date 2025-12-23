const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  getUnreadCount
} = require('../controllers/messageController');

router.get('/', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.get('/:userId', protect, getConversation);

router.post('/', protect, sendMessage);
router.put('/:conversationId/read', protect, markAsRead);

module.exports = router;
