const mongoose = require('mongoose');
const { getDbUnavailableMessage } = require('../utils/dbUnavailableMessage');

/**
 * Returns 503 until mongoose is connected. Skips GET /api/health so you can poll status.
 */
function requireMongo(req, res, next) {
  const path = req.path || '';
  if (path === '/health' || path.endsWith('/health')) {
    return next();
  }
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return res.status(503).json({
    success: false,
    message: getDbUnavailableMessage(),
  });
}

module.exports = { requireMongo, getDbUnavailableMessage };
