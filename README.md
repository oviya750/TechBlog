# TECHBLOG — Production-Grade Full-Stack Technology Editorial

> **Organic Editorial / Nature-Tech Aesthetics** — Inspired by thoughtful corporate publishing, crafted with an original high-contrast editorial identity for software engineers, systems architects, and research scientists.

---

## 🌿 1. Overview & Vision

**TechBlog** is an enterprise-grade full-stack MERN application engineered for high-signal technology journalism. The platform combines a warm, tactile editorial visual system with modern engineering performance, featuring automated table of contents extraction, debounced full-text search, live Google SERP simulation, embargo-based scheduled publishing, and a dedicated Content Management System (CMS) admin console.

---

## 🎨 2. Nature-Tech Design System

TechBlog discards sterile, generic AI templates in favor of an **Organic Editorial / Nature-Tech** visual identity:

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| **Forest Green** | `#073F32` | Primary brand color, headers, primary action buttons, dark accents |
| **Sage Green** | `#4D9B70` | Secondary highlights, category badges, author border accents |
| **Warm Ivory** | `#F8F1E6` | Main canvas background, paper-like tactile reading warmth |
| **Peach** | `#FFD1A8` | Accent highlights, lead category tags, subtle organic glow |
| **Orange** | `#F47728` | High-visibility interactive highlights, hover triggers, active indicators |
| **Main Text** | `#17221D` | High-contrast deep slate text for optimal reading comfort |
| **Muted Text** | `#5E6861` | Editorial descriptions, dates, excerpts, and secondary metadata |

### Typography Scale
- **Headings**: `Inter` (weights: 500, 600, 700, 800) with tight tracking
- **Body & Prose**: `Lato` (line-height: 1.85, high legibility)
- **Editorial Flair**: `Newsreader` / Serif accents for pull-quotes and kickers
- **Monospace & Code**: `JetBrains Mono` for syntax blocks and URL slugs

---

## 🏗️ 3. Architecture & File Structure

```text
TechBlog/
├── frontend/                     # React 19 + Vite SPA
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # ArticleCard, HeroCard, RichEditor, NewsletterBox, etc.
│   │   │   └── layout/           # Navbar, Footer, AdminSidebar, AdminNavbar
│   │   ├── context/              # AuthContext (JWT session state)
│   │   ├── layouts/              # PublicLayout, AdminLayout (Route Guard)
│   │   ├── pages/
│   │   │   ├── public/           # Home, BlogListing, BlogDetail, Category, Search, About, Contact, 404
│   │   │   └── admin/            # Dashboard, Posts, Editor, Categories, Tags, Authors, Media, Scheduled, SEO, Settings
│   │   ├── services/             # Axios API client with Bearer interceptors
│   │   ├── styles/               # variables.css, main.css, components.css
│   │   ├── App.jsx               # Client router definition
│   │   └── main.jsx              # React root entrypoint
│   ├── vercel.json               # Vercel SPA routing rewrites
│   ├── vite.config.js            # Dev proxy config to backend
│   └── package.json
│
├── backend/                      # Node.js + Express.js REST API
│   ├── config/                   # db.js (Atlas connection with zero-friction in-memory dev fallback)
│   ├── controllers/              # Article, Auth, Category, Author, Tag, Media, Stats, Subscriber
│   ├── middleware/               # Auth (JWT), ErrorHandler, Multer upload
│   ├── models/                   # User, Article, Category, Author, Tag, Subscriber, Contact
│   ├── routes/                   # Clean RESTful express routes
│   ├── services/                 # Cloudinary & Local Media Service
│   ├── utils/                    # Seed script with realistic technical articles
│   ├── test/                     # Automated integration tests (node --test)
│   ├── render.yaml               # Render Cloud deployment blueprint
│   ├── server.js                 # Express server & security headers
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 4. Quick Start & Local Execution

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### Step 1: Install Dependencies
```bash
# In the workspace root
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Database & Seeding
The backend includes a **resilient zero-configuration database layer**:
- If `MONGODB_URI` is provided in `backend/.env`, it connects to **MongoDB Atlas**.
- If `MONGODB_URI` is empty, it automatically provisions an in-memory database instance on startup, seeds all 7 initial categories, 4 authors, rich tech articles, tags, and the admin user with zero manual setup.

To manually re-seed the database at any time:
```bash
cd backend
npm run seed
```

### Step 3: Run the Backend API
```bash
cd backend
npm start
# Server listens on http://localhost:5001
# Healthcheck: http://localhost:5001/api/health
```

