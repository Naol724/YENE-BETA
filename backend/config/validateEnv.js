/**
 * Fail fast in production when JWT or critical config is missing or unsafe.
 * In development, warn only so local demo .env.example values still work.
 */

const MIN_JWT_SECRET_LENGTH = 32;

/** Values copied from .env.example must never be used in production. */
const FORBIDDEN_JWT_SECRETS = new Set([
  'your_super_secret_jwt_key_change_in_production_2024',
  'your_refresh_secret_change_in_production_2024',
]);

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.JWT_SECRET;

  if (isProd) {
    if (!secret || typeof secret !== 'string' || secret.trim().length < MIN_JWT_SECRET_LENGTH) {
      console.error(
        `[env] FATAL: JWT_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters in production.`
      );
      process.exit(1);
    }
    if (FORBIDDEN_JWT_SECRETS.has(secret.trim())) {
      console.error(
        '[env] FATAL: JWT_SECRET must not use the example placeholder from .env.example in production.'
      );
      process.exit(1);
    }
    if (!process.env.MONGODB_URI || !String(process.env.MONGODB_URI).trim()) {
      console.error('[env] FATAL: MONGODB_URI is required in production.');
      process.exit(1);
    }
    if (!process.env.FRONTEND_URL || !String(process.env.FRONTEND_URL).trim()) {
      console.error('[env] FATAL: FRONTEND_URL is required in production.');
      process.exit(1);
    }
    return;
  }

  if (
    !secret ||
    typeof secret !== 'string' ||
    secret.trim().length < MIN_JWT_SECRET_LENGTH ||
    FORBIDDEN_JWT_SECRETS.has(secret.trim())
  ) {
    console.warn(
      '[env] Warning: JWT_SECRET is missing, shorter than 32 characters, or matches .env.example placeholders. Set a strong secret before production.'
    );
  }
}

module.exports = { validateEnv };
