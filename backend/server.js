const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authorRoutes = require('./routes/authorRoutes');
const tagRoutes = require('./routes/tagRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const statsRoutes = require('./routes/statsRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS Setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  process.env.CLIENT_URL
].filter(Boolean);

// Match localhost origins on dev ports (5173, 5174, 5175, etc.)
const isAllowedDevOrigin = (origin) => {
  return /^http:\/\/(localhost|127\.0\.0\.1):(5173|5174|5175|3000|4173)$/.test(origin);
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
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

// Static Files (for locally uploaded media)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter for Authentication (disabled or lenient during test)
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
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
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
  readyPromise.then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 TechBlog Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
      console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    });
  });
}

app.readyPromise = readyPromise;
module.exports = app;
