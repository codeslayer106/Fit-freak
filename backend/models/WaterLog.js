// models/WaterLog.js
const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date:        { type: String, required: true }, // YYYY-MM-DD
  totalAmount: { type: Number, default: 0 },     // ml
  entries: [{
    amount:   { type: Number, required: true }, // ml
    loggedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

waterLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WaterLog', waterLogSchema);
