/**
 * User-facing hint when MongoDB is not connected (requireMongo 503).
 */
function getDbUnavailableMessage() {
  const raw = process.env.MONGODB_URI || '';
  const uri = String(raw).toLowerCase();
  const isLocal =
    uri.includes('127.0.0.1') ||
    uri.includes('localhost') ||
    (!uri.includes('mongodb+srv') && uri.startsWith('mongodb://'));

  if (isLocal && !uri.includes('mongodb+srv')) {
    return (
      'Database is not running on your computer. From the project folder (RenatalWPA) run: npm run db:up ' +
      '(Docker must be installed). Then restart the API (npm run api). ' +
      'Alternatively use MongoDB Atlas: set MONGODB_URI in backend/.env and allow your IP in Atlas → Network Access.'
    );
  }

  return (
    'Database is not connected. If you use MongoDB Atlas: open Network Access → Add IP Address ' +
    '(your current IP, or 0.0.0.0/0 for local development). Confirm user/password in MONGODB_URI in backend/.env. ' +
    'For local development without Atlas, use MONGODB_URI=mongodb://127.0.0.1:27017/house_rental and run npm run db:up. ' +
    'Check http://localhost:5000/api/health — when database is connected, try again.'
  );
}

module.exports = { getDbUnavailableMessage };
