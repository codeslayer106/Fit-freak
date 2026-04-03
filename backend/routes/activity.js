// routes/activity.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// MET (Metabolic Equivalent) values for calorie estimation
const MET_VALUES = {
  running:      8.0,
  walking:      3.5,
  cycling:      6.0,
  swimming:     7.0,
  weightlifting: 4.0,
  yoga:         2.5,
  hiit:         8.5,
  basketball:   6.5,
  soccer:       7.0,
  dancing:      4.5,
  other:        4.0,
};

// ---- GET /api/activity?date=YYYY-MM-DD ----
router.get('/', protect, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const activities = await ActivityLog.find({ user: req.user._id, date }).sort({ loggedAt: -1 });

    const totalBurned = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
    res.json({ activities, totalBurned });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

// ---- POST /api/activity ----
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Activity name is required'),
  body('duration').isFloat({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('category').optional().isIn(['cardio', 'strength', 'flexibility', 'sports', 'other']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, duration, category, notes, date } = req.body;
    const userWeight = req.user.weight || 70; // default 70kg

    // Estimate calories burned: MET × weight(kg) × duration(hours)
    const met = MET_VALUES[name.toLowerCase()] || MET_VALUES.other;
    const caloriesBurned = Math.round(met * userWeight * (duration / 60));

    const activity = await ActivityLog.create({
      user: req.user._id,
      date: date || new Date().toISOString().split('T')[0],
      name,
      category: category || 'other',
      duration,
      caloriesBurned: req.body.caloriesBurned || caloriesBurned,
      notes,
    });

    res.status(201).json({ activity, message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ message: 'Failed to log activity' });
  }
});

// ---- DELETE /api/activity/:id ----
router.delete('/:id', protect, async (req, res) => {
  try {
    const activity = await ActivityLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json({ message: 'Activity removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove activity' });
  }
});

module.exports = router;
