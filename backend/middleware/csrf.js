const csrf = require('csurf');
const { v4: uuidv4 } = require('uuid');

// CSRF token generation and validation middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Generate CSRF token for frontend
exports.generateCsrfToken = (req, res, next) => {
  // Skip CSRF for API endpoints that don't need it (GET requests, auth endpoints)
  const skipPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/health'
  ];
  
  const isApiRequest = req.path.startsWith('/api/');
  const shouldSkip = skipPaths.some(path => req.path.startsWith(path)) || req.method === 'GET';
  
  if (!isApiRequest || shouldSkip) {
    return next();
  }
  
  // Generate CSRF token
  res.locals.csrfToken = req.csrfToken();
  next();
};

// CSRF error handler
exports.csrfErrorHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  console.warn('CSRF token validation failed:', {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent')
  });
  
  res.status(403).json({
    success: false,
    message: 'Invalid CSRF token. Please refresh the page and try again.'
  });
};

// Get CSRF token endpoint (for frontend to retrieve token)
exports.getCsrfToken = (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  });
};

module.exports = {
  csrfProtection,
  generateCsrfToken,
  csrfErrorHandler,
  getCsrfToken
};