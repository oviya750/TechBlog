// Phase 17 Public Website Comprehensive Functional & API Audit
const BASE_URL = 'http://127.0.0.1:5001/api';

const results = [];

function recordResult(feature, status, details) {
  results.push({ feature, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${status}] ${feature}: ${details}`);
}

async function runAudit() {
  console.log('====================================================');
  console.log('   TECHBLOG - PHASE 17 PUBLIC WEBSITE AUDIT         ');
  console.log('====================================================\n');

  let sampleSlug = '';
  let sampleCategorySlug = '';

  try {
    // 1. Health & Server Status
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'online') {
      recordResult('Public API Health', 'PASS', `Server online. Database connected: ${healthData.database.status}`);
    } else {
      recordResult('Public API Health', 'FAIL', 'Health check failed');
    }

    // 2. Homepage: Featured Articles
    const featRes = await fetch(`${BASE_URL}/articles/featured`);
    const featData = await featRes.json();
    if (featRes.status === 200 && featData.success && Array.isArray(featData.data) && featData.data.length > 0) {
      const art = featData.data.find((a) => a.tableOfContents && a.tableOfContents.length > 0) || featData.data[0];
      const hasFields = art.title && art.slug && art.excerpt && art.author?.name && art.category?.name;
      if (hasFields) {
        sampleSlug = art.slug;
        sampleCategorySlug = art.category.slug;
        recordResult('Homepage Featured Articles', 'PASS', `Loaded ${featData.data.length} featured articles. Tested with: "${art.title}"`);
      } else {
        recordResult('Homepage Featured Articles', 'FAIL', 'Missing required article metadata fields.');
      }
    } else {
      recordResult('Homepage Featured Articles', 'FAIL', `Invalid featured response: ${JSON.stringify(featData)}`);
    }

    // 3. Homepage: Latest Published Articles
    const latestRes = await fetch(`${BASE_URL}/articles?limit=6&sort=-publishedAt`);
    const latestData = await latestRes.json();
    if (latestRes.status === 200 && latestData.success && Array.isArray(latestData.data) && latestData.data.length > 0) {
      recordResult('Homepage Latest Dispatches', 'PASS', `Loaded ${latestData.data.length} recent articles for editorial grid.`);
    } else {
      recordResult('Homepage Latest Dispatches', 'FAIL', 'Failed to retrieve latest articles.');
    }

    // 4. Homepage: Trending Articles
    const trendRes = await fetch(`${BASE_URL}/articles/trending`);
    const trendData = await trendRes.json();
    if (trendRes.status === 200 && trendData.success && Array.isArray(trendData.data) && trendData.data.length > 0) {
      recordResult('Homepage Trending Inquiries', 'PASS', `Loaded ${trendData.data.length} trending articles.`);
    } else {
      recordResult('Homepage Trending Inquiries', 'FAIL', 'Failed to retrieve trending articles.');
    }

    // 5. Category Desks Listing
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    if (catRes.status === 200 && catData.success && Array.isArray(catData.data) && catData.data.length > 0) {
      const allHaveCounts = catData.data.every((c) => typeof c.articleCount === 'number');
      if (allHaveCounts) {
        recordResult('Category Desks Exploration', 'PASS', `Loaded ${catData.data.length} categories with dynamic article counts.`);
      } else {
        recordResult('Category Desks Exploration', 'FAIL', 'Categories missing dynamic article counts.');
      }
    } else {
      recordResult('Category Desks Exploration', 'FAIL', 'Failed to retrieve categories.');
    }

    // 6. Blog Listing & Pagination
    const page1Res = await fetch(`${BASE_URL}/articles?page=1&limit=3&sort=-publishedAt`);
    const page1Data = await page1Res.json();
    const page2Res = await fetch(`${BASE_URL}/articles?page=2&limit=3&sort=-publishedAt`);
    const page2Data = await page2Res.json();

    if (
      page1Res.status === 200 &&
      page2Res.status === 200 &&
      page1Data.data.length > 0 &&
      page2Data.data.length > 0 &&
      page1Data.data[0]._id !== page2Data.data[0]._id
    ) {
      recordResult(
        'Blog Listing Pagination',
        'PASS',
        `Page 1 (${page1Data.data.length} items) and Page 2 (${page2Data.data.length} items) are distinct. Total: ${page1Data.total}, TotalPages: ${page1Data.totalPages}`
      );
    } else {
      recordResult('Blog Listing Pagination', 'FAIL', 'Pagination failed or returned identical pages.');
    }

    // 7. Blog Listing Category Filter
    if (sampleCategorySlug) {
      const catFilterRes = await fetch(`${BASE_URL}/articles?category=${sampleCategorySlug}`);
      const catFilterData = await catFilterRes.json();
      if (catFilterRes.status === 200 && catFilterData.data.length > 0) {
        const matchesCat = catFilterData.data.every(
          (a) => a.category?.slug === sampleCategorySlug || a.category === sampleCategorySlug
        );
        if (matchesCat) {
          recordResult('Category Filtering on Archive', 'PASS', `Filtered ${catFilterData.data.length} articles matching '${sampleCategorySlug}'`);
        } else {
          recordResult('Category Filtering on Archive', 'FAIL', 'Found mismatched category in filtered results.');
        }
      } else {
        recordResult('Category Filtering on Archive', 'FAIL', 'Failed to filter articles by category slug.');
      }
    }

    // 8. Search Functionality
    const searchRes = await fetch(`${BASE_URL}/articles?search=architecture`);
    const searchData = await searchRes.json();
    if (searchRes.status === 200 && searchData.success && Array.isArray(searchData.data)) {
      recordResult('Global Keyword Search', 'PASS', `Search query 'architecture' returned ${searchData.data.length} matching articles.`);
    } else {
      recordResult('Global Keyword Search', 'FAIL', 'Search failed.');
    }

    // Empty Search Result Handling
    const emptySearchRes = await fetch(`${BASE_URL}/articles?search=xyznonexistentterm9999`);
    const emptySearchData = await emptySearchRes.json();
    if (emptySearchRes.status === 200 && emptySearchData.data.length === 0 && emptySearchData.total === 0) {
      recordResult('Empty Search Result Handling', 'PASS', 'Zero-match search safely returned empty array with HTTP 200.');
    } else {
      recordResult('Empty Search Result Handling', 'FAIL', 'Empty search handling failed.');
    }

    // 9. Article Details Page (Full Reading Experience)
    if (sampleSlug) {
      const detailRes = await fetch(`${BASE_URL}/articles/slug/${sampleSlug}`);
      const detailData = await detailRes.json();
      if (detailRes.status === 200 && detailData.success && detailData.data) {
        const art = detailData.data;
        const hasTOC = Array.isArray(art.tableOfContents) && art.tableOfContents.length > 0;
        const hasNav = art.navigation && (art.navigation.previous !== undefined || art.navigation.next !== undefined);
        const hasRelated = Array.isArray(art.relatedArticles);
        const hasAuthor = art.author && art.author.name && art.author.role;
        const hasImage = art.featuredImage && art.featuredImage.url;

        if (hasTOC && hasNav && hasRelated && hasAuthor && hasImage) {
          recordResult(
            'Article Reading Experience & Navigation',
            'PASS',
            `Loaded "${art.title}" (TOC items: ${art.tableOfContents.length}, Related: ${art.relatedArticles.length}, Prev: ${art.navigation.previous ? art.navigation.previous.title : 'None'}, Next: ${art.navigation.next ? art.navigation.next.title : 'None'})`
          );
        } else {
          recordResult(
            'Article Reading Experience & Navigation',
            'FAIL',
            `Missing article parts: hasTOC=${hasTOC}, hasNav=${hasNav}, hasRelated=${hasRelated}, hasAuthor=${hasAuthor}, hasImage=${hasImage}`
          );
        }
      } else {
        recordResult('Article Reading Experience & Navigation', 'FAIL', `Failed to load article detail for slug: ${sampleSlug}`);
      }
    }

    // 10. Category Page Retrieval
    if (sampleCategorySlug) {
      const singleCatRes = await fetch(`${BASE_URL}/categories/slug/${sampleCategorySlug}`);
      const singleCatData = await singleCatRes.json();
      if (singleCatRes.status === 200 && singleCatData.success && singleCatData.data.name) {
        recordResult('Single Category Page Data', 'PASS', `Loaded category "${singleCatData.data.name}" (${singleCatData.data.articleCount} articles)`);
      } else {
        recordResult('Single Category Page Data', 'FAIL', 'Failed to retrieve single category by slug.');
      }
    }

    // 11. Invalid Article URL -> 404 Check
    const invalidArtRes = await fetch(`${BASE_URL}/articles/slug/completely-invalid-slug-404-test`);
    const invalidArtData = await invalidArtRes.json();
    if (invalidArtRes.status === 404 && invalidArtData.success === false) {
      recordResult('Invalid Article URL 404 Handling', 'PASS', `Non-existent article correctly returned HTTP 404: "${invalidArtData.message}"`);
    } else {
      recordResult('Invalid Article URL 404 Handling', 'FAIL', `Expected HTTP 404 for invalid slug, got ${invalidArtRes.status}`);
    }

    // 12. Invalid Category URL -> 404 Check
    const invalidCatRes = await fetch(`${BASE_URL}/categories/slug/invalid-category-desk-404`);
    const invalidCatData = await invalidCatRes.json();
    if (invalidCatRes.status === 404 && invalidCatData.success === false) {
      recordResult('Invalid Category URL 404 Handling', 'PASS', `Non-existent category correctly returned HTTP 404: "${invalidCatData.message}"`);
    } else {
      recordResult('Invalid Category URL 404 Handling', 'FAIL', `Expected HTTP 404 for invalid category, got ${invalidCatRes.status}`);
    }

    // 13. Public Draft Isolation & Security
    // Step A: Login as admin and create a draft
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@techblog.internal',
        password: 'AdminPassword2026!'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;

    // Get a category and author id for test draft
    const draftSlug = `security-draft-isolation-test-${Date.now()}`;
    const draftCreateRes = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Secret Internal Draft - Not for Public Eyes',
        slug: draftSlug,
        excerpt: 'Confidential draft that must NEVER leak to unauthenticated readers.',
        content: '<h2>Classified</h2><p>This draft must be strictly isolated.</p>',
        category: catData.data[0]._id,
        author: featData.data[0].author._id || featData.data[0].author,
        tags: ['Security', 'Isolation'],
        status: 'draft'
      })
    });
    const draftCreateData = await draftCreateRes.json();
    const testDraftId = draftCreateData.data?._id;

    if (testDraftId) {
      // Step B: Public caller fetches all articles without auth -> draft must NOT be present
      const publicArticlesRes = await fetch(`${BASE_URL}/articles`);
      const publicArticlesData = await publicArticlesRes.json();
      const inPublicFeed = publicArticlesData.data.some((a) => a._id === testDraftId || a.slug === draftSlug);

      // Step C: Public caller attempts to exploit ?status=draft query param -> must NOT return draft
      const exploitQueryRes = await fetch(`${BASE_URL}/articles?status=draft`);
      const exploitQueryData = await exploitQueryRes.json();
      const inExploitFeed = exploitQueryData.data.some((a) => a._id === testDraftId || a.slug === draftSlug);

      // Step D: Public caller attempts to access draft by slug -> must return HTTP 404
      const directSlugRes = await fetch(`${BASE_URL}/articles/slug/${draftSlug}`);

      if (!inPublicFeed && !inExploitFeed && directSlugRes.status === 404) {
        recordResult(
          'Public Draft Isolation & Zero-Leak Security',
          'PASS',
          'Draft is excluded from public archive, ignored by ?status=draft tampering, and returns 404 on direct slug route.'
        );
      } else {
        recordResult(
          'Public Draft Isolation & Zero-Leak Security',
          'FAIL',
          `Draft leakage detected: inPublicFeed=${inPublicFeed}, inExploitFeed=${inExploitFeed}, directSlugStatus=${directSlugRes.status}`
        );
      }

      // Clean up test draft
      await fetch(`${BASE_URL}/articles/${testDraftId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }

    // 14. Newsletter Subscription API
    const subRes = await fetch(`${BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `audit.reader.${Date.now()}@techblog.internal` })
    });
    const subData = await subRes.json();
    if (subRes.status === 201 || (subRes.status === 200 && subData.success)) {
      recordResult('Public Newsletter Subscription', 'PASS', `Subscriber registered successfully: "${subData.message}"`);
    } else {
      recordResult('Public Newsletter Subscription', 'FAIL', `Subscription failed: ${subData.message}`);
    }

    // 15. Public Contact Inquiry Submission
    const contactRes = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Ada Lovelace',
        email: 'ada@techblog.internal',
        subject: 'Inquiry on Distributed Systems Research',
        message: 'Requesting collaboration with the TechBlog editorial research team.'
      })
    });
    const contactData = await contactRes.json();
    if (contactRes.status === 201 && contactData.success) {
      recordResult('Public Contact Form Submission', 'PASS', `Contact submission saved successfully: "${contactData.message}"`);
    } else {
      recordResult('Public Contact Form Submission', 'FAIL', `Contact submission failed: ${contactData.message}`);
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
    console.log('🎉 ALL PHASE 17 PUBLIC WEBSITE AUDIT CHECKS PASSED!');
  } else {
    console.log(`⚠️ ${fails} CHECKS FAILED.`);
  }
}

runAudit();
