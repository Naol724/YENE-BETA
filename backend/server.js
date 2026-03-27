require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route files
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const houseRoutes = require('./src/routes/houses');
const inquiryRoutes = require('./src/routes/inquiries');
const favoriteRoutes = require('./src/routes/favorites');
const paymentRoutes = require('./src/routes/payments');
const adminRoutes = require('./src/routes/admin');

// Connect DB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS — allow admin dashboard and mobile origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5174').split(',');
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'House Rental API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/houses', houseRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1', paymentRoutes);   // payment routes include /premium/* and /payment/*
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` } });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📖 API base URL: http://localhost:${PORT}/api/v1`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/v1/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
});

module.exports = app;
