/**
 * Resolves MongoDB connection string from env.
 * Priority: MONGODB_URI (full string) → MONGODB_USER + MONGODB_PASSWORD + cluster → empty (caller may default to local).
 *
 * For Atlas user+password, default is **mongodb+srv://** (uses SRV DNS — the hostname cluster0.*.mongodb.net
 * usually has no A record, only _mongodb._tcp SRV). Set MONGODB_USE_SRV=false only if you use a full
 * mongodb://… URI with explicit shard hostnames from Atlas (or a host that resolves with A/AAAA).
 */
function resolveMongoUri() {
  const explicit = process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim();
  if (explicit) return explicit;

  const user = process.env.MONGODB_USER && String(process.env.MONGODB_USER).trim();
  const pass = process.env.MONGODB_PASSWORD && String(process.env.MONGODB_PASSWORD).trim();
  if (!user || !pass) return '';

  const cluster =
    (process.env.MONGODB_CLUSTER_HOST && String(process.env.MONGODB_CLUSTER_HOST).trim()) ||
    'cluster0.k5hqovv.mongodb.net';
  const db =
    (process.env.MONGODB_DB_NAME && String(process.env.MONGODB_DB_NAME).trim()) || 'house_rental';
  const appName =
    (process.env.MONGODB_APP_NAME && String(process.env.MONGODB_APP_NAME).trim()) || 'Cluster0';

  const useSrv = process.env.MONGODB_USE_SRV !== 'false';
  if (useSrv) {
    return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${cluster}/${db}?appName=${encodeURIComponent(appName)}`;
  }

  const port = (process.env.MONGODB_CLUSTER_PORT && String(process.env.MONGODB_CLUSTER_PORT).trim()) || '27017';
  const qs = new URLSearchParams({
    tls: 'true',
    authSource: 'admin',
    retryWrites: 'true',
    w: 'majority',
    appName,
  });
  return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${cluster}:${port}/${db}?${qs.toString()}`;
}

function hasMongoConfiguration() {
  const uri = process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim();
  if (uri) return true;
  const user = process.env.MONGODB_USER && String(process.env.MONGODB_USER).trim();
  const pass = process.env.MONGODB_PASSWORD && String(process.env.MONGODB_PASSWORD).trim();
  return Boolean(user && pass);
}

module.exports = { resolveMongoUri, hasMongoConfiguration };
