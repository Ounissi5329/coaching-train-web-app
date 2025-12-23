const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPayment,
  createConnectAccount,
  getPaymentHistory,
  refundPayment
} = require('../controllers/paymentController');

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/connect-account', protect, authorize('coach'), createConnectAccount);
router.get('/history', protect, getPaymentHistory);
router.post('/refund/:bookingId', protect, authorize('admin'), refundPayment);

module.exports = router;
