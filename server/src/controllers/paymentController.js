const Stripe = require('stripe');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, courseId } = req.body;
    let amount, metadata;

    if (bookingId) {
      const booking = await Booking.findById(bookingId).populate('session').populate('coach');
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      if (booking.client.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
      
      amount = booking.amount;
      metadata = {
        type: 'booking',
        bookingId: booking._id.toString(),
        sessionId: booking.session._id.toString(),
        coachId: booking.coach._id.toString()
      };
    } else if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      
      amount = course.price;
      metadata = {
        type: 'course',
        courseId: course._id.toString(),
        coachId: course.coach.toString()
      };
    } else {
      return res.status(400).json({ message: 'Please provide bookingId or courseId' });
    }

    let customer;
    const user = await User.findById(req.user._id);

    if (user.stripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } catch (e) {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        });
        user.stripeCustomerId = customer.id;
        await user.save();
      }
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: customer.id,
      metadata: metadata
    });

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { paymentIntentId: paymentIntent.id });
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Progress = require('../models/Progress');

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, amount, cardDetails } = req.body;

    // Handle demo payments (for development/testing)
    if (paymentIntentId.startsWith('demo_')) {
      // For demo purposes, always treat as successful
      const type = req.body.type || 'course'; // Default to course if not specified
      const courseId = req.body.courseId;

      if (type === 'course' && courseId) {
        const course = await Course.findById(courseId);
        if (course && !course.enrolledStudents.includes(req.user._id)) {
          course.enrolledStudents.push(req.user._id);
          await course.save();

          await Progress.create({
            client: req.user._id,
            coach: course.coach,
            course: courseId
          });
        }
      }

      return res.json({
        success: true,
        message: 'Demo payment confirmed',
        demo: true
      });
    }

    // Handle real Stripe payments
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const { type, bookingId, courseId, coachId } = paymentIntent.metadata;

      if (type === 'booking') {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          booking.paymentIntentId = paymentIntentId;
          await booking.save();
        }
      } else if (type === 'course') {
        const course = await Course.findById(courseId);
        if (course && !course.enrolledStudents.includes(req.user._id)) {
          course.enrolledStudents.push(req.user._id);
          await course.save();

          await Progress.create({
            client: req.user._id,
            coach: coachId,
            course: courseId
          });
        }
      }

      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createConnectAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.role !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can create connect accounts' });
    }

    if (user.stripeAccountId) {
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.CLIENT_URL}/coach/settings/payments`,
        return_url: `${process.env.CLIENT_URL}/coach/settings/payments?success=true`,
        type: 'account_onboarding'
      });

      return res.json({ url: accountLink.url });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });

    user.stripeAccountId = account.id;
    await user.save();

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.CLIENT_URL}/coach/settings/payments`,
      return_url: `${process.env.CLIENT_URL}/coach/settings/payments?success=true`,
      type: 'account_onboarding'
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let query = { paymentStatus: 'paid' };

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'coach') {
      query.coach = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('client', 'firstName lastName email')
      .populate('coach', 'firstName lastName email')
      .populate('session', 'title')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      payments: bookings.map(b => ({
        id: b._id,
        amount: b.amount,
        date: b.createdAt,
        session: b.session.title,
        client: b.client,
        coach: b.coach,
        status: b.paymentStatus
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Payment not eligible for refund' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentIntentId
    });

    if (refund.status === 'succeeded') {
      booking.paymentStatus = 'refunded';
      booking.status = 'cancelled';
      await booking.save();

      res.json({ success: true, message: 'Refund processed successfully' });
    } else {
      res.status(400).json({ message: 'Refund failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
