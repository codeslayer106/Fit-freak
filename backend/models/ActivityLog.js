// models/ActivityLog.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date:     { type: String, required: true }, // YYYY-MM-DD
  name:     { type: String, required: true },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
    default: 'other',
  },
  duration:       { type: Number, required: true }, // minutes
  caloriesBurned: { type: Number, required: true },
  notes:          { type: String },
  loggedAt:       { type: Date, default: Date.now },
}, { timestamps: true });

activitySchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('ActivityLog', activitySchema);
