const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspectAtlas() {
  let uri = process.env.MONGODB_URI || '';
  uri = uri.replace(/^["']|["']$/g, '').trim();

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'techblog_db',
      serverSelectionTimeoutMS: 15000
    });

    console.log('Connected to Atlas techblog_db');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections in techblog_db:', collections.map(c => c.name));

    for (const c of collections) {
      const count = await conn.connection.db.collection(c.name).countDocuments();
      console.log(` - ${c.name}: ${count} documents`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Inspection failed:', err.message);
  }
}

inspectAtlas();
