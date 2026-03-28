const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'SERVER_ERROR';

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        code = 'USER_002';
        statusCode = 409;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(e => e.message).join(', ');
        code = 'VALIDATION_001';
        statusCode = 422;
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        code = 'AUTH_004';
        statusCode = 401;
    }

    // ObjectId cast error
    if (err.name === 'CastError') {
        message = 'Resource not found';
        code = 'NOT_FOUND';
        statusCode = 404;
    }

    res.status(statusCode).json({
        success: false,
        error: { code, message }
    });
};

module.exports = errorHandler;
