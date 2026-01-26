const mongoose = require('mongoose');

const GameScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    streak: {
      type: Number,
      default: 0,
    },
    gameData: {
      type: mongoose.Schema.Types.Mixed, // Store game-specific data
      default: {},
    },
  },
  { timestamps: true }
);

// Compound index for leaderboard queries
GameScoreSchema.index({ game: 1, score: -1, createdAt: -1 });
GameScoreSchema.index({ user: 1, game: 1, createdAt: -1 });

module.exports = mongoose.model('GameScore', GameScoreSchema);