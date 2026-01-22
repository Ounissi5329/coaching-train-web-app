const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'countdown_timer'
  },
  value: {
    eventName: {
      type: String,
      default: 'Spring Kickoff Event'
    },
    targetDate: {
      type: Date,
      default: new Date('2026-02-14T10:00:00')
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);


