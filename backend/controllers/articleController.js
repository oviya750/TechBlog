const Article = require('../models/Article');
const Category = require('../models/Category');
const Author = require('../models/Author');
const slugify = require('slugify');

// Helper to auto-generate table of contents from HTML headings
const extractTableOfContents = (contentHtml) => {
  if (!contentHtml) return [];
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
  const toc = [];
  let match;
  while ((match = regex.exec(contentHtml)) !== null) {
    const level = parseInt(match[1], 10);
    const rawText = match[2].replace(/<[^>]+>/g, '').trim();
    if (rawText) {
      const id = slugify(rawText, { lower: true, strict: true });
      toc.push({ id, text: rawText, level });
    }
  }
  return toc;
};

// Helper: auto-publish scheduled articles
const checkScheduledArticles = async () => {
  try {
    const now = new Date();
    await Article.updateMany(
      { status: 'scheduled', scheduledFor: { $lte: now } },
      { $set: { status: 'published', publishedAt: now } }
    );
  } catch (err) {
    console.error('Error auto-publishing scheduled articles:', err);
  }
};

// @desc    Get all articles (Public + Admin with filters)
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res, next) => {
  try {
    await checkScheduledArticles();

    const {
      page = 1,
      limit = 9,
      category,
      tag,
      author,
      search,
      status = 'published',
      featured,
      trending,
      sort = '-publishedAt'
    } = req.query;

    const query = {};

    // Status filter: Public queries only see 'published'
    if (req.query.allStatus === 'true' && req.user) {
      if (req.query.status) query.status = req.query.status;
    } else {
      query.status = status;
    }

    // Category filter by Slug or ObjectId
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category.toLowerCase() });
        if (catDoc) query.category = catDoc._id;
        else return res.status(200).json({ success: true, count: 0, total: 0, totalPages: 0, data: [] });
      }
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
    }

    // Author filter
    if (author) {
      if (author.match(/^[0-9a-fA-F]{24}$/)) {
        query.author = author;
      } else {
        const authorDoc = await Author.findOne({ slug: author.toLowerCase() });
        if (authorDoc) query.author = authorDoc._id;
        else return res.status(200).json({ success: true, count: 0, total: 0, totalPages: 0, data: [] });
      }
    }

    // Featured / Trending filter
    if (featured !== undefined) {
      query.isFeatured = featured === 'true';
    }
    if (trending !== undefined) {
      query.isTrending = trending === 'true';
    }

    // Keyword Search
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { excerpt: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Article.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    const articles = await Article.find(query)
      .populate('category', 'name slug color icon')
      .populate('author', 'name slug role avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page: pageNum,
      totalPages,
      hasMore: pageNum < totalPages,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured articles
// @route   GET /api/articles/featured
// @access  Public
const getFeaturedArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ status: 'published', isFeatured: true })
      .populate('category', 'name slug color icon')
      .populate('author', 'name slug role avatar')
      .sort('-publishedAt')
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending articles
// @route   GET /api/articles/trending
// @access  Public
const getTrendingArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .populate('category', 'name slug color icon')
      .populate('author', 'name slug role avatar')
      .sort('-viewsCount -publishedAt')
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single article by slug
// @route   GET /api/articles/slug/:slug
// @access  Public
const getArticleBySlug = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug.toLowerCase() })
      .populate('category', 'name slug color icon description')
      .populate('author', 'name slug role avatar bio socialLinks')
      .lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }

    // Increment views asynchronously
    Article.findByIdAndUpdate(article._id, { $inc: { viewsCount: 1 } }).exec();

    // Fetch previous & next articles for navigation
    const prevArticle = await Article.findOne({
      status: 'published',
      publishedAt: { $lt: article.publishedAt || new Date() }
    })
      .select('title slug')
      .sort('-publishedAt')
      .lean();

    const nextArticle = await Article.findOne({
      status: 'published',
      publishedAt: { $gt: article.publishedAt || new Date() }
    })
      .select('title slug')
      .sort('publishedAt')
      .lean();

    // Fetch related articles (same category, different id)
    const relatedArticles = await Article.find({
      status: 'published',
      category: article.category._id,
      _id: { $ne: article._id }
    })
      .select('title slug excerpt featuredImage readTimeMinutes publishedAt author')
      .populate('author', 'name avatar')
      .limit(3)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...article,
        navigation: {
          previous: prevArticle || null,
          next: nextArticle || null
        },
        relatedArticles
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get article by ID (Admin)
// @route   GET /api/articles/:id
// @access  Private
const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('category')
      .populate('author');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private
