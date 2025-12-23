const Booking = require('../models/Booking');
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

exports.createBooking = async (req, res) => {
  try {
    const { sessionId, scheduledDate, startTime, endTime, notes } = req.body;

    const session = await Session.findById(sessionId).populate('coach');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const existingBooking = await Booking.findOne({
      coach: session.coach._id,
      scheduledDate,
      startTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const roomId = uuidv4();

    const booking = await Booking.create({
      client: req.user._id,
      coach: session.coach._id,
      session: sessionId,
      scheduledDate,
      startTime,
      endTime,
      notes,
      amount: session.price,
      meetingLink: `/video/${roomId}`
    });

    await booking.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'coach', select: 'firstName lastName email' },
      { path: 'session', select: 'title duration' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = {};

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'coach') {
      query.coach = req.user._id;
    }

    if (status) query.status = status;

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate('client', 'firstName lastName email avatar')
      .populate('coach', 'firstName lastName email avatar')
      .populate('session', 'title duration type')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ scheduledDate: 1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'firstName lastName email avatar')
      .populate('coach', 'firstName lastName email avatar')
      .populate('session', 'title description duration type');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.client._id.toString() !== req.user._id.toString() &&
      booking.coach._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, coachNotes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.coach.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    if (coachNotes) booking.coachNotes = coachNotes;

    await booking.save();
    await booking.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'coach', select: 'firstName lastName email' },
      { path: 'session', select: 'title duration' }
    ]);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.client.toString() !== req.user._id.toString() &&
      booking.coach.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rescheduleBooking = async (req, res) => {
  try {
    const { scheduledDate, startTime, endTime } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.client.toString() !== req.user._id.toString() &&
      booking.coach.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const existingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      coach: booking.coach,
      scheduledDate,
      startTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    booking.scheduledDate = scheduledDate;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.status = 'rescheduled';

    await booking.save();
    await booking.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'coach', select: 'firstName lastName email' },
      { path: 'session', select: 'title duration' }
    ]);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUpcomingBookings = async (req, res) => {
  try {
    let query = {
      scheduledDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed', 'rescheduled'] }
    };

    if (req.user.role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'coach') {
      query.coach = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('client', 'firstName lastName avatar')
      .populate('coach', 'firstName lastName avatar')
      .populate('session', 'title duration')
      .sort({ scheduledDate: 1 })
      .limit(10);

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
