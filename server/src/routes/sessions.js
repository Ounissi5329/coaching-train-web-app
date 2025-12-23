const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getCoachSessions,
  getSessionById,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');

router.get('/', getSessions);
router.get('/my-sessions', protect, authorize('coach'), getCoachSessions);
router.get('/:id', getSessionById);

router.post('/', protect, authorize('coach'), createSession);
router.put('/:id', protect, authorize('coach'), updateSession);
router.delete('/:id', protect, authorize('coach'), deleteSession);

module.exports = router;
