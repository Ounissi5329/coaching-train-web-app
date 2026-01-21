const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getCoachSessions,
  getSessionById,
  updateSession,
  deleteSession,
  createCourseSession,
  getUpcomingSessions,
  updateSessionTasks
} = require('../controllers/sessionController');

router.get('/', getSessions);
router.get('/my-sessions', protect, authorize('coach'), getCoachSessions);
router.get('/upcoming', protect, getUpcomingSessions);
router.get('/:id', getSessionById);

router.post('/', protect, authorize('coach'), createSession);
router.post('/course-session', protect, authorize('coach'), createCourseSession);
router.put('/:id', protect, authorize('coach'), updateSession);
router.put('/:id/tasks', protect, authorize('coach'), updateSessionTasks);
router.delete('/:id', protect, authorize('coach'), deleteSession);

module.exports = router;
