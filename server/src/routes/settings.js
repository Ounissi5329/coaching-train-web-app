const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController');

// Public route to get settings
router.get('/:key', getSettings);

// Admin only route to update settings
router.put('/:key', protect, authorize('admin'), updateSettings);

module.exports = router;