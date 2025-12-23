const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createCourse,
  getCourses,
  getCoachCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  enrollCourse,
  getEnrolledCourses,
  uploadCourseThumbnail
} = require('../controllers/courseController');

router.get('/', getCourses);
router.get('/enrolled', protect, getEnrolledCourses);
router.get('/my-courses', protect, authorize('coach'), getCoachCourses);
router.get('/:id', getCourseById);

router.post('/', protect, authorize('coach'), createCourse);
router.put('/:id', protect, authorize('coach'), updateCourse);
router.delete('/:id', protect, authorize('coach'), deleteCourse);

router.post('/:id/lessons', protect, authorize('coach'), addLesson);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/thumbnail', protect, authorize('coach'), upload.single('thumbnail'), uploadCourseThumbnail);

module.exports = router;
