// models/FoodLog.js
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  calories: { type: Number, required: true, min: 0 },
  protein:  { type: Number, default: 0, min: 0 },
  carbs:    { type: Number, default: 0, min: 0 },
  fat:      { type: Number, default: 0, min: 0 },
  quantity: { type: Number, default: 1 },
  unit:     { type: String, default: 'serving' },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], default: 'snack' },
  aiDetected: { type: Boolean, default: false },
  imageUrl:   { type: String },
  addedAt:    { type: Date, default: Date.now },
});

const foodLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD format for easy querying
    required: true,
  },
  items: [foodItemSchema],

  // Daily totals (computed and cached)
  totalCalories: { type: Number, default: 0 },
  totalProtein:  { type: Number, default: 0 },
  totalCarbs:    { type: Number, default: 0 },
  totalFat:      { type: Number, default: 0 },
}, { timestamps: true });

// Compound index for fast user+date lookups
foodLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Recompute totals before saving
foodLogSchema.pre('save', function(next) {
  this.totalCalories = this.items.reduce((sum, i) => sum + (i.calories || 0), 0);
  this.totalProtein  = this.items.reduce((sum, i) => sum + (i.protein  || 0), 0);
  this.totalCarbs    = this.items.reduce((sum, i) => sum + (i.carbs    || 0), 0);
  this.totalFat      = this.items.reduce((sum, i) => sum + (i.fat      || 0), 0);
  next();
});

module.exports = mongoose.model('FoodLog', foodLogSchema);
