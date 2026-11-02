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

/** Common misnamed keys people paste into Render instead of MONGODB_URI. */
const MONGO_URI_ALIASES = ['MONGO_URI', 'MONGODB_URL', 'MONGO_URL', 'DATABASE_URL', 'DB_URI'];

function isSet(name) {
  const v = process.env[name];
  return Boolean(v && String(v).trim());
}

/** Map common alias env names onto MONGODB_URI before the rest of the app reads it. */
function normalizeMongoEnvAliases() {
  if (isSet('MONGODB_URI')) return;
  for (const alias of MONGO_URI_ALIASES) {
    if (isSet(alias)) {
      process.env.MONGODB_URI = String(process.env[alias]).trim();
      console.warn(`[env] Using ${alias} as MONGODB_URI (rename it to MONGODB_URI on Render when you can).`);
      return;
    }
  }
}

function logProdEnvChecklist() {
  const rows = [
    ['NODE_ENV', isSet('NODE_ENV')],
    ['MONGODB_URI', isSet('MONGODB_URI')],
    ['MONGODB_USER', isSet('MONGODB_USER')],
    ['MONGODB_PASSWORD', isSet('MONGODB_PASSWORD')],
    ['JWT_SECRET', isSet('JWT_SECRET')],
    ['FRONTEND_URL', isSet('FRONTEND_URL')],
    ['API_BASE_URL', isSet('API_BASE_URL')],
  ];
  console.log('[env] Production checklist (names only, values hidden):');
  for (const [name, ok] of rows) {
    console.log(`[env]   ${ok ? 'OK ' : 'MISSING'}  ${name}`);
  }
}

function validateEnv() {
  normalizeMongoEnvAliases();

  const isProd = process.env.NODE_ENV === 'production';
  const secret = process.env.JWT_SECRET;

  if (isProd) {
    logProdEnvChecklist();

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
    const hasMongoUri = isSet('MONGODB_URI');
    const hasUserPass = isSet('MONGODB_USER') && isSet('MONGODB_PASSWORD');
    if (!hasMongoUri && !hasUserPass) {
      console.error('[env] FATAL: MongoDB is not configured on this host.');
      console.error('[env] On Render → your API service → Environment → Add Environment Variable:');
      console.error('[env]   Key:   MONGODB_URI');
      console.error(
        '[env]   Value: mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/house_rental?retryWrites=true&w=majority'
      );
      console.error('[env] Then click Save Changes (Render will redeploy). Local backend/.env is NOT uploaded.');
      process.exit(1);
    }
    if (!isSet('FRONTEND_URL')) {
      console.error('[env] FATAL: FRONTEND_URL is required in production (your Vercel URL, no trailing slash).');
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

module.exports = { validateEnv, normalizeMongoEnvAliases };
