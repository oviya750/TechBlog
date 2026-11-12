const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Tag = require('../models/Tag');
const Article = require('../models/Article');
const Setting = require('../models/Setting');

const initialCategories = [
  {
    name: 'Software Development',
    slug: 'software-development',
    description: 'Modern architectures, design patterns, scalable coding practices, and language deep dives.',
    icon: 'Code2',
    color: '#073F32'
  },
  {
    name: 'Artificial Intelligence & Machine Learning',
    slug: 'artificial-intelligence-machine-learning',
    description: 'LLM agents, diffusion architectures, neural reasoning, and production AI engineering.',
    icon: 'Cpu',
    color: '#F47728'
  },
  {
    name: 'Web and Mobile App Development',
    slug: 'web-and-mobile-app-development',
    description: 'High-performance React, cross-platform frameworks, modern UX paradigms, and responsive design systems.',
    icon: 'Smartphone',
    color: '#4D9B70'
  },
  {
    name: 'Technology & Innovation',
    slug: 'technology-innovation',
    description: 'Quantum breakthroughs, bio-computing, robotics, and transformative technology horizons.',
    icon: 'Sparkles',
    color: '#17221D'
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Zero-trust architecture, threat modeling, cloud posture security, and post-quantum cryptography.',
    icon: 'ShieldCheck',
    color: '#b71c1c'
  },
  {
    name: 'Cloud Computing',
    slug: 'cloud-computing',
    description: 'Serverless scalability, distributed systems orchestration, Kubernetes, and multicloud strategies.',
    icon: 'Cloud',
    color: '#0288d1'
  },
  {
    name: 'Industry Insights',
    slug: 'industry-insights',
    description: 'Engineering culture, technical leadership, product velocity, and tech sector economic analysis.',
    icon: 'TrendingUp',
    color: '#7b1fa2'
  }
];

const initialAuthors = [
  {
    name: 'Dr. Elena Rostova',
    slug: 'elena-rostova',
    email: 'elena.rostova@techblog.internal',
    role: 'Principal AI Research Scientist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Elena leads deep learning systems research focusing on neural reasoning architectures, autonomic agents, and low-latency transformer inference.',
    socialLinks: {
      twitter: 'https://twitter.com/elenarostova',
      linkedin: 'https://linkedin.com/in/elenarostova',
      github: 'https://github.com/erostova'
    }
  },
  {
    name: 'Marcus Thorne',
    slug: 'marcus-thorne',
    email: 'marcus.thorne@techblog.internal',
    role: 'Distinguished Cloud Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Marcus has architected globally distributed infrastructure for high-throughput streaming systems, specializing in resilient Kubernetes clusters and edge compute.',
    socialLinks: {
      twitter: 'https://twitter.com/marcusthorne',
      linkedin: 'https://linkedin.com/in/marcusthorne',
      github: 'https://github.com/mthorne'
    }
  },
  {
    name: 'Maya Lin',
    slug: 'maya-lin',
    email: 'maya.lin@techblog.internal',
    role: 'Staff Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'Maya is a full-stack engineer and design systems enthusiast passionate about compiler optimizations, WebAssembly, and expressive organic UI interfaces.',
    socialLinks: {
      twitter: 'https://twitter.com/mayalin_dev',
      linkedin: 'https://linkedin.com/in/mayalin-eng',
      github: 'https://github.com/mayalin'
    }
  },
  {
    name: 'Julian Vance',
    slug: 'julian-vance',
    email: 'julian.vance@techblog.internal',
    role: 'Director of Cybersecurity & Infosec',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Julian specializes in offensive counter-measures, zero-trust cryptographic defense, and securing cloud-native microservice fabrics against nation-state vectors.',
    socialLinks: {
      twitter: 'https://twitter.com/julianvance_sec',
      linkedin: 'https://linkedin.com/in/julianvance',
      github: 'https://github.com/jvance-sec'
    }
  }
];

