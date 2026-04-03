// routes/user.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/user/profile ----
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ---- PUT /api/user/profile ----
router.put('/profile', protect, [
  body('age').optional().isInt({ min: 10, max: 120 }),
  body('height').optional().isFloat({ min: 50, max: 300 }),
  body('weight').optional().isFloat({ min: 20, max: 500 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('goal').optional().isIn(['fat_loss', 'muscle_gain', 'maintenance']),
  body('activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const allowedFields = ['name', 'age', 'height', 'weight', 'gender', 'goal', 'activityLevel', 'dailyWaterGoal'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findById(req.user._id);
    Object.assign(user, updates);

    // Recalculate nutrition goals if profile data changed
    user.calculateGoals();
    await user.save();

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ---- GET /api/user/bmi ----
router.get('/bmi', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.height || !user.weight) {
      return res.status(400).json({ message: 'Height and weight required for BMI calculation' });
    }

    const heightM = user.height / 100;
    const bmi = user.weight / (heightM * heightM);

    let category, advice;
    if (bmi < 18.5) {
      category = 'Underweight';
      advice = 'Consider increasing calorie intake and consulting a healthcare provider.';
    } else if (bmi < 25) {
      category = 'Normal weight';
      advice = 'Great! Maintain your healthy lifestyle.';
    } else if (bmi < 30) {
      category = 'Overweight';
      advice = 'Consider a moderate calorie deficit and regular exercise.';
    } else {
      category = 'Obese';
      advice = 'Consult a healthcare provider for a personalized plan.';
    }

    res.json({ bmi: Math.round(bmi * 10) / 10, category, advice });
  } catch (error) {
    res.status(500).json({ message: 'BMI calculation failed' });
  }
});

module.exports = router;
