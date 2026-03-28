const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
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
const admin = require('./routes/adminRoutes');

app.use('/api/auth', auth);
app.use('/api/houses', houses);
app.use('/api/inquiries', inquiries);
app.use('/api/users', users);
app.use('/api/favorites', favorites);
app.use('/api/premium', premium);
app.use('/api/admin', admin);

// Basic Route
app.get('/', (req, res) => {
  res.send('House Rental API is running...');
});

// Database Connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
