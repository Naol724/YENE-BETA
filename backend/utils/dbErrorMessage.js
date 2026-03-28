/**
 * Maps Mongoose/Mongo errors to safe, user-facing messages (no raw stack/ops).
 */
function dbErrorMessage(err) {
  if (!err) return 'Something went wrong. Please try again.';
  const msg = err.message || String(err);
  const name = err.name || '';

  if (
    msg.includes('whitelist') ||
    msg.includes('IP that isn') ||
    msg.includes('Could not connect to any servers in your MongoDB Atlas')
  ) {
    return 'MongoDB Atlas blocked this connection. In Atlas: Network Access → Add IP Address (your current IP, or 0.0.0.0/0 for local dev), then restart the API.';
  }

  if (msg.includes('buffering timed out')) {
    return 'The database is not available right now. Check that MongoDB is running and MONGODB_URI is correct (Atlas: allow your IP in Network Access).';
  }
  if (
    name === 'MongoServerSelectionError' ||
    name === 'MongooseServerSelectionError'
  ) {
    return 'Could not connect to the database. If you use Atlas, add your IP under Network Access and confirm MONGODB_URI in backend/.env.';
  }
  if (name === 'MongoNetworkError') {
    return 'Network error while talking to the database.';
  }
  return msg;
}

module.exports = { dbErrorMessage };
