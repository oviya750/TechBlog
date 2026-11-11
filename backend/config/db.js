const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (!memoryServer) {
        console.log('⚡ No MONGODB_URI found in environment. Initializing local in-memory database server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
      }
      uri = memoryServer.getUri();
      console.log(`🌿 In-memory MongoDB running at: ${uri}`);
      console.log('💡 TIP: Set MONGODB_URI in backend/.env to connect to your MongoDB Atlas cluster.');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDB, disconnectDB };
