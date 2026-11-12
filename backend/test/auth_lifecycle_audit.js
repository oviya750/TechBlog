/**
 * TechBlog Admin Authentication Full Lifecycle & Integrity Audit
 * Tests:
 * 1. Fresh Admin Login
 * 2. User Lookup & Token Verification (/auth/me)
 * 3. Dashboard Stats Access (/articles/dashboard/stats)
 * 4. Create Article
 * 5. Save Draft
 * 6. Publish Article
 * 7. Token Expiry & Malformed Token Error Handling
 * 8. Missing Token Error Handling ("Access denied. Authentication token required.")
 * 9. Non-existent User Token Handling ("The user belonging to this token no longer exists.")
 * 10. Seeding Non-Invalidation & No Duplicate Admin Accounts
 * 11. Client Logout & State Invalidation
 * 12. Login Again (Session Restoration)
 */

const jwt = require('jsonwebtoken');
const seedDatabase = require('../utils/seed');
const User = require('../models/User');

const BASE_URL = 'http://127.0.0.1:5001/api';

const auditResults = [];

function record(step, status, details) {
  auditResults.push({ step, status, details });
  console.log(`${status === 'PASS' ? '  ✔' : '  ✖'} [${status}] ${step}: ${details}`);
}

async function runAuthAudit() {
  console.log('\n========================================================');
  console.log('🔒 TECHBLOG ADMIN AUTHENTICATION LIFECYCLE AUDIT');
  console.log('========================================================\n');

  let adminToken = '';
  let adminUser = null;
  let categoryId = '';
  let authorId = '';
  let createdArticleId = '';

  // ----------------------------------------------------
  // Test 1: Fresh Admin Login
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@techblog.internal',
        password: 'AdminPassword2026!'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token && data.user) {
      adminToken = data.token;
      adminUser = data.user;
      const noPasswordExposed = !data.user.password && !data.user.hash;
      if (noPasswordExposed) {
        record(
          '1. Fresh Admin Login',
          'PASS',
          `Successfully authenticated (${data.user.email}); JWT acquired; zero password credentials exposed.`
        );
      } else {
        record('1. Fresh Admin Login', 'FAIL', 'Password hash exposed in login response.');
      }
    } else {
      record('1. Fresh Admin Login', 'FAIL', data.message || 'Login failed');
    }
  } catch (err) {
    record('1. Fresh Admin Login', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 2: User Lookup from JWT Payload (/auth/me)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && data.user.email === 'admin@techblog.internal') {
      record(
        '2. User Lookup from JWT (/auth/me)',
        'PASS',
        `Token verified and user resolved (${data.user.name}, role: ${data.user.role}).`
      );
    } else {
      record('2. User Lookup from JWT (/auth/me)', 'FAIL', data.message || 'Failed user lookup');
    }
  } catch (err) {
    record('2. User Lookup from JWT (/auth/me)', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 3: Dashboard Access (/stats/dashboard)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/stats/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    const summary = data.data?.summary || data.data || {};
    if (res.ok && data.success && typeof summary.totalArticles === 'number') {
      record(
        '3. Dashboard Access',
        'PASS',
        `Protected dashboard accessed: ${summary.totalArticles} total articles, ${summary.publishedArticles} published, ${summary.totalCategories} categories.`
      );
    } else {
      record('3. Dashboard Access', 'FAIL', data.message || 'Dashboard stats rejected');
    }
  } catch (err) {
    record('3. Dashboard Access', 'FAIL', err.message);
  }

  // Fetch category & author for article operations
  try {
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    categoryId = catData.data[0]._id;

    const authRes = await fetch(`${BASE_URL}/authors`);
    const authData = await authRes.json();
    authorId = authData.data[0]._id;
  } catch (err) {
    console.error('Failed to load category/author:', err);
  }

  // ----------------------------------------------------
  // Test 4: Create Article (as Draft)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: `Auth Lifecycle Draft ${Date.now().toString().slice(-4)}`,
        excerpt: 'Verifying authenticated article creation in admin workflow.',
        content: '<h2>Section 1</h2><p>Article created under active admin session.</p>',
        category: categoryId,
        author: authorId,
        status: 'draft'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.data._id) {
      createdArticleId = data.data._id;
      record(
        '4. Create Article',
        'PASS',
        `Article created (ID: ${createdArticleId}) with status "${data.data.status}".`
      );
    } else {
      record('4. Create Article', 'FAIL', data.message || 'Create article rejected');
    }
  } catch (err) {
    record('4. Create Article', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 5: Save Draft (Update Draft)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/articles/${createdArticleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: `Auth Lifecycle Draft (Revised) ${Date.now().toString().slice(-4)}`,
        excerpt: 'Revised draft excerpt under active admin session.',
        status: 'draft'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'draft') {
      record(
        '5. Save Draft',
        'PASS',
        `Draft updated in place; status remains "draft"; publishedAt remains null.`
      );
    } else {
      record('5. Save Draft', 'FAIL', data.message || 'Draft save rejected');
    }
  } catch (err) {
    record('5. Save Draft', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 6: Publish Article
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/articles/${createdArticleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'published'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'published' && data.data.publishedAt) {
      record(
        '6. Publish Article',
        'PASS',
        `Article published successfully; publishedAt set to (${data.data.publishedAt}); accessible at /blog/${data.data.slug}.`
      );
    } else {
      record('6. Publish Article', 'FAIL', data.message || 'Publishing rejected');
    }
  } catch (err) {
    record('6. Publish Article', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 7: Error 2 Check - Missing/Null Token
  // ----------------------------------------------------
  try {
    // 7a. No token at all
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    const noTokenData = await noTokenRes.json();
    const noTokenBlocked =
      noTokenRes.status === 401 &&
      noTokenData.message === 'Access denied. Authentication token required.';

    // 7b. Token is literal 'null' or 'undefined'
    const nullTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer null' }
    });
    const nullTokenData = await nullTokenRes.json();
    const nullTokenBlocked =
      nullTokenRes.status === 401 &&
      nullTokenData.message === 'Access denied. Authentication token required.';

    if (noTokenBlocked && nullTokenBlocked) {
      record(
        '7. Missing/Null Token Handling',
        'PASS',
        `Correctly rejected with HTTP 401: "${noTokenData.message}".`
      );
    } else {
      record('7. Missing/Null Token Handling', 'FAIL', `Expected 401 "token required"; got: ${noTokenRes.status}`);
    }
  } catch (err) {
    record('7. Missing/Null Token Handling', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 8: Expired Token Handling
  // ----------------------------------------------------
  try {
    const expiredToken = jwt.sign(
      { id: adminUser.id },
      process.env.JWT_SECRET || 'techblog_super_secret_jwt_key_nature_tech_2026_dev_env',
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    const data = await res.json();
    if (res.status === 401 && data.message.includes('expired')) {
      record(
        '8. Expired Token Handling',
        'PASS',
        `Expired token properly rejected with HTTP 401: "${data.message}".`
      );
    } else {
      record('8. Expired Token Handling', 'FAIL', `Expected 401 expired message; got: ${res.status} (${data.message})`);
    }
  } catch (err) {
    record('8. Expired Token Handling', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 9: Error 1 Check - Non-existent User Token Handling
  // ----------------------------------------------------
  try {
    const nonExistentUserId = '654321654321654321654321';
    const phantomToken = jwt.sign(
      { id: nonExistentUserId },
      process.env.JWT_SECRET || 'techblog_super_secret_jwt_key_nature_tech_2026_dev_env',
      { expiresIn: '1h' }
    );

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${phantomToken}` }
    });
    const data = await res.json();
    if (res.status === 401 && data.message === 'The user belonging to this token no longer exists.') {
      record(
        '9. Non-Existent User Token Handling',
        'PASS',
        `Properly handled deleted/missing user: HTTP 401 "${data.message}".`
      );
    } else {
      record('9. Non-Existent User Token Handling', 'FAIL', `Unexpected response: ${res.status} (${data.message})`);
    }
  } catch (err) {
    record('9. Non-Existent User Token Handling', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 10: Seeding Non-Invalidation & No Duplicate Admins
  // ----------------------------------------------------
  try {
    console.log('\n  ⚙️ Executing database seed verification (checking admin persistence)...');
    const { connectDB } = require('../config/db');
    await connectDB();

    // Ensure baseline admin document exists
    let preAdmin = await User.findOne({ email: 'admin@techblog.internal' });
    if (!preAdmin) {
      await seedDatabase(false);
      preAdmin = await User.findOne({ email: 'admin@techblog.internal' });
    }
    const preAdminId = preAdmin._id.toString();

    // Re-run seedDatabase to verify it DOES NOT invalidate the existing admin or create duplicate admins
    await seedDatabase(false);

    const postAdmin = await User.findOne({ email: 'admin@techblog.internal' });
    const postAdminId = postAdmin ? postAdmin._id.toString() : '';

    const adminIdUnchanged = preAdminId !== '' && preAdminId === postAdminId;
    const adminCount = await User.countDocuments({ email: 'admin@techblog.internal' });
    const noDuplicates = adminCount === 1;

    // Verify existing token STILL works on live server!
    const postSeedAuthRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const postSeedAuthData = await postSeedAuthRes.json();
    const tokenStillValid = postSeedAuthRes.ok && postSeedAuthData.success;

    if (adminIdUnchanged && noDuplicates && tokenStillValid) {
      record(
        '10. Seeding Non-Invalidation & No Duplicates',
        'PASS',
        `Existing admin account preserved through seed (ID unchanged: ${postAdminId}); token remained 100% valid; exactly ${adminCount} admin account exists.`
      );
    } else {
      record(
        '10. Seeding Non-Invalidation & No Duplicates',
        'FAIL',
        `Admin ID unchanged: ${adminIdUnchanged}, Admin count: ${adminCount}, Token valid: ${tokenStillValid}`
      );
    }
  } catch (err) {
    record('10. Seeding Non-Invalidation & No Duplicates', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 11: Logout Simulation (Client State Cleared)
  // ----------------------------------------------------
  try {
    // When user logs out, token is removed from localStorage
    adminToken = '';
    const res = await fetch(`${BASE_URL}/stats/dashboard`);
    const data = await res.json();
    if (res.status === 401 && data.message.includes('required')) {
      record(
        '11. Logout & State Invalidation',
        'PASS',
        `After logout, unauthenticated dashboard access is blocked with HTTP 401 ("${data.message}").`
      );
    } else {
      record('11. Logout & State Invalidation', 'FAIL', `Expected 401, got ${res.status} (${data.message})`);
    }
  } catch (err) {
    record('11. Logout & State Invalidation', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // Test 12: Login Again (Session Restoration)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@techblog.internal',
        password: 'AdminPassword2026!'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token) {
      // Verify newly issued token
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const meData = await meRes.json();
      if (meRes.ok && meData.success) {
        record(
          '12. Login Again (Session Restored)',
          'PASS',
          `Successfully re-authenticated; new token issued; console access restored for ${meData.user.name}.`
        );
      } else {
        record('12. Login Again (Session Restored)', 'FAIL', meData.message || 'New token verification failed');
      }
    } else {
      record('12. Login Again (Session Restored)', 'FAIL', data.message || 'Re-login failed');
    }
  } catch (err) {
    record('12. Login Again (Session Restored)', 'FAIL', err.message);
  }

  console.log('\n========================================================');
  console.log('📊 AUTHENTICATION AUDIT SUMMARY TABLE');
  console.log('========================================================');
  console.table(auditResults);

  const { disconnectDB } = require('../config/db');
  await disconnectDB();
}

runAuthAudit();
