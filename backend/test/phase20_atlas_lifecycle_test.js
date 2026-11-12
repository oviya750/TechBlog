// Phase 20 MongoDB Atlas Lifecycle, Failover & Persistence Audit
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) { }

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://127.0.0.1:5001/api';
const results = [];

function recordResult(testName, status, details) {
  results.push({ testName, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${status}] ${testName}: ${details}`);
}

async function runAtlasLifecycleTest() {
  console.log('================================================================');
  console.log('   TECHBLOG - PHASE 20 MONGODB ATLAS INTEGRATION AUDIT          ');
  console.log('================================================================\n');

  try {
    // 1. Healthcheck & Active Database Verification
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (
      healthRes.status === 200 &&
      healthData.database.status === 'connected' &&
      healthData.database.host.includes('mongodb.net') &&
      healthData.database.name === 'techblog_db'
    ) {
      recordResult(
        'MongoDB Atlas Host Verification',
        'PASS',
        `Connected to Atlas host ${healthData.database.host} on database '${healthData.database.name}'`
      );
    } else {
      recordResult('MongoDB Atlas Host Verification', 'FAIL', `Healthcheck returned: ${JSON.stringify(healthData)}`);
    }

    // 2. Invalid Credentials / Bad URI Failure Handling Test
    console.log('\n--- Testing Invalid Atlas Credentials Failure Handling ---');
    const rawAtlasUri = (process.env.MONGODB_URI || '').replace(/^["']|["']$/g, '').trim();

    if (!rawAtlasUri) {
      recordResult(
        'Invalid Credentials Error Handling',
        'SKIP',
        'MONGODB_URI is not set in environment; skipping invalid credentials test.'
      );
    } else {
      let badConnectionCaught = false;
      try {
        // Replace only username and password with dummy invalid test credentials
        const badUri = rawAtlasUri.replace(/\/\/([^:]+):([^@]+)@/, '//invalid_test_user:InvalidTestPassword999!@');
        const badMongoose = new mongoose.Mongoose();
        await badMongoose.connect(badUri, {
          dbName: 'techblog_db',
          serverSelectionTimeoutMS: 5000
        });
      } catch (badErr) {
        badConnectionCaught = true;
        // Verify specifically that the error is an authentication failure
        const isAuthFailure =
          badErr.code === 8000 ||
          badErr.codeName === 'AtlasError' ||
          /auth|authentication/i.test(badErr.message);

        if (isAuthFailure) {
          recordResult(
            'Invalid Credentials Error Handling',
            'PASS',
            `Authentication failure confirmed as expected (code: ${badErr.code || 'N/A'}, message: "${badErr.message}")`
          );
        } else {
          recordResult(
            'Invalid Credentials Error Handling',
            'FAIL',
            `Connection failed with non-auth error (code: ${badErr.code || 'N/A'}, message: "${badErr.message}")`
          );
        }
      }
      if (!badConnectionCaught) {
        recordResult('Invalid Credentials Error Handling', 'FAIL', 'Connection with invalid credentials succeeded unexpectedly.');
      }
    }

    // 3. Authenticate with real Atlas Admin
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@techblog.internal',
        password: 'AdminPassword2026!'
      })
    });
    const loginData = await loginRes.json();
    let adminToken = '';
    if (loginRes.status === 200 && loginData.token) {
      adminToken = loginData.token;
      recordResult(
        'Atlas Admin User Authentication',
        'PASS',
        `Authenticated against MongoDB Atlas as '${loginData.user.name}' (role: ${loginData.user.role})`
      );
    } else {
      recordResult('Atlas Admin User Authentication', 'FAIL', `Login failed: ${loginData.message}`);
      return;
    }

    // 4. Persistence Test: Create a persistent test document in Atlas
    const timestamp = Date.now();
    const createRes = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: `AtlasPersistenceTag-${timestamp}`
      })
    });
    const createData = await createRes.json();
    let createdTagId = '';
    if (createRes.status === 201 && createData.data?._id) {
      createdTagId = createData.data._id;
      recordResult(
        'Atlas Document Insertion',
        'PASS',
        `Created tag #${createData.data.name} (ID: ${createdTagId}) in techblog_db on Atlas`
      );
    } else {
      recordResult('Atlas Document Insertion', 'FAIL', `Tag creation failed: ${createData.message}`);
    }

    // 5. Verify Tag in Atlas collection
    const listRes = await fetch(`${BASE_URL}/tags`);
    const listData = await listRes.json();
    const tagFound = listData.data.some((t) => t._id === createdTagId);
    if (tagFound) {
      recordResult(
        'Atlas Document Retrieval',
        'PASS',
        `Verified document ${createdTagId} exists in Atlas cluster.`
      );
    } else {
      recordResult('Atlas Document Retrieval', 'FAIL', `Tag ${createdTagId} not found in collection.`);
    }

    // 6. Clean up test document
    if (createdTagId) {
      const deleteRes = await fetch(`${BASE_URL}/tags/${createdTagId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const deleteData = await deleteRes.json();
      if (deleteRes.status === 200 && deleteData.success) {
        recordResult('Atlas Document Cleanup', 'PASS', `Cleaned up test document ${createdTagId}`);
      } else {
        recordResult('Atlas Document Cleanup', 'FAIL', `Failed to delete test document.`);
      }
    }

    console.log('\n================================================================');
    console.log('   ATLAS AUDIT SUMMARY                                          ');
    console.log('================================================================');
    const passed = results.filter((r) => r.status === 'PASS').length;
    console.log(`TOTAL CHECKS: ${results.length} | PASS: ${passed} | FAIL: ${results.length - passed}`);
    console.log('================================================================\n');

    process.exitCode = results.length - passed === 0 ? 0 : 1;
  } catch (err) {
    console.error('Atlas lifecycle test error:', err);
    process.exitCode = 1;
  }
}

runAtlasLifecycleTest();
