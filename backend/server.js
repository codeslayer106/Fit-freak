// ============================================
// FitAI - Main Server Entry Point
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ---- Middleware ----
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Allow large payloads for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Routes ----
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/user',     require('./routes/user'));
app.use('/api/food',     require('./routes/food'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/water',    require('./routes/water'));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FitAI API is running 🚀' });
});

// ---- 404 Handler ----
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// ---- Connect to MongoDB & Start Server ----
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 FitAI server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
