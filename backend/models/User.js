// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false, // Don't return password by default
  },
  googleId: { type: String },
  avatar: { type: String, default: '' },

  // ---- Profile ----
  age:    { type: Number, min: 10, max: 120 },
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  gender: { type: String, enum: ['male', 'female', 'other'] },
  goal:   { type: String, enum: ['fat_loss', 'muscle_gain', 'maintenance'], default: 'maintenance' },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate',
  },

  // ---- Calculated Goals ----
  dailyCalorieGoal: { type: Number, default: 2000 },
  dailyProteinGoal: { type: Number, default: 150 },
  dailyCarbGoal:    { type: Number, default: 250 },
  dailyFatGoal:     { type: Number, default: 65 },
  dailyWaterGoal:   { type: Number, default: 2500 }, // ml

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate daily calorie goal using Mifflin-St Jeor equation
userSchema.methods.calculateGoals = function() {
  if (!this.age || !this.height || !this.weight || !this.gender) return;

  let bmr;
  if (this.gender === 'male') {
    bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
  } else {
    bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[this.activityLevel] || 1.55);

  const goalAdjustments = {
    fat_loss:     -500,
    muscle_gain:  +300,
    maintenance:  0,
  };

  this.dailyCalorieGoal = Math.round(tdee + (goalAdjustments[this.goal] || 0));
  this.dailyProteinGoal = Math.round(this.weight * 2.0); // 2g per kg
  this.dailyCarbGoal    = Math.round((this.dailyCalorieGoal * 0.45) / 4);
  this.dailyFatGoal     = Math.round((this.dailyCalorieGoal * 0.25) / 9);
};

module.exports = mongoose.model('User', userSchema);
