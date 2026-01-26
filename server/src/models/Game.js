const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🎮',
    },
    category: {
      type: String,
      enum: ['puzzle', 'word', 'trivia', 'memory', 'math'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    timeLimit: {
      type: Number, // in seconds
      default: 300,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', GameSchema);