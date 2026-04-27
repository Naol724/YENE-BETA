const path = require('path');
// Always load .env from this file's directory — not process.cwd() (fixes missing MONGODB_URI when starting from repo root).
require('dotenv').config({ path: path.join(__dirname, '.env') });

/**
 * Google Public DNS by default so Atlas SRV (_mongodb._tcp…) resolves reliably on many Windows setups.
 * Set MONGODB_USE_PUBLIC_DNS=false to use only the system resolver.
 */
if (process.env.MONGODB_USE_PUBLIC_DNS !== 'false') {
  try {
    require('dns').setServers(['8.8.8.8', '8.8.4.4']);
    console.log('[mongo] DNS: 8.8.8.8 / 8.8.4.4 (set MONGODB_USE_PUBLIC_DNS=false for system DNS only)');
  } catch {
    /* ignore */
  }
} else {
  console.log('[mongo] DNS: system default (MONGODB_USE_PUBLIC_DNS=false)');
}

const dns = require('dns');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

/** Last mongoose connect failure (dev-only detail on /api/health). */
let lastMongoConnectError = null;
/** Log long DNS/WARP hint only once per process. */
let mongoEnotfoundWarpHintPrinted = false;

const { validateEnv } = require('./config/validateEnv');
validateEnv();

const { authLimiter, apiLimiter } = require('./middleware/rateLimiters');
const { requireMongo } = require('./middleware/requireMongo');

const app = express();

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const auth = require('./routes/authRoutes');
const houses = require('./routes/houseRoutes');
const inquiries = require('./routes/inquiryRoutes');
const users = require('./routes/userRoutes');
const favorites = require('./routes/favoriteRoutes');
const premium = require('./routes/premiumRoutes');
const admin = require('./routes/adminRoutes');

app.use('/api', apiLimiter);
app.use('/api', requireMongo);
app.use('/api/auth', authLimiter, auth);
app.use('/api/houses', houses);
app.use('/api/inquiries', inquiries);
app.use('/api/users', users);
app.use('/api/favorites', favorites);
app.use('/api/premium', premium);
app.use('/api/admin', admin);

// Basic Route
app.get('/', (req, res) => {
  res.send('YENE BET API is running...');
});

app.get('/api/health', (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  const payload = {
    ok: dbOk,
    port: Number(process.env.PORT) || 5000,
    database: dbOk ? 'connected' : 'disconnected',
    mongoState: mongoose.connection.readyState,
  };
  if (process.env.NODE_ENV !== 'production' && !dbOk && lastMongoConnectError) {
    payload.lastError = lastMongoConnectError;
  }
  res.status(dbOk ? 200 : 503).json(payload);
});

const { resolveMongoUri, hasMongoConfiguration } = require('./utils/resolveMongoUri');

const PORT = process.env.PORT || 5000;
const resolvedMongo = resolveMongoUri();
const mongoUri = resolvedMongo || 'mongodb://127.0.0.1:27017/house_rental';

/** Active URI (may switch to localhost in dev if Atlas SRV/DNS fails). */
let activeMongoUri = mongoUri;
/** After true, we only retry `activeMongoUri` (no more Atlas attempts). */
let devAtlasFallbackToLocalDone = false;
let mongoConnectAttempt = 0;

/** Mongoose/driver errors often nest the real cause (e.g. ENOTFOUND) inside a generic Atlas message. */
function flattenMongoError(err) {
  const out = [];
  const seen = new Set();
  const walk = (e) => {
    if (!e || typeof e !== 'object') return;
    if (seen.has(e)) return;
    seen.add(e);
    if (typeof e.message === 'string' && e.message) out.push(e.message);
    if (Array.isArray(e.errors)) e.errors.forEach(walk);
    if (e.reason) walk(e.reason);
    if (e.cause) walk(e.cause);
  };
  walk(err);
  return out.join(' | ');
}

function mongoHostForLog(uri) {
  try {
    const withoutProto = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const at = withoutProto.indexOf('@');
    const hostPart = at >= 0 ? withoutProto.slice(at + 1) : withoutProto;
    const slash = hostPart.indexOf('/');
    return slash >= 0 ? hostPart.slice(0, slash) : hostPart.split('?')[0] || '?';
  } catch {
    return '(unparsed)';
  }
}

