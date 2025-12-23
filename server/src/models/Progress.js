const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  completedLessons: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedSessions: [{
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  goals: [{
    title: String,
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    completedAt: Date
  }],
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', progressSchema);
