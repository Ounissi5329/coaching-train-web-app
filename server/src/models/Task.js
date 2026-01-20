const mongoose = require('mongoose');

const TaskStatusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  lessonId: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  scope: { type: String, enum: ['course', 'lesson', 'daily'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  statusByUser: [TaskStatusSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
