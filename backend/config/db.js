const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dns = require('dns');

// Configure reliable DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Graceful fallback if system restrictions prevent setting custom DNS servers
}

let memoryServer = null;

/**
 * Safely masks MongoDB connection URI to prevent credential leakage in logs
 */
const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    return uri.replace(/\/\/([^:]+):(.*)@([^@\/]+)/, '//$1:****@$3');
  } catch {
    return 'mongodb+srv://[credentials-hidden]';
  }
};

/**
 * Connect to MongoDB Atlas (TechBlogCluster - techblog_db)
 */
const connectDB = async () => {
  // 1. Prevent duplicate connections
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return mongoose.connection;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/^["']|["']$/g, '').trim() : '';

  // 2. Production Strictness: Never silently fall back in production
  if (isProduction && !uri) {
    const prodError = new Error(
      'CRITICAL DATABASE CONFIGURATION ERROR: MONGODB_URI is required in production environment. Silently falling back to an in-memory database in production is strictly prohibited.'
    );
    console.error(`❌ ${prodError.message}`);
    throw prodError;
  }

  // 3. Development Fallback with Local Disk Persistence ONLY if MONGODB_URI is completely missing
  if (!uri) {
    if (!memoryServer) {
      console.warn('⚠️ [DEV NOTICE] No MONGODB_URI found in backend/.env. Initializing local persistent database storage...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '../data/mongodb');
      fs.mkdirSync(dbPath, { recursive: true });
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger'
        }
      });
    }
    uri = memoryServer.getUri();
    console.log(`🌿 Local MongoDB running with disk persistence.`);
    console.log('💡 TIP: Set MONGODB_URI in backend/.env to connect to your MongoDB Atlas cluster.');
  }

  try {
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('cluster');
    const maskedUri = maskMongoUri(uri);
    console.log(`📡 Connecting to MongoDB (${isAtlas ? 'MongoDB Atlas Cluster [TechBlogCluster]' : 'Local Persistent Storage'})...`);

    const mongooseOptions = {
      dbName: 'techblog_db',
      autoIndex: !isProduction,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 25,
      minPoolSize: 5
    };

    const conn = await mongoose.connect(uri, mongooseOptions);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} [DB: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

// Register runtime event listeners once
if (!mongoose.connection._hasRegisteredTechBlogListeners) {
  mongoose.connection._hasRegisteredTechBlogListeners = true;

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost. Driver will attempt automatic reconnection.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB connection re-established.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });
}

/**
 * Disconnect MongoDB safely
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  maskMongoUri
};
