const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  getUpcomingBookings
} = require('../controllers/bookingController');

router.get('/', protect, getBookings);
router.get('/upcoming', protect, getUpcomingBookings);
router.get('/:id', protect, getBookingById);

router.post('/', protect, createBooking);
router.put('/:id/status', protect, authorize('coach', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/reschedule', protect, rescheduleBooking);

module.exports = router;
