const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Session title is required']
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['one-on-one', 'group'],
    default: 'one-on-one'
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  maxParticipants: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
