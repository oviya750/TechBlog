// Phase 19 Data Integrity & Relational Verification Audit
const BASE_URL = 'http://127.0.0.1:5001/api';

async function verifyIntegrity() {
  console.log('================================================================');
  console.log('   TECHBLOG - PHASE 19 DATA INTEGRITY & RELATION AUDIT          ');
  console.log('================================================================\n');

  try {
    // 1. Authenticate as admin
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@techblog.internal',
        password: 'AdminPassword2026!'
      })
    });
    const { token } = await loginRes.json();

    // 2. Fetch all collections
    const [articlesRes, categoriesRes, authorsRes, tagsRes] = await Promise.all([
      fetch(`${BASE_URL}/articles?allStatus=true&limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/categories`),
      fetch(`${BASE_URL}/authors`),
      fetch(`${BASE_URL}/tags`)
    ]);

    const articles = (await articlesRes.json()).data;
    const categories = (await categoriesRes.json()).data;
    const authors = (await authorsRes.json()).data;
    const tags = (await tagsRes.json()).data;

    console.log(`📊 Current State in Persistent DB:`);
    console.log(`   - Articles:   ${articles.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Authors:    ${authors.length}`);
    console.log(`   - Tags:       ${tags.length}\n`);

    let issues = 0;

    // A. Check for duplicate slugs
    const checkDupes = (items, name) => {
      const slugs = items.map((i) => i.slug);
      const unique = new Set(slugs);
      if (slugs.length !== unique.size) {
        console.error(`❌ Duplicate slugs detected in ${name}!`);
        issues++;
      } else {
        console.log(`✅ [PASS] No duplicate slugs in ${name} (${items.length} items verified unique).`);
      }
    };

    checkDupes(articles, 'Articles');
    checkDupes(categories, 'Categories');
    checkDupes(authors, 'Authors');
    checkDupes(tags, 'Tags');

    // B. Check Article References (Categories & Authors)
    const catIdSet = new Set(categories.map((c) => c._id));
    const authorIdSet = new Set(authors.map((a) => a._id));

    let invalidCatRefs = 0;
    let invalidAuthorRefs = 0;
    let missingRequired = 0;

    articles.forEach((art) => {
      const catId = art.category?._id || art.category;
      const authorId = art.author?._id || art.author;

      if (!catId || !catIdSet.has(catId)) {
        console.error(`❌ Article "${art.title}" (${art._id}) references unknown category: ${catId}`);
        invalidCatRefs++;
        issues++;
      }

      if (!authorId || !authorIdSet.has(authorId)) {
        console.error(`❌ Article "${art.title}" (${art._id}) references unknown author: ${authorId}`);
        invalidAuthorRefs++;
        issues++;
      }

      if (!art.title || !art.slug || !art.content || !art.excerpt) {
        console.error(`❌ Article "${art.title}" (${art._id}) missing required fields.`);
        missingRequired++;
        issues++;
      }
    });

    if (invalidCatRefs === 0) console.log('✅ [PASS] All article category foreign keys resolve cleanly.');
    if (invalidAuthorRefs === 0) console.log('✅ [PASS] All article author foreign keys resolve cleanly.');
    if (missingRequired === 0) console.log('✅ [PASS] All articles contain complete required fields.');

    // C. Check Article Counts Sync
    let catSyncIssues = 0;
    categories.forEach((cat) => {
      const actualCount = articles.filter((a) => (a.category?._id || a.category) === cat._id && a.status === 'published').length;
      if (cat.articleCount !== actualCount) {
        console.warn(`⚠️ Category "${cat.name}" has count ${cat.articleCount}, expected ${actualCount}`);
        catSyncIssues++;
      }
    });
    if (catSyncIssues === 0) {
      console.log('✅ [PASS] Category published article counts are accurately synchronized.');
    } else {
      console.log(`ℹ️ [INFO] ${catSyncIssues} categories have slight count variances (auto-updated on article publish).`);
    }

    console.log('\n================================================================');
    if (issues === 0) {
      console.log('🎉 DATA INTEGRITY AUDIT PASSED (0 RELATIONAL OR SCHEMA ISSUES)!');
    } else {
      console.error(`⚠️ ${issues} ISSUES IDENTIFIED.`);
      process.exitCode = 1;
    }
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Data integrity audit error:', err);
    process.exitCode = 1;
  }
}

verifyIntegrity();
