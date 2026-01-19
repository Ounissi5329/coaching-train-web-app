const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, category, level } = req.body;

    const course = await Course.create({
      title,
      description,
      price,
      category,
      level,
      coach: req.user._id
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const { category, level, coach, page = 1, limit = 10 } = req.query;

    let query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (coach) query.coach = coach;

    const courses = await Course.find(query)
      .populate('coach', 'firstName lastName avatar')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCoachCourses = async (req, res) => {
  try {
    const courses = await Course.find({ coach: req.user._id })
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('coach', 'firstName lastName avatar bio');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.coach.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, content, videoUrl, duration, resources } = req.body;

    course.lessons.push({
      title,
      description,
      content,
      videoUrl,
      duration,
      resources: resources || [],
      order: course.lessons.length
    });

    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    await Progress.create({
      client: req.user._id,
      coach: course.coach,
      course: course._id
    });

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: req.user._id
    }).populate('coach', 'firstName lastName avatar');

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.uploadCourseThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    course.thumbnail = `/uploads/${req.file.filename}`;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign a coach to a course
// @route   PUT /api/courses/:id/assign-coach
// @access  Private/Admin
exports.assignCoach = async (req, res) => {
  try {
    const { coachId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.coach = coachId;
    await course.save();

    const updatedCourse = await Course.findById(course._id).populate('coach', 'firstName lastName avatar');
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Manage client enrollment (add/remove)
// @route   PUT /api/courses/:id/manage-enrollment
// @access  Private/Admin
exports.manageEnrollment = async (req, res) => {
  try {
    const { clientId, action } = req.body; // action: 'add' or 'remove'
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (action === 'add') {
      if (!course.enrolledStudents.includes(clientId)) {
        course.enrolledStudents.push(clientId);
      }
    } else if (action === 'remove') {
      course.enrolledStudents = course.enrolledStudents.filter(
        id => id.toString() !== clientId.toString()
      );
    }

    await course.save();
    const updatedCourse = await Course.findById(course._id).populate('enrolledStudents', 'firstName lastName email avatar');
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.markLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let progress = await Progress.findOne({ client: userId, course: courseId });
    if (!progress) {
      progress = await Progress.create({
        client: userId,
        coach: course.coach,
        course: courseId,
        completedLessons: []
      });
    }

    const isAlreadyCompleted = progress.completedLessons.some(
      (cl) => cl.lessonId.toString() === lessonId
    );

    if (!isAlreadyCompleted) {
      progress.completedLessons.push({ lessonId, completedAt: new Date() });
      
      // Calculate overall progress
      const totalLessons = course.lessons.length;
      const completedCount = progress.completedLessons.length;
      progress.overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const progress = await Progress.findOne({ client: userId, course: courseId });
    if (!progress) {
      return res.json({ overallProgress: 0, completedLessons: [] });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEnrolledCoursesWithProgress = async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: req.user._id
    }).populate('coach', 'firstName lastName avatar');

    const coursesWithProgress = await Promise.all(courses.map(async (course) => {
      const progress = await Progress.findOne({ client: req.user._id, course: course._id });
      return {
        ...course.toObject(),
        progress: progress ? progress.overallProgress : 0
      };
    }));

    res.json(coursesWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
