const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://127.0.0.1:5001/api';
const MARKER_FILE = path.join(__dirname, 'persistence_marker.json');

async function loginAdmin() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@techblog.internal',
      password: 'AdminPassword2026!'
    })
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(`Login failed: ${data.message || res.statusText}`);
  }
  return data.token;
}

// Stage 1: Create category, create article, edit article, save marker
async function stage1PreRestart() {
  console.log('\n--- [Stage 1: Pre-Restart Creation & Modification] ---');
  const token = await loginAdmin();

  // 1. Create a category
  const catSlug = `edge-mesh-${Date.now()}`;
  const catPayload = {
    name: `Edge Computing & IoT Mesh ${Date.now()}`,
    slug: catSlug,
    description: 'Autonomous edge computing and distributed sensor consensus protocols.',
    color: '#073F32',
    icon: 'Cloud'
  };

  const catRes = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(catPayload)
  });
  const catData = await catRes.json();
  if (catRes.status !== 201 || !catData.data?._id) {
    throw new Error(`Category creation failed: ${JSON.stringify(catData)}`);
  }
  const createdCategory = catData.data;
  console.log(`✔ 1. Category created: "${createdCategory.name}" (ID: ${createdCategory._id})`);

  // Fetch author for article
  const authRes = await fetch(`${API_BASE}/authors`);
  const authData = await authRes.json();
  const authorId = authData.data[0]._id;

  // 2. Create an article
  const articleSlug = `edge-sensor-fault-tolerance-${Date.now()}`;
  const articlePayload = {
    title: 'Distributed Sensor Fault Tolerance in Industrial Edge Meshes',
    slug: articleSlug,
    excerpt: 'Analyzing deterministic Byzantine fault tolerance across low-power sensor micro-nodes.',
    content: '<p>Sensor mesh networks require deterministic latency under high packet loss conditions.</p>',
    category: createdCategory._id,
    author: authorId,
    tags: ['Edge', 'IoT', 'Fault-Tolerance'],
    status: 'published',
    isFeatured: true,
    isTrending: false,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      altText: 'Edge sensor network diagram'
    }
  };

  const artRes = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(articlePayload)
  });
  const artData = await artRes.json();
  if (artRes.status !== 201 || !artData.data?._id) {
    throw new Error(`Article creation failed: ${JSON.stringify(artData)}`);
  }
  const createdArticle = artData.data;
  console.log(`✔ 2. Article created: "${createdArticle.title}" (ID: ${createdArticle._id}, Slug: ${createdArticle.slug})`);

  // 3. Edit the article
  const updatedTitle = 'Distributed Sensor Fault Tolerance in Industrial Edge Meshes (Revised & Benchmarked)';
  const editRes = await fetch(`${API_BASE}/articles/${createdArticle._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: updatedTitle,
      excerpt: 'Updated empirical benchmarks across 5,000 edge nodes demonstrating < 12ms convergence.'
    })
  });
  const editData = await editRes.json();
  if (editRes.status !== 200) {
    throw new Error(`Article edit failed: ${JSON.stringify(editData)}`);
  }
  console.log(`✔ 3. Article edited successfully. New Title: "${updatedTitle}"`);

  // 4. Retrieve saved article
  const verifyRes = await fetch(`${API_BASE}/articles/slug/${createdArticle.slug}`);
  const verifyData = await verifyRes.json();
  if (verifyRes.status !== 200 || verifyData.data.title !== updatedTitle) {
    throw new Error(`Article retrieval failed or title mismatch: ${JSON.stringify(verifyData)}`);
  }
  console.log(`✔ 4. Retrieved saved article pre-restart: Title matches updated value.`);

  // Write marker file for post-restart verification
  const marker = {
    categoryId: createdCategory._id,
    categorySlug: createdCategory.slug,
    categoryName: createdCategory.name,
    articleId: createdArticle._id,
    articleSlug: createdArticle.slug,
    articleTitle: updatedTitle,
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(MARKER_FILE, JSON.stringify(marker, null, 2));
  console.log(`💾 State marker written to ${MARKER_FILE}`);
  console.log('--- Ready for server restart ---');
}

// Stage 2: Post-restart verification
async function stage2PostRestart() {
  console.log('\n--- [Stage 2: Post-Restart Persistence Verification] ---');
  if (!fs.existsSync(MARKER_FILE)) {
    throw new Error('Persistence marker file not found. Run stage 1 first.');
  }

  const marker = JSON.parse(fs.readFileSync(MARKER_FILE, 'utf8'));
  console.log(`🔍 Inspecting marker data: Article ID ${marker.articleId}, Slug: ${marker.articleSlug}`);

  // 5. Verify server is online and database is connected
  const healthRes = await fetch(`${API_BASE}/health`);
  const healthData = await healthRes.json();
  console.log(`✔ 5. Server Healthcheck: Status = ${healthData.status}, DB = ${healthData.database?.status}`);
  if (healthData.database?.status !== 'connected') {
    throw new Error('Database is not connected after restart!');
  }

  // 6. Retrieve the same article again
  const artLookupRes = await fetch(`${API_BASE}/articles/slug/${marker.articleSlug}`);
  const artLookupData = await artLookupRes.json();

  if (artLookupRes.status !== 200 || !artLookupData.data) {
    throw new Error(`PERSISTENCE FAILURE: Article ${marker.articleSlug} could not be retrieved after backend restart! Status: ${artLookupRes.status}`);
  }

  const retrievedArt = artLookupData.data;
  console.log(`✔ 6. Retrieved article post-restart successfully! Title: "${retrievedArt.title}"`);

  // 7. Confirm the data remains available and exact
  if (retrievedArt._id !== marker.articleId) {
    throw new Error(`ID mismatch! Expected: ${marker.articleId}, Got: ${retrievedArt._id}`);
  }
  if (retrievedArt.title !== marker.articleTitle) {
    throw new Error(`Title mismatch! Expected: "${marker.articleTitle}", Got: "${retrievedArt.title}"`);
  }

  // Also verify category persisted
  const catLookupRes = await fetch(`${API_BASE}/categories/slug/${marker.categorySlug}`);
  const catLookupData = await catLookupRes.json();
  if (catLookupRes.status !== 200 || !catLookupData.data) {
    throw new Error(`PERSISTENCE FAILURE: Category ${marker.categorySlug} not found after restart!`);
  }
  console.log(`✔ 7. Confirmed category persisted: "${catLookupData.data.name}" (ID: ${catLookupData.data._id})`);

  console.log('\n🎉 ALL 7 DATA PERSISTENCE CHECKS PASSED WITH 100% INTEGRITY!\n');

  // Clean up marker
  fs.unlinkSync(MARKER_FILE);
}

const mode = process.argv[2];
if (mode === 'stage1') {
  stage1PreRestart().catch(err => {
    console.error('❌ Stage 1 failed:', err.message);
    process.exit(1);
  });
} else if (mode === 'stage2') {
  stage2PostRestart().catch(err => {
    console.error('❌ Stage 2 failed:', err.message);
    process.exit(1);
  });
} else {
  console.log('Usage: node phase15_persistence_audit.js stage1 | stage2');
}
