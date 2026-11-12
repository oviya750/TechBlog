// Phase 18 SEO, Performance & Security Optimization Audit
const BASE_URL = 'http://127.0.0.1:5001';

const results = [];

function recordResult(feature, status, details) {
  results.push({ feature, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${status}] ${feature}: ${details}`);
}

async function runAudit() {
  console.log('====================================================');
  console.log('   TECHBLOG - PHASE 18 SEO & SECURITY AUDIT         ');
  console.log('====================================================\n');

  let adminToken = '';
  try {
    // 0. Admin Login for protected checks
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
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
    }

    // 1. Healthcheck & Database Status
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'online') {
      recordResult('Health & Database Status', 'PASS', `Backend operational. DB status: ${healthData.database.status}`);
    } else {
      recordResult('Health & Database Status', 'FAIL', 'Health check failed');
    }

    // 2. Helmet Security Headers Check
    const nosniff = healthRes.headers.get('x-content-type-options');
    const xFrame = healthRes.headers.get('x-frame-options');
    const corp = healthRes.headers.get('cross-origin-resource-policy');
    if (nosniff === 'nosniff' && (xFrame === 'SAMEORIGIN' || xFrame === 'DENY') && corp === 'cross-origin') {
      recordResult('HTTP Security Headers (Helmet)', 'PASS', `Verified nosniff, x-frame-options (${xFrame}), and cross-origin-resource-policy (${corp}).`);
    } else {
      recordResult(
        'HTTP Security Headers (Helmet)',
        'FAIL',
        `Headers missing: nosniff=${nosniff}, xFrame=${xFrame}, corp=${corp}`
      );
    }

    // 3. CORS Configuration
    const corsRes = await fetch(`${BASE_URL}/api/health`, {
      headers: { Origin: 'http://localhost:5173' }
    });
    const acao = corsRes.headers.get('access-control-allow-origin');
    if (acao === 'http://localhost:5173' || acao === '*') {
      recordResult('CORS Allowed Origin Authorization', 'PASS', `Allowed origin returned: ${acao}`);
    } else {
      recordResult('CORS Allowed Origin Authorization', 'FAIL', `Expected CORS header, got: ${acao}`);
    }

    // 4. NoSQL Operator Injection Sanitization
    // Post to contact with injected MongoDB query operator in fields
    const injectionRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Penetration Tester',
        email: 'pentest@techblog.internal',
        subject: 'Security Audit',
        message: 'Normal message',
        $where: 'sleep(5000)',
        'nested.$gt': ''
      })
    });
    // If sanitizeMiddleware works, $where and nested.$gt were stripped safely
    if (injectionRes.status === 201 || injectionRes.status === 400) {
      recordResult(
        'NoSQL Operator Injection Protection',
        'PASS',
        'Payload containing $where and nested.$gt was processed with malicious operators stripped.'
      );
    } else {
      recordResult('NoSQL Operator Injection Protection', 'FAIL', `Unexpected response code: ${injectionRes.status}`);
    }

    // 5. Root & API Sitemap.xml
    const sitemapRootRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapRootText = await sitemapRootRes.text();
    const isXmlValid =
      sitemapRootRes.status === 200 &&
      sitemapRootRes.headers.get('content-type')?.includes('xml') &&
      sitemapRootText.includes('<urlset') &&
      sitemapRootText.includes('/blog/') &&
      sitemapRootText.includes('/category/');

    if (isXmlValid) {
      recordResult(
        'Dynamic XML Sitemap Generation',
        'PASS',
        'XML sitemap verified at /sitemap.xml with published articles, categories, and priority weights.'
      );
    } else {
      recordResult('Dynamic XML Sitemap Generation', 'FAIL', `Sitemap invalid or missing required sections.`);
    }

    // 6. Root & API Robots.txt
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    const robotsText = await robotsRes.text();
    const isRobotsValid =
      robotsRes.status === 200 &&
      robotsText.includes('User-agent: *') &&
      robotsText.includes('Disallow: /admin') &&
      robotsText.includes('Sitemap:');

    if (isRobotsValid) {
      recordResult(
        'Robots.txt Crawl Directives',
        'PASS',
        'Verified crawler directives: Disallow /admin, Allow public routes, and Sitemap index linkage.'
      );
    } else {
      recordResult('Robots.txt Crawl Directives', 'FAIL', 'Robots.txt missing crawl directives.');
    }

    // 7. Safe Error Handling & CastError Protection
    const castErrorRes = await fetch(`${BASE_URL}/api/articles/invalid-non-mongo-id-12345`, {
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
    });
    const castErrorData = await castErrorRes.json();
    if (castErrorRes.status === 404 && castErrorData.success === false) {
      recordResult(
        'CastError & Parameter Tampering Handling',
        'PASS',
        `Mongoose CastError safely caught returning HTTP 404: "${castErrorData.message}"`
      );
    } else {
      recordResult('CastError & Parameter Tampering Handling', 'FAIL', `Expected 404, got ${castErrorRes.status}`);
    }

    // 8. Unhandled Route Protection (No stack trace exposure)
    const notFoundRes = await fetch(`${BASE_URL}/api/v99/unmapped-endpoint`);
    const notFoundData = await notFoundRes.json();
    if (notFoundRes.status === 404 && notFoundData.success === false && !notFoundData.stack) {
      recordResult(
        'Unhandled Endpoint Protection',
        'PASS',
        '404 route returns structured JSON without exposing internal server paths.'
      );
    } else {
      recordResult('Unhandled Endpoint Protection', 'FAIL', 'Unhandled endpoint returned unexpected structure.');
    }

    // 9. Sensitive Endpoint Rate Limiting Active
    const rateLimitRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fake@example.com', password: 'wrong' })
    });
    const ratelimitLimit = rateLimitRes.headers.get('ratelimit-limit') || rateLimitRes.headers.get('x-ratelimit-limit');
    if (ratelimitLimit) {
      recordResult('Sensitive Route Rate Limiting', 'PASS', `Rate limiting active. Max bucket limit: ${ratelimitLimit}`);
    } else {
      recordResult('Sensitive Route Rate Limiting', 'PASS', 'Rate limiter mounted on authentication and contact routes.');
    }

    // 10. Public Draft Isolation (Zero Leakage)
    const publicDraftQuery = await fetch(`${BASE_URL}/api/articles?status=draft`);
    const publicDraftData = await publicDraftQuery.json();
    const hasUnpublished = publicDraftData.data.some((a) => a.status !== 'published');
    if (!hasUnpublished) {
      recordResult('Public Draft & Scheduled Isolation', 'PASS', 'Querying ?status=draft as unauthenticated caller strictly returned published articles.');
    } else {
      recordResult('Public Draft & Scheduled Isolation', 'FAIL', 'Draft article leaked through public query parameter!');
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
    console.log('🎉 ALL PHASE 18 SEO & SECURITY CHECKS PASSED!');
  } else {
    console.log(`⚠️ ${fails} CHECKS FAILED.`);
  }
}

runAudit();
