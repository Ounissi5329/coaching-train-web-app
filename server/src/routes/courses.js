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
  markLessonCompleted,
  getCourseProgress,
  getEnrolledCoursesWithProgress,
  uploadCourseThumbnail,
  assignCoach,
  manageEnrollment
} = require('../controllers/courseController');

router.get('/', getCourses);
router.get('/enrolled', protect, getEnrolledCoursesWithProgress);
router.get('/my-courses', protect, authorize('coach'), getCoachCourses);
router.get('/:id', getCourseById);

router.post('/', protect, authorize('coach', 'admin'), createCourse);
router.put('/:id', protect, authorize('coach', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('coach', 'admin'), deleteCourse);

router.post('/:id/lessons', protect, authorize('coach', 'admin'), addLesson);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:courseId/lessons/:lessonId/complete', protect, markLessonCompleted);
router.get('/:courseId/progress', protect, getCourseProgress);
router.post('/:id/thumbnail', protect, authorize('coach', 'admin'), upload.single('thumbnail'), uploadCourseThumbnail);

// Admin only routes
router.put('/:id/assign-coach', protect, authorize('admin'), assignCoach);
router.put('/:id/manage-enrollment', protect, authorize('admin'), manageEnrollment);

module.exports = router;
