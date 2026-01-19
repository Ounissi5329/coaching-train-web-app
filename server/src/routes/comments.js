const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getComments,
  createComment,
  reactToComment,
  deleteComment
} = require('../controllers/commentController');

router.get('/:courseId', getComments);
router.post('/', protect, createComment);
router.post('/:id/react', protect, reactToComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
