const Session = require('../models/Session');

exports.createSession = async (req, res) => {
  try {
    const { title, description, type, duration, maxParticipants, category } = req.body;

    const session = await Session.create({
      title,
      description,
      type,
      duration,
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

exports.createCourseSession = async (req, res) => {
  try {
    const { courseId, title, description, scheduledDate, duration, tasks } = req.body;

    // Verify the coach owns this course
    const Course = require('../models/Course');
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create sessions for this course' });
    }

    const session = await Session.create({
      title,
      description,
      type: 'course-session',
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      maxParticipants: course.enrolledStudents?.length || 1,
      participants: course.enrolledStudents || [],
      course: courseId,
      coach: req.user._id,
      category: course.category,
      tasks: tasks || []
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCoachSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      coach: req.user._id,
      type: 'course-session'
    })
    .populate('course', 'title description')
    .populate('participants', 'firstName lastName avatar')
    .sort({ scheduledDate: 1 });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUpcomingSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      participants: req.user._id,
      type: 'course-session',
      status: 'scheduled',
      scheduledDate: { $gte: new Date() }
    })
    .populate('coach', 'firstName lastName avatar')
    .populate('course', 'title description')
    .sort({ scheduledDate: 1 })
    .limit(10);

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSessionTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    session.tasks = tasks;
    await session.save();

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
