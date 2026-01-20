const Task = require('../models/Task');
const Course = require('../models/Course');

// Helper to check student enrollment visibility
async function isStudentEnrolledInCourse(userId, courseId) {
  if (!courseId) return false;
  const course = await Course.findById(courseId).select('enrolledStudents coach');
  if (!course) return false;
  return course.enrolledStudents?.some(s => String(s._id || s) === String(userId));
}

exports.createTask = async (req, res) => {
  try {
    const { courseId, lessonId, assignedTo, title, description, dueDate, scope } = req.body;

    if (!title || !scope) {
      return res.status(400).json({ message: 'title and scope are required' });
    }

    const task = await Task.create({
      courseId: courseId || undefined,
      lessonId: lessonId || undefined,
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      scope,
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = (({ title, description, dueDate, scope, assignedTo, courseId, lessonId }) => ({ title, description, dueDate, scope, assignedTo, courseId, lessonId }))(req.body);
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

exports.listTasks = async (req, res) => {
  try {
    const { courseId, lessonId, scope, forToday } = req.query;
    const user = req.user;

    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (lessonId) filter.lessonId = lessonId;
    if (scope) filter.scope = scope;

    if (forToday === 'true') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      filter.dueDate = { $gte: start, $lte: end };
    }

    // Visibility rules
    if (user.role === 'admin' || user.role === 'coach') {
      // Instructors/Admins see tasks they created or for their courses; simple approach: show all matching filter
      const tasks = await Task.find(filter).sort({ createdAt: -1 });
      return res.json(tasks);
    }

    // Student visibility
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    const visible = [];
    for (const t of tasks) {
      const assigned = (t.assignedTo || []).some(uid => String(uid) === String(user._id));
      const enrolled = await isStudentEnrolledInCourse(user._id, t.courseId);
      if (assigned || enrolled) {
        visible.push(t);
      }
    }
    res.json(visible);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // ensure student visibility before completion
    const assigned = (task.assignedTo || []).some(uid => String(uid) === String(userId));
    const enrolled = await isStudentEnrolledInCourse(userId, task.courseId);
    if (!(assigned || enrolled)) return res.status(403).json({ message: 'Not allowed' });

    const existing = (task.statusByUser || []).find(s => String(s.userId) === String(userId));
    if (existing) {
      existing.status = 'completed';
      existing.updatedAt = new Date();
    } else {
      task.statusByUser.push({ userId, status: 'completed', updatedAt: new Date() });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to complete task' });
  }
};