/** Atlas mongodb+srv hostnames often have no A record — probe SRV instead of dns.lookup(host). */
async function probeAtlasResolvable(uri) {
  const host = mongoHostForLog(uri).split(':')[0].split(',')[0].trim();
  if (!host || host === '?' || !uri.includes('mongodb.net')) return { ok: true };
  if (uri.startsWith('mongodb+srv://')) {
    try {
      await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e };
    }
  }
  try {
    await dns.promises.lookup(host, { family: 4 });
    return { ok: true };
  } catch (e) {
    return { ok: false, err: e };
  }
}

if (!hasMongoConfiguration()) {
  console.warn(
    '[warn] No MongoDB config in backend/.env — using mongodb://127.0.0.1:27017/house_rental. Set MONGODB_URI or MONGODB_USER + MONGODB_PASSWORD (Atlas), or run npm run db:up for local Docker.'
  );
} else {
  const mode =
    mongoUri.startsWith('mongodb+srv://') ? 'mongodb+srv (SRV DNS)' : 'mongodb:// (direct TLS)';
  console.log(`[mongo] Connecting (${mode}) — ${mongoHostForLog(mongoUri)}`);
  if (process.env.MONGODB_DISABLE_DEV_FALLBACK === 'true') {
    console.log('[mongo] Dev fallback to local Mongo: disabled (Atlas / cloud URI only until connected)');
  }
}

const User = require('./models/User');
const Inquiry = require('./models/Inquiry');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: frontendOrigin, credentials: true },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role');
    if (!user) return next(new Error('Unauthorized'));
    socket.userId = user._id.toString();
    next();
  } catch (e) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join-inquiry', async (inquiryId, ack) => {
    try {
      if (!inquiryId || typeof inquiryId !== 'string') {
        if (typeof ack === 'function') ack({ ok: false });
        return;
      }
      const inquiry = await Inquiry.findById(inquiryId);
      if (!inquiry) {
        if (typeof ack === 'function') ack({ ok: false });
        return;
      }
      const uid = socket.userId;
      const ownerId = inquiry.owner?.toString?.() ?? String(inquiry.owner);
      const renterId = inquiry.renter?.toString?.() ?? String(inquiry.renter);
      if (uid !== ownerId && uid !== renterId) {
        if (typeof ack === 'function') ack({ ok: false });
        return;
      }
      socket.join(`inquiry:${inquiryId}`);
      if (typeof ack === 'function') ack({ ok: true });
    } catch (e) {
      if (typeof ack === 'function') ack({ ok: false });
    }
  });

  socket.on('leave-inquiry', (inquiryId) => {
    if (inquiryId && typeof inquiryId === 'string') {
      socket.leave(`inquiry:${inquiryId}`);
    }
  });
});

app.set('io', io);

// Listen first so the frontend always has a server to call; MongoDB connects in the background.
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS origin: ${frontendOrigin}`);
  console.log('[socket] Real-time inquiry updates enabled');
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[api] Port ${PORT} is already in use — another API is likely still running (only one process per port).\n` +
        `Fix A — stop the other server: Task Manager → end "Node.js", or PowerShell:\n` +
        `  Get-NetTCPConnection -LocalPort ${PORT} | Select-Object OwningProcess\n` +
        `  Stop-Process -Id <PID> -Force\n` +
        `Fix B — run this API on 5001 instead: npm run api:5001 (from repo root) or npm run dev:5001 inside backend/.\n` +
        `  Then set VITE_API_URL=http://localhost:5001/api in frontend/.env and restart Vite.\n`
    );
  } else {
    console.error('[api] HTTP server error:', err.message);
  }
  process.exit(1);
});

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/house_rental';