### Step 4: Run the Frontend Application
```bash
cd frontend
npm run dev
# Frontend runs on http://127.0.0.1:5173
```

---

## 🔑 5. Editorial Admin Console Access

- **Admin URL**: [http://127.0.0.1:5173/admin/login](http://127.0.0.1:5173/admin/login)
- **Email**: `admin@techblog.internal`
- **Password**: `AdminPassword2026!`

*(A convenient "Fill Credentials" button is provided directly on the login page for rapid verification).*

### Features Available in Admin:
1. **Overview Dashboard**: Live counters for total articles, published count, drafts, scheduled embargoes, reader views, and trending items.
2. **All Dispatches**: Multi-status filtering, category filtering, search, featured toggling, and deletion.
3. **Rich Article Editor**: WYSIWYG toolbar (H2, H3, bold, italic, code blocks, lists, blockquotes, video embeds, and table generators), live preview, auto-slug generation, reading-time calculator, and Google SERP snippet preview.
4. **Category Desks**: CRUD operations with custom theme color picker and icon selectors.
5. **Tags Management**: Focus keywords and cloud tagging.
6. **Author Registry**: Staff writer biographies, avatar images, and professional titles.
7. **Media Library**: Instant image uploads with 1-click clipboard URL copying.
8. **Scheduled Releases**: View publication queue with 1-click "Publish Now" override.
9. **SEO Hub**: Direct links to live dynamic `/api/seo/sitemap.xml` and `/api/seo/robots.txt`.
10. **Platform Settings**: Reading pace parameters, tagline, and corporate social handles.

---

## 🌐 6. Public Pages & User Experience

1. **Homepage** (`/`): Asymmetric nature-tech hero with featured lead investigation, trending numbered list, category exploration tiles, latest dispatches grid, newsletter banner.
2. **All Articles** (`/blog`): Real-time keyword search, desk filtering pills, pagination, and empty states.
3. **Article Detail** (`/blog/:slug`): Breadcrumbs, reading-time badge, sticky table of contents, responsive typography, code highlighting, social share buttons (X, LinkedIn, Copy Link), author profile card, prev/next pagination, related articles.
4. **Category Pages** (`/category/:slug`): Curated topic desk dispatches with desk descriptions and article counters.
5. **Search Results** (`/search?q=...`): Live search with query display and result counts.
6. **About Page** (`/about`): Editorial manifesto, nature-tech design philosophy, peer review standards, and editorial fellows board.
7. **Contact Page** (`/contact`): Inquiry form (Pitch, Correction, Partnership, Technical Feedback) with instant submission feedback and direct office details.
8. **404 Page** (`/*`): Custom nature-tech unmapped coordinates screen.

---

## 🧪 7. Automated Testing

The backend includes automated integration tests using Node's native test runner:

```bash
cd backend
npm test
```

**Test Coverage:**
- Health check verification
- Category desk listing & count validation
- Public article retrieval & population
- Article detail by slug with Table of Contents
- Admin JWT authentication with bcrypt
- 401 unauthorized protection on protected endpoints
- Private dashboard stats gatekeeper
- Newsletter subscription handling
- Contact inquiry submission

---

## ☁️ 8. Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push this repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Add the Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
5. Deploy. `frontend/vercel.json` ensures all client-side routes redirect cleanly to `index.html`.

### Backend Deployment (Render)
1. In [render.com](https://render.com), create a new **Web Service** connected to your repository.
2. Set the **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string (see below)*
   - `JWT_SECRET`: *A long random secret string*
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - *(Optional)* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### MongoDB Atlas Setup
1. Create a free cluster at [cloud.mongodb.com](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` (Allow from anywhere) for Render connectivity.
4. Under **Clusters > Connect > Drivers**, copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/techblog?retryWrites=true&w=majority
   ```
5. Paste into Render's `MONGODB_URI` environment variable.

### Cloudinary Image Storage (Optional)
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy **Cloud Name**, **API Key**, and **API Secret** from the Dashboard into your `.env`.
3. Uploads will automatically sync to Cloudinary CDN; if omitted, the application uses local disk storage with zero degradation.

---

## 🛡️ 9. Security & Best Practices

- **Password Hashing**: Salted bcrypt (10 rounds) before persisting.
- **JWT Authentication**: Cryptographically signed tokens with expiration checks.
- **Role-Based Access Control**: `admin` and `editor` authorization guards.
- **Security Headers**: Helmet integration with cross-origin resource policy.
- **Rate Limiting**: Rate limiter applied to authentication endpoints to prevent brute-force attempts.
- **Input Sanitization**: File type restrictions and size bounds on image uploads.
