const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
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
    enum: ['one-on-one', 'group', 'course-session'],
    default: 'one-on-one'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  maxParticipants: {
    type: Number,
    default: 1
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  tasks: [{
    title: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    dueDate: Date
  }],
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
