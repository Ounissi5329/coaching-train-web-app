const Session = require('../models/Session');

exports.createSession = async (req, res) => {
  try {
    const { title, description, type, duration, price, maxParticipants, category } = req.body;

    const session = await Session.create({
      title,
      description,
      type,
      duration,
      price,
      maxParticipants,
      category,
      coach: req.user._id
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const { category, type, coach, page = 1, limit = 10 } = req.query;

    let query = { isActive: true };

    if (category) query.category = category;
    if (type) query.type = type;
    if (coach) query.coach = coach;

    const sessions = await Session.find(query)
      .populate('coach', 'firstName lastName avatar hourlyRate')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCoachSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ coach: req.user._id })
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('coach', 'firstName lastName avatar bio hourlyRate availability');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
