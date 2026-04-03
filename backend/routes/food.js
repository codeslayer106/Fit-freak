// routes/food.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const FoodLog = require('../models/FoodLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: get today's date string
const getDateString = (date = new Date()) => date.toISOString().split('T')[0];

// ---- GET /api/food/log?date=YYYY-MM-DD ----
router.get('/log', protect, async (req, res) => {
  try {
    const date = req.query.date || getDateString();
    let log = await FoodLog.findOne({ user: req.user._id, date });

    if (!log) {
      // Return empty log structure
      return res.json({
        date,
        items: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch food log' });
  }
});

// ---- POST /api/food/log ---- (add food item)
router.post('/log', protect, [
  body('name').trim().notEmpty().withMessage('Food name is required'),
  body('calories').isFloat({ min: 0 }).withMessage('Calories must be a positive number'),
  body('mealType').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const date = req.body.date || getDateString();
    const foodItem = {
      name:       req.body.name,
      calories:   Math.round(req.body.calories),
      protein:    Math.round(req.body.protein  || 0),
      carbs:      Math.round(req.body.carbs    || 0),
      fat:        Math.round(req.body.fat      || 0),
      quantity:   req.body.quantity || 1,
      unit:       req.body.unit || 'serving',
      mealType:   req.body.mealType || 'snack',
      aiDetected: req.body.aiDetected || false,
      imageUrl:   req.body.imageUrl || '',
    };

    // Find or create today's log
    let log = await FoodLog.findOne({ user: req.user._id, date });
    if (!log) {
      log = new FoodLog({ user: req.user._id, date, items: [] });
    }

    log.items.push(foodItem);
    await log.save();

    res.status(201).json({ log, message: 'Food logged successfully' });
  } catch (error) {
    console.error('Add food error:', error);
    res.status(500).json({ message: 'Failed to log food' });
  }
});

// ---- DELETE /api/food/log/:itemId ----
router.delete('/log/:itemId', protect, async (req, res) => {
  try {
    const date = req.query.date || getDateString();
    const log = await FoodLog.findOne({ user: req.user._id, date });

    if (!log) return res.status(404).json({ message: 'Log not found' });

    log.items = log.items.filter(item => item._id.toString() !== req.params.itemId);
    await log.save();

    res.json({ log, message: 'Food item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove food item' });
  }
});

// ---- GET /api/food/analytics?days=7 ---- (weekly/monthly analytics)
router.get('/analytics', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    // Get all dates in range
    const dateStrings = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateStrings.push(getDateString(new Date(d)));
    }

    const logs = await FoodLog.find({
      user: req.user._id,
      date: { $in: dateStrings },
    });

    // Build analytics array with all dates (fill missing with 0)
    const analytics = dateStrings.map(date => {
      const log = logs.find(l => l.date === date);
      return {
        date,
        calories: log?.totalCalories || 0,
        protein:  log?.totalProtein  || 0,
        carbs:    log?.totalCarbs    || 0,
        fat:      log?.totalFat      || 0,
      };
    });

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

module.exports = router;