function connectMongo() {
  const uri = activeMongoUri;
  const atlasOptions =
    uri.includes('mongodb+srv') || uri.includes('mongodb.net')
      ? { retryWrites: true, w: 'majority' }
      : {};
  mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 30000,
      /** Prefer IPv4 — helps on some Windows networks where SRV/IPv6 fails. */
      family: 4,
      ...atlasOptions,
    })
    .then(() => {
      lastMongoConnectError = null;
      mongoConnectAttempt = 0;
      console.log(`MongoDB connected (${mongoHostForLog(uri)})`);
    })
    .catch(async (err) => {
      const flat = flattenMongoError(err);
      let msg = flat || err.message || String(err);
      const isSrvFail = /querySrv|_mongodb\._tcp|SRV/i.test(msg);
      let isDnsFail =
        isSrvFail ||
        /ENOTFOUND|getaddrinfo|EAI_AGAIN|NXDOMAIN/i.test(msg) ||
        /Could not resolve/i.test(msg);

      /** Driver often surfaces a generic Atlas message while the real failure is DNS — verify explicitly. */
      if (!isDnsFail && uri.includes('mongodb.net') && process.env.NODE_ENV !== 'production') {
        const probe = await probeAtlasResolvable(uri);
        if (!probe.ok && probe.err) {
          isDnsFail = true;
          const bit = probe.err.message || String(probe.err);
          msg = `${msg} | DNS probe: ${bit}`;
        }
      }
      lastMongoConnectError = msg;

      // Dev-only: Atlas DNS/SRV broken → local Mongo once (Docker: npm run db:up).
      if (
        process.env.NODE_ENV !== 'production' &&
        process.env.MONGODB_DISABLE_DEV_FALLBACK !== 'true' &&
        !devAtlasFallbackToLocalDone &&
        uri.includes('mongodb.net') &&
        isDnsFail
      ) {
        devAtlasFallbackToLocalDone = true;
        activeMongoUri = LOCAL_FALLBACK_URI;
        console.warn(
          '[mongo] Atlas DNS/network unreachable — switching to local MongoDB (dev auto-fallback).\n' +
            '[mongo] Start local DB: cd RenatalWPA && npm run db:up\n' +
            '[mongo] To use Atlas: pause VPN/WARP or exclude *.mongodb.net; or fix system DNS.\n' +
            '[mongo] To stay on Atlas only (no fallback): MONGODB_DISABLE_DEV_FALLBACK=true in backend/.env'
        );
        setTimeout(connectMongo, 200);
        return;
      }

      mongoConnectAttempt += 1;
      const loud = mongoConnectAttempt <= 2 || mongoConnectAttempt % 12 === 0;
      if (loud) {
        console.error('MongoDB connection failed:', msg);
        if (isSrvFail) {
          console.error(
            '[mongo] SRV lookup failed (_mongodb._tcp…). Fix outbound DNS (firewall), try MONGODB_USE_PUBLIC_DNS=true, or paste the full connection string from Atlas → Connect as MONGODB_URI.'
          );
        } else if (/ENOTFOUND|getaddrinfo|EAI_AGAIN/i.test(msg)) {
          console.error(
            '[mongo] DNS could not resolve the Atlas hostname. Try: nslookup ' +
              mongoHostForLog(uri).split(':')[0]
          );
          if (!mongoEnotfoundWarpHintPrinted) {
            mongoEnotfoundWarpHintPrinted = true;
            console.error(
              '[mongo] Common fix — Cloudflare WARP breaks MongoDB Atlas DNS. If nslookup shows ' +
                '"connectivity-check.warp-svc" or Address 127.0.2.x, pause WARP while developing, or use WARP split tunnels / exclude *.mongodb.net. ' +
                'Alternative: local Mongo — cd RenatalWPA && npm run db:up (this dev server will auto-fallback if MONGODB_DISABLE_DEV_FALLBACK is not set).'
            );
          }
        } else if (
          /whitelist|IP that isn|not allowed|authentication failed|bad auth/i.test(msg) &&
          !isDnsFail
        ) {
          console.error(
            '[mongo] Atlas: Network Access → allow your IP (0.0.0.0/0 for dev). Confirm cluster host in backend/.env.'
          );
        }
        if (mongoConnectAttempt % 12 === 0 && uri.startsWith('mongodb://127.0.0.1')) {
          console.error('[mongo] Local Mongo not reachable — is Docker running? npm run db:up from RenatalWPA');
        }
      }
      if (loud) {
        console.error('Retrying MongoDB in 5s…');
      }
      setTimeout(connectMongo, 5000);
    });
}

mongoose.connection.on('disconnected', () => {
  console.warn('[mongo] Mongoose disconnected');
});
mongoose.connection.on('error', (err) => {
  lastMongoConnectError = err.message || String(err);
  console.error('[mongo] Mongoose connection error:', lastMongoConnectError);
});

connectMongo();
