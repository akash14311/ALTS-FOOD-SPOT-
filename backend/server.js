const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startOrderScheduler } = require('./utils/scheduler');
const Restaurant = require('./models/Restaurant');
const seedDatabase = require('./seed/seed');

// Route imports
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const foodRoutes = require('./routes/foodRoutes');
const searchRoutes = require('./routes/searchRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend origin
app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Express JSON body parser & logger
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// System Health Check
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    brand: 'ALTS FOOD spot',
    tagline: 'Your cravings. Our mission.',
    time: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    dbHost: mongoose.connection.host,
    dbPort: mongoose.connection.port,
    dbName: mongoose.connection.name,
    restCount: await require('./models/Restaurant').countDocuments(),
    foodCount: await require('./models/Food').countDocuments(),
    mongoURI: process.env.MONGODB_URI,
    readyState: mongoose.connection.readyState,
  });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/admin/seed-now', async (req, res) => {
  try {
    await seedDatabase(false);
    const count = await Restaurant.countDocuments();
    const foodCount = await require('./models/Food').countDocuments();
    res.json({ success: true, message: 'Seeded successfully', restCount: count, foodCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server after connecting to database
const startServer = async () => {
  const db = await connectDB();

  if (db) {
    // If database is empty, auto-seed for a seamless demo
    const restCount = await Restaurant.countDocuments();
    if (restCount === 0) {
      console.log('📦 Database is empty. Auto-seeding initial restaurants and dishes...');
      try {
        await seedDatabase(false);
      } catch (err) {
        console.error('Auto-seed warning:', err.message);
      }
    }
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ALTS FOOD spot REST API Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);

    // Start background order progression simulator
    if (db) {
      startOrderScheduler();
    }
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
