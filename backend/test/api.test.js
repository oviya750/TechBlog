process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');
const request = require('http');

let server;
let baseUrl;

test.before(async () => {
  // Wait for DB connection & initialization
  await app.readyPromise;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  const { disconnectDB } = require('../config/db');
  await disconnectDB();
});

const makeRequest = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = request.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch {
            resolve({ status: res.statusCode, raw: data, headers: res.headers });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

test('Health check endpoint returns online status', async () => {
  const res = await makeRequest('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'online');
});

test('Categories endpoint returns initial categories', async () => {
  const res = await makeRequest('/api/categories');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
  assert.ok(res.data.data.length >= 7, 'Expected at least 7 categories');
});

test('Public articles endpoint returns published articles', async () => {
  const res = await makeRequest('/api/articles');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
  assert.ok(res.data.data.length > 0, 'Expected at least 1 article');
  assert.ok(res.data.data[0].slug);
  assert.ok(res.data.data[0].category);
  assert.ok(res.data.data[0].author);
});

test('Article detail by slug endpoint returns rich article and navigation', async () => {
  const res = await makeRequest('/api/articles/slug/autonomous-agent-swarms-distributed-reasoning');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.strictEqual(res.data.data.slug, 'autonomous-agent-swarms-distributed-reasoning');
  assert.ok(res.data.data.category);
  assert.ok(res.data.data.author);
  assert.ok(Array.isArray(res.data.data.tableOfContents));
});

test('Admin login with valid credentials returns JWT token', async () => {
  const res = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@techblog.internal',
      password: 'AdminPassword2026!'
    }
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.token, 'Token should be returned');
  assert.strictEqual(res.data.user.role, 'admin');
});

test('Admin login with invalid credentials returns 401', async () => {
  const res = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@techblog.internal',
      password: 'WrongPassword!'
    }
  });
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.data.success, false);
});

test('Stats dashboard requires authentication', async () => {
  const res = await makeRequest('/api/stats/dashboard');
  assert.strictEqual(res.status, 401);
});

test('Newsletter subscription accepts new email', async () => {
  const res = await makeRequest('/api/newsletter/subscribe', {
    method: 'POST',
    body: {
      email: 'engineer@example.com',
      topicInterests: ['Artificial Intelligence & Machine Learning', 'Cloud Computing']
    }
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.success, true);
});

test('Contact form inquiry submission succeeds', async () => {
  const res = await makeRequest('/api/contact', {
    method: 'POST',
    body: {
      name: 'Samantha Ray',
      email: 'samantha@example.com',
      subject: 'Inquiry regarding Cloud Architecture article',
      message: 'Great publication! I have a question regarding SPIFFE zero-trust workloads.'
    }
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.success, true);
});

test('CORS handles frontend port 5174 correctly', async () => {
  const res = await makeRequest('/api/health', {
    method: 'GET',
    headers: {
      Origin: 'http://localhost:5174'
    }
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:5174');
  assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
});

test('Production seed safety refuses default admin credentials', async () => {
  const seedDatabase = require('../utils/seed');
  const originalEnv = process.env.NODE_ENV;
  const originalForce = process.env.FORCE_SEED;
  process.env.NODE_ENV = 'production';
  process.env.FORCE_SEED = 'true';
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;

  await assert.rejects(
    async () => {
      await seedDatabase(false);
    },
    {
      message: /SECURITY VIOLATION/
    }
  );

  process.env.NODE_ENV = originalEnv;
  if (originalForce !== undefined) {
    process.env.FORCE_SEED = originalForce;
  } else {
    delete process.env.FORCE_SEED;
  }
});