const seedArticlesData = (categoryMap, authorMap) => [
  {
    title: 'The Next Architecture Horizon: Autonomous Agent Swarms and Distributed Reasoning',
    slug: 'autonomous-agent-swarms-distributed-reasoning',
    excerpt: 'How multi-agent asynchronous consensus protocols are replacing monolithic LLM prompts in mission-critical enterprise engineering pipelines.',
    category: categoryMap['artificial-intelligence-machine-learning'],
    author: authorMap['elena-rostova'],
    tags: ['AI', 'Autonomous Agents', 'LLMs', 'Distributed Systems'],
    isFeatured: true,
    isTrending: true,
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    readTimeMinutes: 7,
    viewsCount: 4120,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      altText: 'Abstract generative network nodes depicting autonomous agents',
      caption: 'Decentralized message exchange enables resilient self-organizing agent swarms.'
    },
    tableOfContents: [
      { id: 'the-limits-of-monolithic-prompting', text: 'The Limits of Monolithic Prompting', level: 2 },
      { id: 'asynchronous-agentic-consensus', text: 'Asynchronous Agentic Consensus', level: 2 },
      { id: 'practical-implementation-patterns', text: 'Practical Implementation Patterns', level: 2 },
      { id: 'operational-trade-offs-and-benchmarks', text: 'Operational Trade-Offs and Benchmarks', level: 2 }
    ],
    content: `
<p>Modern software engineering is undergoing an architectural inflection point. For the past three years, generative systems relied on single-turn completions or rigid sequential chains. While effective for isolated code generation, enterprise production workloads demand asynchronous verification, continuous self-correction, and parallel problem space exploration.</p>

<h2 id="the-limits-of-monolithic-prompting">The Limits of Monolithic Prompting</h2>
<p>When an engineer feeds an 80,000-token prompt containing business requirements, database schemas, and API constraints into a single reasoning call, cognitive degradation occurs. Context dilution and attention drift lead to subtle hallucinations in complex architectural boundaries.</p>

<blockquote>
  "Single large context windows increase capacity, but distributed agents provide genuine separation of concerns and verified consensus."
</blockquote>

<h2 id="asynchronous-agentic-consensus">Asynchronous Agentic Consensus</h2>
<p>In an agent swarm, distinct specialized agents operate concurrently through an event-driven pub/sub communication mesh. Consider the standard 4-node verification topology:</p>

<ul>
  <li><strong>Architect Node:</strong> Decomposes complex specifications into discrete invariants.</li>
  <li><strong>Author Node:</strong> Generates targeted implementations adhering to the invariants.</li>
  <li><strong>Adversarial Auditor Node:</strong> Actively searches for race conditions, security holes, and memory leaks.</li>
  <li><strong>Integration Verifier:</strong> Executes headless compilation and end-to-end telemetry tests.</li>
</ul>

<h2 id="practical-implementation-patterns">Practical Implementation Patterns</h2>
<p>Here is an architectural blueprint showing how an agent coordinator schedules work across bounded worker queues:</p>

<pre><code class="language-javascript">class SwarmCoordinator {
  constructor(messageBroker) {
    this.broker = messageBroker;
    this.activeAgents = new Map();
  }

  async broadcastTask(taskDescriptor) {
    const channel = \`tasks.\${taskDescriptor.domain}\`;
    const payload = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      spec: taskDescriptor.specification,
      acceptanceCriteria: taskDescriptor.criteria
    };

    return await this.broker.publish(channel, payload);
  }
}</code></pre>

<h2 id="operational-trade-offs-and-benchmarks">Operational Trade-Offs and Benchmarks</h2>
<p>The transition to agentic swarms introduces measurable operational advantages across large codebases:</p>

<table>
  <thead>
    <tr>
      <th>Architecture Model</th>
      <th>Task Success Rate</th>
      <th>Mean Resolution Latency</th>
      <th>Verification Rigor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Monolithic Zero-Shot</td>
      <td>63.4%</td>
      <td>4.2s</td>
      <td>Low (No Sandbox)</td>
    </tr>
    <tr>
      <td>Sequential ReAct</td>
      <td>78.1%</td>
      <td>28.5s</td>
      <td>Moderate</td>
    </tr>
    <tr>
      <td>Asynchronous Agent Swarm</td>
      <td>94.7%</td>
      <td>19.8s</td>
      <td>High (Multi-Auditor)</td>
    </tr>
  </tbody>
</table>

<p>As developer infrastructure evolves, we anticipate agentic topologies becoming standard components of continuous integration and autonomic incident mitigation pipelines.</p>
`
  },
  {
    title: 'Zero Trust Beyond the Perimeter: Ephemeral Identity in Distributed Cloud Fabrics',
    slug: 'zero-trust-beyond-the-perimeter-ephemeral-identity',
    excerpt: 'Why static service account tokens are a vulnerability liability and how cryptographically attested SPIFFE/SPIRE workloads redefine multi-cloud security.',
    category: categoryMap['cybersecurity'],
    author: authorMap['julian-vance'],
    tags: ['Cybersecurity', 'Zero Trust', 'Cloud Architecture', 'Cryptography'],
    isFeatured: true,
    isTrending: false,
    status: 'published',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    readTimeMinutes: 6,
    viewsCount: 2890,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      altText: 'Datacenter server racks and glowing network telemetry cables',
      caption: 'Workload identity must be cryptographically attested rather than statically provisioned.'
    },
    tableOfContents: [
      { id: 'the-death-of-the-network-perimeter', text: 'The Death of the Network Perimeter', level: 2 },
      { id: 'spiffe-and-spire-in-production', text: 'SPIFFE and SPIRE in Production', level: 2 },
      { id: 'migrating-legacy-credentials', text: 'Migrating Legacy Credentials', level: 2 }
    ],
    content: `
<p>The traditional concept of a fortified corporate network perimeter surrounded by vulnerable internal services is obsolete. Modern infrastructure spans multiple cloud providers, regional Kubernetes clusters, edge workers, and third-party SaaS dependencies.</p>

<h2 id="the-death-of-the-network-perimeter">The Death of the Network Perimeter</h2>
<p>Long-lived API credentials, static RSA private keys, and shared secret configurations represent the single highest vector for lateral privilege escalation during credential spills. Once an attacker obtains a service account JWT with a 1-year expiration, the blast radius is catastrophic.</p>

<h2 id="spiffe-and-spire-in-production">SPIFFE and SPIRE in Production</h2>
<p>Secure Production Identity Framework for Everyone (SPIFFE) standardizes workload identification through short-lived cryptographic X.509 SVID documents with lifespans measured in minutes rather than months.</p>

<blockquote>
  "Authentication must be continuous, contextual, and decoupled from static IP topology."
</blockquote>

<h2 id="migrating-legacy-credentials">Migrating Legacy Credentials</h2>
<p>Organizations adopting zero-trust fabrics should adopt an incremental rotation paradigm: replacing static keys with dynamic identity providers that validate running binary hashes and container runtime metadata before minting temporary access tokens.</p>
`
  },
  {
    title: 'The Modern Frontend Engine: React 19 Compiler, Server Actions, and Organic Design Systems',
    slug: 'modern-frontend-engine-react-19-organic-design',
    excerpt: 'Deconstructing automated memoization, zero-bundle streaming boundaries, and why editorial design languages are replacing sterile SaaS grids.',
    category: categoryMap['web-and-mobile-app-development'],
    author: authorMap['maya-lin'],
    tags: ['React', 'Frontend', 'Design Systems', 'Web Performance'],
    isFeatured: true,
    isTrending: true,
    status: 'published',
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    readTimeMinutes: 5,
    viewsCount: 5240,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      altText: 'Clean modern designer desk with laptop showing elegant typography',
      caption: 'Editorial design systems pair warm natural tones with rigorous technical foundations.'
    },
    tableOfContents: [
      { id: 'farewell-usememo-and-usecallback', text: 'Farewell useMemo and useCallback', level: 2 },
      { id: 'the-editorial-renaissance-in-tech', text: 'The Editorial Renaissance in Tech', level: 2 },
      { id: 'fluid-layouts-and-asymmetric-rhythm', text: 'Fluid Layouts and Asymmetric Rhythm', level: 2 }
    ],
    content: `
<p>For nearly a decade, React developers navigated the mental overhead of manual referential stability. Developers spent thousands of hours auditing dependency arrays and wrapping callbacks in <code>useCallback</code> to avoid cascading render cycles.</p>

<h2 id="farewell-usememo-and-usecallback">Farewell useMemo and useCallback</h2>
<p>With the React Compiler analyzing JavaScript semantics at build time, components automatically cache subtrees and computed values based on mutating inputs. This frees product teams to focus on bespoke typography, spatial pacing, and authentic design systems.</p>

<h2 id="the-editorial-renaissance-in-tech">The Editorial Renaissance in Tech</h2>
<p>The era of sterile, cookie-cutter purple SaaS templates is receding. Leading engineering organizations now invest in warm ivory canvas backgrounds, forest greens, nuanced serif accent typography, and organic asymmetric card compositions that reflect human craftsmanship.</p>

<h2 id="fluid-layouts-and-asymmetric-rhythm">Fluid Layouts and Asymmetric Rhythm</h2>
<p>By balancing generous whitespace with high-contrast text metrics and fluid CSS clamp scalers, technical publications can achieve magazine-grade legibility on both mobile screens and ultra-wide developer displays.</p>
`
  },
  {
    title: 'Demystifying Event-Driven Microservices with Kafka and Debezium Change Data Capture',
    slug: 'event-driven-microservices-kafka-debezium-cdc',
    excerpt: 'Eliminating dual-write anomalies and distributed transaction deadlocks using transactional outbox tables and streaming commit logs.',
    category: categoryMap['software-development'],
    author: authorMap['marcus-thorne'],
    tags: ['Microservices', 'Kafka', 'System Design', 'PostgreSQL'],
    isFeatured: false,
    isTrending: true,
    status: 'published',
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    readTimeMinutes: 8,
    viewsCount: 3820,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      altText: 'Code editor terminal with clean syntax highlighting',
      caption: 'Reliable asynchronous streaming requires guaranteed transaction capture.'
    },
    tableOfContents: [
      { id: 'the-peril-of-dual-writes', text: 'The Peril of Dual Writes', level: 2 },
      { id: 'the-transactional-outbox-pattern', text: 'The Transactional Outbox Pattern', level: 2 },
      { id: 'debezium-log-mining-in-action', text: 'Debezium Log Mining in Action', level: 2 }
    ],
    content: `
<p>When an application attempts to write to both a relational database and publish to an Apache Kafka topic in the same HTTP request handler, failure is inevitable. Network timeouts or pod restarts halfway through the sequence result in orphaned database rows or ghost events.</p>

<h2 id="the-peril-of-dual-writes">The Peril of Dual Writes</h2>
<p>Two-phase commit protocols (2PC) introduce catastrophic tail latencies and single points of failure across microservice boundaries. The solution is writing directly to the source database within an ACID transaction and utilizing Change Data Capture (CDC).</p>

<h2 id="the-transactional-outbox-pattern">The Transactional Outbox Pattern</h2>
<p>By persisting domain events directly into an <code>outbox</code> table within the same transaction that updates your entity, data integrity is guaranteed. Debezium inspects the PostgreSQL Write-Ahead Log (WAL) and streams events to Kafka with zero application-level latency overhead.</p>
`
  },
  {
    title: 'The FinOps Imperative: Engineering Cloud Architectures for Unit Economics',
    slug: 'finops-imperative-cloud-architectures-unit-economics',
    excerpt: 'How leading engineering teams correlate Kubernetes resource allocation with business transaction margins to prevent cloud waste.',
    category: categoryMap['cloud-computing'],
    author: authorMap['marcus-thorne'],
    tags: ['FinOps', 'Cloud Computing', 'Kubernetes', 'Cost Optimization'],
    isFeatured: false,
    isTrending: false,
    status: 'published',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    readTimeMinutes: 6,
    viewsCount: 1940,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      altText: 'Satellite view of Earth glowing with digital fiber connections',
      caption: 'Real-time telemetry connects infrastructure spend directly to product margins.'
    },
    tableOfContents: [
      { id: 'cloud-waste-the-silent-margin-killer', text: 'Cloud Waste: The Silent Margin Killer', level: 2 },
      { id: 'correlating-pod-requests-with-actual-utilization', text: 'Correlating Pod Requests with Actual Utilization', level: 2 }
    ],
    content: `
<p>During the hypergrowth decade of low interest rates, software engineering teams prioritized feature deployment velocity over infrastructure efficiency. In the modern macroeconomic environment, engineering efficiency is measured by margin contribution.</p>

<h2 id="cloud-waste-the-silent-margin-killer">Cloud Waste: The Silent Margin Killer</h2>
<p>Over-provisioned CPU reservations and idle memory allocations across development and staging clusters frequently account for up to 35% of monthly cloud invoices.</p>

<h2 id="correlating-pod-requests-with-actual-utilization">Correlating Pod Requests with Actual Utilization</h2>
<p>By implementing automated vertical pod autoscaling (VPA) and spot instance orchestrators like Karpenter, engineering organizations can dramatically compress resource variance and optimize cost per customer transaction.</p>
`
  },
  {
    title: 'Engineering Culture at Scale: Navigating the Senior-to-Principal Transition',
    slug: 'engineering-culture-senior-to-principal-transition',
    excerpt: 'Transitioning from solving direct coding challenges to shaping organizational architecture, technical strategy, and high-leverage mentorship.',
    category: categoryMap['industry-insights'],
    author: authorMap['elena-rostova'],
    tags: ['Leadership', 'Career', 'Engineering Culture', 'Architecture'],
    isFeatured: false,
    isTrending: true,
    status: 'published',
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    readTimeMinutes: 5,
    viewsCount: 3410,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      altText: 'Collaborative engineering team discussing architecture on a whiteboard',
      caption: 'Principal leadership is measured by organizational leverage and clarity.'
    },
    tableOfContents: [
      { id: 'the-myth-of-the-10x-lone-coder', text: 'The Myth of the 10x Lone Coder', level: 2 },
      { id: 'writing-as-an-engineering-superpower', text: 'Writing as an Engineering Superpower', level: 2 }
    ],
    content: `
<p>At the Senior Engineer level, success is evaluated by your ability to independently execute complex functional tasks, ship reliable code, and eliminate technical debt. However, advancing to Staff and Principal levels requires a fundamental shift in mental models.</p>

<h2 id="the-myth-of-the-10x-lone-coder">The Myth of the 10x Lone Coder</h2>
<p>True engineering leverage comes not from writing 10,000 lines of code yourself, but from crafting clear technical design documents (RFCs) that empower forty engineers to build cohesively across decoupled services without blocking on decisions.</p>

<h2 id="writing-as-an-engineering-superpower">Writing as an Engineering Superpower</h2>
<p>Clarity of thought precedes clarity of code. The most impactful architects are exceptional written communicators who articulate the trade-offs, security implications, and long-term costs of system decisions with surgical precision.</p>
`
  },
  {
    title: 'Post-Quantum Cryptography: Preparing Production Key Exchanges for Q-Day',
    slug: 'post-quantum-cryptography-preparing-production-key-exchanges',
    excerpt: 'An implementation guide to lattice-based key encapsulation mechanisms (ML-KEM) and hybrid TLS 1.3 certificates.',
    category: categoryMap['technology-innovation'],
    author: authorMap['julian-vance'],
    tags: ['Quantum', 'Cryptography', 'Security', 'Innovation'],
    isFeatured: false,
    isTrending: false,
    status: 'published',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    readTimeMinutes: 7,
    viewsCount: 2150,
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      altText: 'Laser diffraction and quantum hardware simulation in deep blue and green hues',
      caption: 'NIST standardized post-quantum algorithms provide defensive shields against future quantum decryption.'
    },
    tableOfContents: [
      { id: 'the-harvest-now-decrypt-later-threat', text: 'The Harvest-Now-Decrypt-Later Threat', level: 2 },
      { id: 'hybrid-key-encapsulation-in-tls-13', text: 'Hybrid Key Encapsulation in TLS 1.3', level: 2 }
    ],
    content: `
<p>While cryptographically relevant quantum computers capable of breaking RSA-2048 and Elliptic Curve Diffie-Hellman (ECDH) via Shor's Algorithm are still years away, threat actors are actively recording encrypted network traffic today in anticipation of retrospective decryption.</p>

<h2 id="the-harvest-now-decrypt-later-threat">The Harvest-Now-Decrypt-Later Threat</h2>
<p>For financial transactions, patient medical archives, and trade secrets with decadal sensitivity, the window for adopting quantum-resistant algorithms is right now.</p>

<h2 id="hybrid-key-encapsulation-in-tls-13">Hybrid Key Encapsulation in TLS 1.3</h2>
<p>By pairing classical X25519 with Kyber (ML-KEM-768), modern TLS handshakes ensure that an attacker must break both classical and lattice-based problems simultaneously to compromise confidentiality.</p>
`
  }
];

