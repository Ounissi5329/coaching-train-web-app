const Comment = require('../models/Comment');

// @desc    Get comments for a course or lesson
// @route   GET /api/comments/:courseId
exports.getComments = async (req, res) => {
  try {
    const { lessonId } = req.query;
    const query = { 
      course: req.params.courseId, 
      parentComment: null 
    };
    
    if (lessonId) {
      query.lessonId = lessonId;
    }

    const comments = await Comment.find(query)
      .populate('user', 'firstName lastName avatar role')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'firstName lastName avatar role' }
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new comment or reply
// @route   POST /api/comments
exports.createComment = async (req, res) => {
  try {
    const { content, courseId, lessonId, parentCommentId } = req.body;

    const comment = await Comment.create({
      content,
      user: req.user._id,
      course: courseId,
      lessonId,
      parentComment: parentCommentId || null
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'firstName lastName avatar role');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    React to a comment (like/dislike)
// @route   POST /api/comments/:id/react
exports.reactToComment = async (req, res) => {
  try {
    const { type } = req.body; // 'like' or 'dislike'
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;

    if (type === 'like') {
      // Remove from dislikes if exists
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
      
      // Toggle like
      const isLiked = comment.likes.find(id => id.toString() === userId.toString());
      if (isLiked) {
        comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      } else {
        comment.likes.push(userId);
      }
    } else if (type === 'dislike') {
      // Remove from likes if exists
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      
      // Toggle dislike
      const isDisliked = comment.dislikes.find(id => id.toString() === userId.toString());
      if (isDisliked) {
        comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
      } else {
        comment.dislikes.push(userId);
      }
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only author or admin can delete
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
