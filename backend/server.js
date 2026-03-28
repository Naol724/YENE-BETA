const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const auth = require('./routes/authRoutes');
const houses = require('./routes/houseRoutes');
const inquiries = require('./routes/inquiryRoutes');
const users = require('./routes/userRoutes');
const favorites = require('./routes/favoriteRoutes');
const premium = require('./routes/premiumRoutes');

app.use('/api/auth', auth);
app.use('/api/houses', houses);
app.use('/api/inquiries', inquiries);
app.use('/api/users', users);
app.use('/api/favorites', favorites);
app.use('/api/premium', premium);

// Basic Route
app.get('/', (req, res) => {
  res.send('House Rental API is running...');
});

app.get('/api/health', (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    port: Number(process.env.PORT) || 5000,
    database: dbOk ? 'connected' : 'disconnected',
    mongoState: mongoose.connection.readyState,
  });
});

const PORT = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/house_rental';
if (!process.env.MONGODB_URI) {
  console.warn(
    '[warn] MONGODB_URI not set — using default local URI. Copy backend/.env.example to backend/.env for your own database.'
  );
}

async function start() {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error(
      'Set MONGODB_URI in backend/.env. For Atlas: Database → Connect → URI, and Network Access → add your IP (or 0.0.0.0/0 for dev).'
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log(`CORS origin: ${frontendOrigin}`);
  });
}

start();
