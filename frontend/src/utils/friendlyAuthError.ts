/** Rewrites raw Mongoose/DB errors for signup/login UI. */
export function friendlyAuthError(message: string | undefined | null): string {
  if (message == null || message === '') {
    return 'Something went wrong. Try again.';
  }
  const m = String(message);
  if (
    m.includes('whitelist') ||
    m.includes('IP that isn') ||
    m.includes('Could not connect to any servers in your MongoDB Atlas')
  ) {
    return 'MongoDB Atlas is blocking your PC. In Atlas open Network Access, add your current IP (or 0.0.0.0/0 for dev), wait a minute, then restart the API and try again.';
  }
  if (
    m.includes('buffering timed out') ||
    (m.includes('Operation `') && m.includes('buffering'))
  ) {
    return 'Database was not ready. Start the API (npm run api), check MONGODB_URI in backend/.env, and in Atlas whitelist your IP under Network Access.';
  }
  return m;
}
