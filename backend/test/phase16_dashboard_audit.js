// Phase 16 Admin Dashboard Comprehensive Functional & Security Audit
const BASE_URL = 'http://127.0.0.1:5001/api';

const results = [];

function recordResult(feature, status, details) {
  results.push({ feature, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${status}] ${feature}: ${details}`);
}

async function runAudit() {
  console.log('====================================================');
  console.log('   TECHBLOG - PHASE 16 ADMIN DASHBOARD AUDIT        ');
  console.log('====================================================\n');

  let adminToken = '';
  let testCategoryId = '';
  let testAuthorId = '';
  let testTagId = '';
  let testArticleId = '';
  let testMediaId = '';

  try {
    // 1. Healthcheck
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'online') {
      recordResult('Health & Database Status', 'PASS', `Backend online. DB status: ${healthData.database.status}`);
    } else {
      recordResult('Health & Database Status', 'FAIL', `Health check failed: ${JSON.stringify(healthData)}`);
    }

    // 2. Admin Authentication
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@techblog.internal',
        password: 'AdminPassword2026!'
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      adminToken = loginData.token;
      recordResult('Admin Authentication & Session', 'PASS', `Logged in as ${loginData.user.name} (${loginData.user.role})`);
    } else {
      recordResult('Admin Authentication & Session', 'FAIL', `Login failed: ${loginData.message}`);
      return;
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    };

    // 3. Dashboard Statistics KPI
    const statsRes = await fetch(`${BASE_URL}/stats/dashboard`, { headers: authHeaders });
    const statsData = await statsRes.json();
    if (
      statsRes.status === 200 &&
      statsData.success &&
      typeof statsData.data.summary.totalArticles === 'number' &&
      typeof statsData.data.summary.publishedArticles === 'number' &&
      typeof statsData.data.summary.draftArticles === 'number' &&
      typeof statsData.data.summary.totalCategories === 'number' &&
      typeof statsData.data.summary.totalAuthors === 'number' &&
      Array.isArray(statsData.data.recentArticles)
    ) {
      const s = statsData.data.summary;
      recordResult(
        'Dashboard Metrics & Live Strip',
        'PASS',
        `Articles: ${s.totalArticles} (Pub: ${s.publishedArticles}, Draft: ${s.draftArticles}), Categories: ${s.totalCategories}, Authors: ${s.totalAuthors}, Views: ${s.totalViews}`
      );
    } else {
      recordResult('Dashboard Metrics & Live Strip', 'FAIL', `Invalid stats payload: ${JSON.stringify(statsData)}`);
    }

    // 4. Category Management: Create & Edit
    const catCreateRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Phase16 Test Category',
        description: 'Temporary testing category for Phase 16 audit',
        color: '#4D9B70',
        icon: 'Cpu'
      })
    });
    const catCreateData = await catCreateRes.json();
    if (catCreateRes.status === 201 && catCreateData.data?._id) {
      testCategoryId = catCreateData.data._id;
      recordResult('Category Creation', 'PASS', `Created category '${catCreateData.data.name}' (${testCategoryId})`);
    } else {
      recordResult('Category Creation', 'FAIL', `Category create failed: ${catCreateData.message}`);
    }

    // Update Category
    const catUpdateRes = await fetch(`${BASE_URL}/categories/${testCategoryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Phase16 Test Category Renamed',
        description: 'Updated description for audit testing'
      })
    });
    const catUpdateData = await catUpdateRes.json();
    if (catUpdateRes.status === 200 && catUpdateData.data?.name === 'Phase16 Test Category Renamed') {
      recordResult('Category Update', 'PASS', `Renamed category to '${catUpdateData.data.name}'`);
    } else {
      recordResult('Category Update', 'FAIL', `Category update failed: ${catUpdateData.message}`);
    }

    // 5. Author Management: Create & Edit
    const authorCreateRes = await fetch(`${BASE_URL}/authors`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Phase16 Test Author',
        email: 'testauthor.phase16@techblog.internal',
        role: 'Senior Systems Architect',
        bio: 'Audit test author biography for validation.'
      })
    });
    const authorCreateData = await authorCreateRes.json();
    if (authorCreateRes.status === 201 && authorCreateData.data?._id) {
      testAuthorId = authorCreateData.data._id;
      recordResult('Author Registration', 'PASS', `Registered author '${authorCreateData.data.name}' (${testAuthorId})`);
    } else {
      recordResult('Author Registration', 'FAIL', `Author registration failed: ${authorCreateData.message}`);
    }

    // Update Author
    const authorUpdateRes = await fetch(`${BASE_URL}/authors/${testAuthorId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Phase16 Test Author Renamed',
        role: 'Principal Systems Fellow'
      })
    });
    const authorUpdateData = await authorUpdateRes.json();
    if (authorUpdateRes.status === 200 && authorUpdateData.data?.role === 'Principal Systems Fellow') {
      recordResult('Author Profile Update', 'PASS', `Updated author role to '${authorUpdateData.data.role}'`);
    } else {
      recordResult('Author Profile Update', 'FAIL', `Author update failed: ${authorUpdateData.message}`);
    }

    // 6. Tag Management: Create, Duplicate check, Update
    const tagCreateRes = await fetch(`${BASE_URL}/tags`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Phase16Tag' })
    });
    const tagCreateData = await tagCreateRes.json();
    if ((tagCreateRes.status === 201 || tagCreateRes.status === 200) && tagCreateData.data?._id) {
      testTagId = tagCreateData.data._id;
      recordResult('Tag Creation', 'PASS', `Created tag #${tagCreateData.data.name} (${testTagId})`);
    } else {
      recordResult('Tag Creation', 'FAIL', `Tag create failed: ${tagCreateData.message}`);
    }

    // Tag Update (PUT /api/tags/:id)
    const tagUpdateRes = await fetch(`${BASE_URL}/tags/${testTagId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Phase16TagRenamed' })
    });
    const tagUpdateData = await tagUpdateRes.json();
    if (tagUpdateRes.status === 200 && tagUpdateData.data?.name === 'Phase16TagRenamed') {
      recordResult('Tag Renaming & Propagation', 'PASS', `Renamed tag to #${tagUpdateData.data.name}`);
    } else {
      recordResult('Tag Renaming & Propagation', 'FAIL', `Tag rename failed: ${tagUpdateData.message}`);
    }

    // 7. Article Creation (Draft Mode with Full Metadata)
    const articlePayload = {
      title: 'Auditing Distributed Consensus in Phase 16',
      slug: 'auditing-distributed-consensus-phase-16-' + Date.now(),
      excerpt: 'Comprehensive analysis of distributed consensus algorithms and event clocks.',
      content:
        '# Introduction\n\nDistributed consensus protocols require rigorous verification of fault tolerance and linearizability guarantees.\n\n## Formal Correctness\n\nUnder asynchronous network conditions, safety cannot be violated.',
      category: testCategoryId,
      author: testAuthorId,
      tags: ['Phase16TagRenamed', 'DistributedSystems', 'AuditValidation'],
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        altText: 'Distributed Systems Network Graph',
        caption: 'Figure 1: Consensus nodes in quorum topology.'
      },
      isFeatured: true,
      isTrending: false,
      status: 'draft',
      seo: {
        metaTitle: 'Distributed Consensus Audit | TechBlog',
        metaDescription: 'A technical deep-dive into distributed consensus verification.',
        focusKeywords: ['distributed consensus', 'raft', 'paxos', 'verification']
      }
    };

    const artCreateRes = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(articlePayload)
    });
    const artCreateData = await artCreateRes.json();
    if (artCreateRes.status === 201 && artCreateData.data?._id) {
      testArticleId = artCreateData.data._id;
      recordResult(
        'Create Article (Full Form & SEO)',
        'PASS',
        `Created draft '${artCreateData.data.title}' (Slug: ${artCreateData.data.slug}, ID: ${testArticleId})`
      );
    } else {
      recordResult('Create Article (Full Form & SEO)', 'FAIL', `Article creation failed: ${artCreateData.message}`);
    }

    // 8. Draft Isolation Check (Verify draft does not leak to public listing)
    const publicListRes = await fetch(`${BASE_URL}/articles`);
    const publicListData = await publicListRes.json();
    const isDraftPublic = publicListData.data.some((a) => a._id === testArticleId);
    if (!isDraftPublic) {
      recordResult('Draft Article Isolation', 'PASS', 'Draft article correctly excluded from public feed.');
    } else {
      recordResult('Draft Article Isolation', 'FAIL', 'Draft article improperly leaked into public listing!');
    }

    // 9. Article Management: Search, Category Filter, and Status Filtering
    const allArticlesRes = await fetch(`${BASE_URL}/articles?allStatus=true&category=${testCategoryId}`, {
      headers: authHeaders
    });
    const allArticlesData = await allArticlesRes.json();
    const foundInCategory = allArticlesData.data.some((a) => a._id === testArticleId);

    const searchRes = await fetch(`${BASE_URL}/articles?allStatus=true&search=Distributed+Consensus`, {
      headers: authHeaders
    });
    const searchData = await searchRes.json();
    const foundInSearch = searchData.data.some((a) => a._id === testArticleId);

    if (foundInCategory && foundInSearch) {
      recordResult(
        'Article Search & Category Filtering',
        'PASS',
        `Successfully located draft via category filter (${allArticlesData.totalArticles} total) and search query.`
      );
    } else {
      recordResult(
        'Article Search & Category Filtering',
        'FAIL',
        `Filter mismatch: foundInCategory=${foundInCategory}, foundInSearch=${foundInSearch}`
      );
    }

    // 10. Article Editing & Publishing
    const artUpdateRes = await fetch(`${BASE_URL}/articles/${testArticleId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Auditing Distributed Consensus in Phase 16 [Published]',
        status: 'published'
      })
    });
    const artUpdateData = await artUpdateRes.json();
    if (artUpdateRes.status === 200 && artUpdateData.data?.status === 'published') {
      recordResult('Article Publishing & Status Transition', 'PASS', `Article updated to status: 'published'`);
    } else {
      recordResult('Article Publishing & Status Transition', 'FAIL', `Article update failed: ${artUpdateData.message}`);
    }

    // Verify Admin Detail Retrieval by ID
    const adminDetailRes = await fetch(`${BASE_URL}/articles/${testArticleId}`, { headers: authHeaders });
    const adminDetailData = await adminDetailRes.json();
    if (adminDetailRes.status === 200 && adminDetailData.data?._id === testArticleId) {
      recordResult('Admin Article Retrieval by ID', 'PASS', `Admin route retrieved article for editor editing.`);
    } else {
      recordResult('Admin Article Retrieval by ID', 'FAIL', `Failed to retrieve article by ID.`);
    }

    // Verify Public Availability of Published Article by Slug
    const publicDetailRes = await fetch(`${BASE_URL}/articles/slug/${articlePayload.slug}`);
    const publicDetailData = await publicDetailRes.json();
    if (publicDetailRes.status === 200 && publicDetailData.data?.status === 'published') {
      recordResult('Public Article Availability by Slug', 'PASS', `Public route returned published article with HTTP 200.`);
    } else {
      recordResult('Public Article Availability by Slug', 'FAIL', `Published article not accessible on public route.`);
    }

    // 11. Safe Category Deletion Protection (Prevent delete when articles exist)
    const catDeleteBlockedRes = await fetch(`${BASE_URL}/categories/${testCategoryId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const catDeleteBlockedData = await catDeleteBlockedRes.json();
    if (catDeleteBlockedRes.status === 400 && catDeleteBlockedData.message.includes('articles are assigned')) {
      recordResult(
        'Category Safe Deletion Protection',
        'PASS',
        `Deletion correctly rejected: "${catDeleteBlockedData.message}"`
      );
    } else {
      recordResult('Category Safe Deletion Protection', 'FAIL', `Expected 400 rejection, got ${catDeleteBlockedRes.status}`);
    }

    // 12. Safe Author Deletion Protection (Prevent delete when articles exist)
    const authorDeleteBlockedRes = await fetch(`${BASE_URL}/authors/${testAuthorId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const authorDeleteBlockedData = await authorDeleteBlockedRes.json();
    if (authorDeleteBlockedRes.status === 400 && authorDeleteBlockedData.message.includes('articles are assigned')) {
      recordResult(
        'Author Safe Deletion Protection',
        'PASS',
        `Deletion correctly rejected: "${authorDeleteBlockedData.message}"`
      );
    } else {
      recordResult('Author Safe Deletion Protection', 'FAIL', `Expected 400 rejection, got ${authorDeleteBlockedRes.status}`);
    }

    // 13. Delete Article (Clean up article so category and author can be safely deleted)
    const artDeleteRes = await fetch(`${BASE_URL}/articles/${testArticleId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const artDeleteData = await artDeleteRes.json();
    if (artDeleteRes.status === 200) {
      recordResult('Article Deletion', 'PASS', `Deleted test article (${testArticleId})`);
    } else {
      recordResult('Article Deletion', 'FAIL', `Delete article failed: ${artDeleteData.message}`);
    }

    // Now safely delete Category and Author
    const catDeleteCleanRes = await fetch(`${BASE_URL}/categories/${testCategoryId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (catDeleteCleanRes.status === 200) {
      recordResult('Category Clean Deletion', 'PASS', `Deleted category after references cleared.`);
    }

    const authorDeleteCleanRes = await fetch(`${BASE_URL}/authors/${testAuthorId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (authorDeleteCleanRes.status === 200) {
      recordResult('Author Clean Deletion', 'PASS', `Deleted author after references cleared.`);
    }

    // Clean up Tag
    const tagDeleteRes = await fetch(`${BASE_URL}/tags/${testTagId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (tagDeleteRes.status === 200) {
      recordResult('Tag Deletion', 'PASS', `Deleted tag #${testTagId}`);
    }

    // 14. Media Library & Upload Validation
    // Fetch media library
    const mediaListRes = await fetch(`${BASE_URL}/media`, { headers: authHeaders });
    const mediaListData = await mediaListRes.json();
    if (mediaListRes.status === 200 && Array.isArray(mediaListData.data)) {
      recordResult('Media Library Listing', 'PASS', `Loaded ${mediaListData.data.length} media assets.`);
    } else {
      recordResult('Media Library Listing', 'FAIL', `Media list failed.`);
    }

    // Test Media Upload with simulated image buffer
    const boundary = '----WebKitFormBoundaryPhase16Test' + Date.now();
    const fakePng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const bodyHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="audit-test-image.png"\r\nContent-Type: image/png\r\n\r\n`
    );
    const bodyFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    const multipartBody = Buffer.concat([bodyHeader, fakePng, bodyFooter]);

    const uploadRes = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: multipartBody
    });
    const uploadData = await uploadRes.json();
    if ((uploadRes.status === 200 || uploadRes.status === 201) && uploadData.data?.url) {
      testMediaId = uploadData.data.id || uploadData.data.publicId;
      recordResult('Media Image Upload', 'PASS', `Uploaded test image: ${uploadData.data.url}`);
    } else {
      recordResult('Media Image Upload', 'FAIL', `Image upload failed: ${JSON.stringify(uploadData)}`);
    }

    // Test Invalid Media Upload (e.g. non-image text/plain)
    const badHeader = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="malicious.txt"\r\nContent-Type: text/plain\r\n\r\n`
    );
    const badBody = Buffer.concat([badHeader, Buffer.from('hello invalid file content'), bodyFooter]);
    const badUploadRes = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: badBody
    });
    const badUploadData = await badUploadRes.json();
    if (badUploadRes.status === 400 && badUploadData.message.includes('Only image files')) {
      recordResult(
        'Media Invalid Format Validation',
        'PASS',
        `Rejected non-image file with HTTP 400: "${badUploadData.message}"`
      );
    } else {
      recordResult(
        'Media Invalid Format Validation',
        'FAIL',
        `Expected HTTP 400 validation error, got ${badUploadRes.status}`
      );
    }

    // Delete test media
    if (testMediaId) {
      const mediaDeleteRes = await fetch(`${BASE_URL}/media/${testMediaId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (mediaDeleteRes.status === 200) {
        recordResult('Media Asset Deletion', 'PASS', `Cleaned up test media asset.`);
      }
    }
  } catch (err) {
    recordResult('Audit Execution Error', 'FAIL', err.message);
  }

  console.log('\n====================================================');
  console.log('   AUDIT SUMMARY                                    ');
  console.log('====================================================');
  const passes = results.filter((r) => r.status === 'PASS').length;
  const fails = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL CHECKS: ${results.length} | PASS: ${passes} | FAIL: ${fails}`);
  if (fails === 0) {
    console.log('🎉 ALL PHASE 16 ADMIN DASHBOARD AUDIT CHECKS PASSED!');
  } else {
    console.log(`⚠️ ${fails} CHECKS FAILED.`);
  }
}

runAudit();
