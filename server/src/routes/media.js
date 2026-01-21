const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadMedia,
  getAllMedia,
  deleteMedia
} = require('../controllers/mediaController');

router.get('/', getAllMedia);
router.post('/upload', protect, upload.single('file'), uploadMedia);
router.delete('/:id', protect, authorize('admin'), deleteMedia);

module.exports = router;
