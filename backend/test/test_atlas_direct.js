const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if custom servers cannot be set
}

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testAtlas() {
  let uri = process.env.MONGODB_URI || '';
  uri = uri.replace(/^["']|["']$/g, '').trim();

  if (!uri) {
    console.error('❌ MONGODB_URI is missing from backend/.env');
    process.exit(1);
  }

  // Mask credentials for display
  const maskedUri = uri.replace(/\/\/([^:]+):(.*)@([^@\/]+)/, '//$1:****@$3');
  console.log('Testing connection to Atlas with masked URI:', maskedUri);

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'techblog_db',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log('✅ ATLAS CONNECTION SUCCESSFUL!');
    console.log('Host:', conn.connection.host);
    console.log('Database Name:', conn.connection.name);
    console.log('ReadyState:', conn.connection.readyState);

    await mongoose.disconnect();
    console.log('Disconnected safely.');
  } catch (err) {
    console.error('❌ ATLAS CONNECTION FAILED:', err.message);
    process.exitCode = 1;
  }
}

testAtlas();
