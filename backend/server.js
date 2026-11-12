const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const { connectDB, disconnectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const sanitizeInput = require('./middleware/sanitizeMiddleware');
const { getSitemapXml, getRobotsTxt } = require('./controllers/statsController');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authorRoutes = require('./routes/authorRoutes');
const tagRoutes = require('./routes/tagRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const statsRoutes = require('./routes/statsRoutes');
const settingRoutes = require('./routes/settingRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS Setup
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  ...configuredOrigins
];

// Match localhost origins on dev ports (5173, 5174, 5175, etc.)
const isAllowedDevOrigin = (origin) => {
  return /^http:\/\/(localhost|127\.0\.0\.1):(5173|5174|5175|3000|4173)$/.test(origin);
};

// Match Vercel deployment domains
const isAllowedVercelOrigin = (origin) => {
  if (!origin) return false;
  return configuredOrigins.some((configured) => {
    if (configured === origin) return true;
    try {
      const parsedConfigured = new URL(configured);
      const parsedOrigin = new URL(origin);
      if (parsedConfigured.hostname.endsWith('.vercel.app') && parsedOrigin.hostname.endsWith('.vercel.app')) {
        return true;
      }
    } catch {}
    return false;
  });
};

app.use(
  cors({
    origin: function (origin, callback) {
      const cleanOrigin = origin ? origin.replace(/\/+$/, '') : null;
      if (!cleanOrigin || allowedOrigins.includes(cleanOrigin) || isAllowedDevOrigin(cleanOrigin) || isAllowedVercelOrigin(cleanOrigin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not permitted by CORS policy.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging in dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Injection & Property Pollution Protection
app.use(sanitizeInput);

// Static Files (for locally uploaded media)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root SEO Crawlers
app.get('/sitemap.xml', getSitemapXml);
app.get('/robots.txt', getRobotsTxt);

// Rate Limiters for Sensitive Operations
if (process.env.NODE_ENV !== 'test') {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
  });
  app.use('/api/auth/login', authLimiter);

  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
      success: false,
      message: 'Submission limit reached. Please wait before submitting another inquiry.'
    }
  });
  app.use('/api/contact', contactLimiter);

  const subscribeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
      success: false,
      message: 'Subscription request limit reached. Please try again later.'
    }
  });
  app.use('/api/newsletter/subscribe', subscribeLimiter);
}

// Health Check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'online' : 'degraded',
    database: {
      status: dbStatus,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    },
    timestamp: new Date().toISOString(),
    service: 'TechBlog API v1.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api', publicRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist on this server.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB & Auto-seed initialization promise
const readyPromise = (async () => {
  await connectDB();
  const Category = require('./models/Category');
  const count = await Category.countDocuments();
  if (count === 0) {
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_AUTO_SEED) {
      console.log('ℹ️ Production mode: Database is uninitialized. Automated seeding skipped to protect production data.');
    } else {
      console.log('📦 Database is uninitialized. Running automated initial seed...');
      const seedDatabase = require('./utils/seed');
      await seedDatabase(false);
    }
  }
})();

if (process.env.NODE_ENV !== 'test') {
  readyPromise
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`🚀 TechBlog Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
        console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
      });

      const handleGracefulShutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
        server.close(async () => {
          console.log('📡 HTTP server closed to new requests.');
          await disconnectDB();
          process.exit(0);
        });
      };

      process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
      process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    })
    .catch((err) => {
      console.error('❌ Failed to initialize database connection. Server startup aborted:', err.message);
      process.exit(1);
    });
}

app.readyPromise = readyPromise;
module.exports = app;