const seedDatabase = async (autoExit = true) => {
  try {
    console.log('🌱 Starting TechBlog Database Seeding...');
    await connectDB();

    const isProduction = process.env.NODE_ENV === 'production';

    // Safety Check: Never accidentally wipe production data unless explicitly forced
    const existingArticleCount = await Article.countDocuments();
    if (isProduction && existingArticleCount > 0 && process.env.FORCE_SEED !== 'true') {
      console.warn('⚠️ ABORTED SEED: Production environment detected with existing articles.');
      console.warn('⚠️ Set FORCE_SEED=true if you explicitly intend to overwrite existing production data.');
      if (autoExit) process.exit(0);
      return;
    }

    // Determine admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || (isProduction ? null : 'admin@techblog.internal');
    const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? null : 'AdminPassword2026!');

    const INSECURE_DEFAULT_PASSWORDS = [
      'AdminPassword2026!',
      'admin',
      'password',
      '123456',
      'admin123'
    ];

    if (isProduction) {
      if (!adminEmail || !adminPassword) {
        throw new Error(
          'SECURITY VIOLATION: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required in production. Refusing to use insecure development credentials.'
        );
      }
      if (INSECURE_DEFAULT_PASSWORDS.includes(adminPassword)) {
        throw new Error(
          'SECURITY VIOLATION: The configured ADMIN_PASSWORD is a known default development credential. You must set a unique, strong password in production.'
        );
      }
      if (adminEmail === 'admin@techblog.internal') {
        throw new Error(
          'SECURITY VIOLATION: The default admin@techblog.internal email cannot be used in production. Configure a verified production email.'
        );
      }
    }

    // 1. Seed or Preserve Admin User (Ensures existing admin accounts & tokens remain valid)
    console.log('👤 Checking / Seeding Admin User...');
    const normalizedAdminEmail = adminEmail.toLowerCase().trim();
    let adminUser = await User.findOne({ email: normalizedAdminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'Editorial Director',
        email: normalizedAdminEmail,
        password: adminPassword,
        role: 'admin',
        bio: 'Chief Technology Editor & Platform Administrator for TechBlog.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });
      console.log(`✅ Admin Account Created: ${adminUser.email}`);
    } else {
      console.log(`ℹ️ Existing Admin Account preserved: ${adminUser.email} (ID: ${adminUser._id})`);
    }

    // Purge any orphan/non-admin users to avoid duplicate accounts during seeding
    await User.deleteMany({ _id: { $ne: adminUser._id } });

    // Refresh content collections safely for seed
    console.log('🧹 Purging existing content collections for seed...');
    await Promise.all([
      Category.deleteMany(),
      Author.deleteMany(),
      Tag.deleteMany(),
      Article.deleteMany()
    ]);
    if (!isProduction) {
      console.log('⚠️ [DEV ONLY] Default admin password configured. Ensure ADMIN_PASSWORD is set in production.');
    }

    // 2. Seed Categories
    console.log('📂 Seeding 7 Initial Categories...');
    const createdCategories = await Category.insertMany(initialCategories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });
    console.log(`✅ ${createdCategories.length} Categories seeded.`);

    // 3. Seed Authors
    console.log('✍️ Seeding Editorial Authors...');
    const createdAuthors = await Author.insertMany(initialAuthors);
    const authorMap = {};
    createdAuthors.forEach((author) => {
      authorMap[author.slug] = author._id;
    });
    console.log(`✅ ${createdAuthors.length} Authors seeded.`);

    // 4. Seed Articles
    console.log('📰 Seeding Rich Editorial Articles...');
    const articlesToSeed = seedArticlesData(categoryMap, authorMap);
    const createdArticles = await Article.insertMany(articlesToSeed);
    console.log(`✅ ${createdArticles.length} Articles seeded successfully.`);

    // 5. Seed Tags
    console.log('🏷️ Seeding Tags...');
    const tagSet = new Set();
    articlesToSeed.forEach((art) => art.tags.forEach((t) => tagSet.add(t)));
    const tagDocs = Array.from(tagSet).map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: articlesToSeed.filter((a) => a.tags.includes(name)).length
    }));
    await Tag.insertMany(tagDocs);
    console.log(`✅ ${tagDocs.length} Tags seeded.`);

    // Update Category & Author article counts
    for (const cat of createdCategories) {
      const count = await Article.countDocuments({ category: cat._id, status: 'published' });
      await Category.findByIdAndUpdate(cat._id, { articleCount: count });
    }
    for (const author of createdAuthors) {
      const count = await Article.countDocuments({ author: author._id, status: 'published' });
      await Author.findByIdAndUpdate(author._id, { articleCount: count });
    }

    // 6. Seed Platform & SEO Settings if not present
    let setting = await Setting.findOne();
    if (!setting) {
      await Setting.create({
        siteName: 'TechBlog',
        tagline: 'The Engineering & Technology Editorial',
        siteTitle: 'TechBlog — Insights in Software, AI, Cloud & Engineering',
        siteDescription:
          'A curated technology publication covering modern software engineering, artificial intelligence, cloud architectures, cybersecurity, and emerging industry paradigms.',
        canonicalUrl: 'http://localhost:5001',
        readingSpeedWpm: 200,
        enableComments: false,
        enableNewsletterPopup: true
      });
      console.log('✅ Global Platform & SEO Settings initialized.');
    }

    console.log('\n🎉 ================================================');
    console.log('🎉 TECHBLOG DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('🎉 ================================================');
    console.log(`Admin Email:    ${adminEmail}`);
    console.log('Admin Password: [SECURED - NOT EXPOSED IN LOGS]');
    console.log('================================================\n');

    if (autoExit) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (autoExit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
