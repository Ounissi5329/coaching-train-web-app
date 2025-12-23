const Stripe = require('stripe');
const Booking = require('../models/Booking');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('session')
      .populate('coach');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let customer;
    const user = await User.findById(req.user._id);

    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.amount * 100),
      currency: 'usd',
      customer: customer.id,
      metadata: {
        bookingId: booking._id.toString(),
        sessionId: booking.session._id.toString(),
        coachId: booking.coach._id.toString()
      }
    });

    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const booking = await Booking.findOne({ paymentIntentId });

      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();
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
