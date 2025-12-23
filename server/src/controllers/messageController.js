const Message = require('../models/Message');

const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType, fileUrl } = req.body;

    const conversationId = getConversationId(req.user._id.toString(), receiverId);

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      conversationId,
      content,
      messageType: messageType || 'text',
      fileUrl
    });

    await message.populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'receiver', select: 'firstName lastName avatar' }
    ]);

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversationId = getConversationId(req.user._id.toString(), userId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'firstName lastName avatar')
      .populate('receiver', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiver', req.user._id] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    const populatedConversations = await Promise.all(
      messages.map(async (conv) => {
        const message = await Message.findById(conv.lastMessage._id)
          .populate('sender', 'firstName lastName avatar')
          .populate('receiver', 'firstName lastName avatar');
        
        const otherUser = message.sender._id.toString() === req.user._id.toString() 
          ? message.receiver 
          : message.sender;

        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: message,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json(populatedConversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
