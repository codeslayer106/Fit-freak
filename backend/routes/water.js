// routes/water.js
const express = require('express');
const WaterLog = require('../models/WaterLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ---- GET /api/water?date=YYYY-MM-DD ----
router.get('/', protect, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const log = await WaterLog.findOne({ user: req.user._id, date });

    res.json({
      date,
      totalAmount: log?.totalAmount || 0,
      entries:     log?.entries     || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch water log' });
  }
});

// ---- POST /api/water ---- (add water entry)
router.post('/', protect, async (req, res) => {
  try {
    const { amount, date } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    let log = await WaterLog.findOne({ user: req.user._id, date: logDate });
    if (!log) {
      log = new WaterLog({ user: req.user._id, date: logDate, entries: [] });
    }

    log.entries.push({ amount });
    log.totalAmount = log.entries.reduce((sum, e) => sum + e.amount, 0);
    await log.save();

    res.json({ log, message: 'Water logged successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log water' });
  }
});

module.exports = router;
