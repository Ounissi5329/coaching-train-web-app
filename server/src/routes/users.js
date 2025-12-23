const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getCoaches,
  getCoachById,
  getClients,
  getAllUsers,
  updateUserStatus,
  uploadAvatar
} = require('../controllers/userController');

router.get('/coaches', getCoaches);
router.get('/coaches/:id', getCoachById);

router.get('/clients', protect, authorize('coach', 'admin'), getClients);

router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