const createArticle = async (req, res, next) => {
  try {
    let {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      author,
      featuredImage,
      isFeatured,
      isTrending,
      status,
      scheduledFor,
      readTimeMinutes,
      seo
    } = req.body;

    // Generate unique slug if not supplied or format slug
    let generatedSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    let existing = await Article.findOne({ slug: generatedSlug });
    if (existing) {
      generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Set publishedAt if status is published
    let publishedAt = null;
    if (status === 'published') {
      publishedAt = new Date();
    }

    // Auto extract TOC if not provided
    const tableOfContents = extractTableOfContents(content);

    const article = await Article.create({
      title,
      slug: generatedSlug,
      excerpt,
      content,
      category,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [],
      author,
      featuredImage: featuredImage || undefined,
      isFeatured: !!isFeatured,
      isTrending: !!isTrending,
      status: status || 'draft',
      publishedAt,
      scheduledFor: status === 'scheduled' ? scheduledFor : null,
      readTimeMinutes: readTimeMinutes || undefined,
      seo: seo || {
        metaTitle: title,
        metaDescription: excerpt,
        ogImage: featuredImage?.url || ''
      },
      tableOfContents
    });

    // Update counts on Category & Author
    if (status === 'published') {
      await Category.findByIdAndUpdate(category, { $inc: { articleCount: 1 } });
      await Author.findByIdAndUpdate(author, { $inc: { articleCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
const updateArticle = async (req, res, next) => {
  try {
    let article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }

    const prevStatus = article.status;
    const prevCategory = article.category.toString();
    const prevAuthor = article.author.toString();

    // Check slug uniqueness if changed
    if (req.body.slug && req.body.slug !== article.slug) {
      const cleanSlug = slugify(req.body.slug, { lower: true, strict: true });
      const duplicate = await Article.findOne({ slug: cleanSlug, _id: { $ne: article._id } });
      if (duplicate) {
        req.body.slug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        req.body.slug = cleanSlug;
      }
    }

    // Handle status transitions for publishedAt
    if (req.body.status === 'published' && prevStatus !== 'published') {
      req.body.publishedAt = new Date();
    }

    // Refresh TOC if content changed
    if (req.body.content) {
      req.body.tableOfContents = extractTableOfContents(req.body.content);
    }

    // Handle tags array if string passed
    if (typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('category')
      .populate('author');

    // Update counts if status changed
    if (prevStatus !== 'published' && updatedArticle.status === 'published') {
      await Category.findByIdAndUpdate(updatedArticle.category, { $inc: { articleCount: 1 } });
      await Author.findByIdAndUpdate(updatedArticle.author, { $inc: { articleCount: 1 } });
    } else if (prevStatus === 'published' && updatedArticle.status !== 'published') {
      await Category.findByIdAndUpdate(prevCategory, { $inc: { articleCount: -1 } });
      await Author.findByIdAndUpdate(prevAuthor, { $inc: { articleCount: -1 } });
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }

    if (article.status === 'published') {
      await Category.findByIdAndUpdate(article.category, { $inc: { articleCount: -1 } });
      await Author.findByIdAndUpdate(article.author, { $inc: { articleCount: -1 } });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArticles,
  getFeaturedArticles,
  getTrendingArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  checkScheduledArticles
};

