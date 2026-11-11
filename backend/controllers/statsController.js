const Article = require('../models/Article');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Subscriber = require('../models/Subscriber');
const Contact = require('../models/Contact');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalCategories,
      totalAuthors,
      totalSubscribers,
      totalContacts,
      viewsAggregate
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Article.countDocuments({ status: 'scheduled' }),
      Category.countDocuments(),
      Author.countDocuments(),
      Subscriber.countDocuments({ isActive: true }),
      Contact.countDocuments({ status: 'unread' }),
      Article.aggregate([{ $group: { _id: null, totalViews: { $sum: '$viewsCount' } } }])
    ]);

    const totalViews = viewsAggregate[0]?.totalViews || 0;

    // Recent 5 posts
    const recentArticles = await Article.find()
      .populate('category', 'name slug color')
      .populate('author', 'name avatar')
      .sort('-createdAt')
      .limit(6)
      .lean();

    // Top 5 trending posts
    const topArticles = await Article.find({ status: 'published' })
      .populate('category', 'name slug')
      .sort('-viewsCount')
      .limit(5)
      .select('title slug viewsCount readTimeMinutes publishedAt category')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalArticles,
          publishedArticles,
          draftArticles,
          scheduledArticles,
          totalCategories,
          totalAuthors,
          totalSubscribers,
          unreadContacts: totalContacts,
          totalViews
        },
        recentArticles,
        topArticles
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate dynamic XML Sitemap
// @route   GET /api/seo/sitemap.xml
// @access  Public
const getSitemapXml = async (req, res, next) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://techblog.internal';
    const articles = await Article.find({ status: 'published' }).select('slug updatedAt').lean();
    const categories = await Category.find().select('slug updatedAt').lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;

    categories.forEach(cat => {
      xml += `  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    articles.forEach(art => {
      const lastMod = art.updatedAt ? art.updatedAt.toISOString().split('T')[0] : '';
      xml += `  <url>
    <loc>${baseUrl}/blog/${art.slug}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
};

// @desc    Serve robots.txt
// @route   GET /api/seo/robots.txt
// @access  Public
const getRobotsTxt = (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'https://techblog.internal';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*

Sitemap: ${baseUrl}/api/seo/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
};

module.exports = {
  getDashboardStats,
  getSitemapXml,
  getRobotsTxt
};
