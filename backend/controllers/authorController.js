const Author = require('../models/Author');
const Article = require('../models/Article');
const slugify = require('slugify');

// @desc    Get all authors with article counts
// @route   GET /api/authors
// @access  Public
const getAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find().sort('name').lean();

    const counts = await Article.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const enrichedAuthors = authors.map((author) => ({
      ...author,
      articleCount: countMap[author._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: enrichedAuthors.length,
      data: enrichedAuthors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get author by slug with their articles
// @route   GET /api/authors/slug/:slug
// @access  Public
const getAuthorBySlug = async (req, res, next) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug.toLowerCase() });
    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found.' });
    }

    const articles = await Article.find({ author: author._id, status: 'published' })
      .populate('category', 'name slug color')
      .sort('-publishedAt')
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...author.toObject(),
        articles
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create author
// @route   POST /api/authors
// @access  Private
const createAuthor = async (req, res, next) => {
  try {
    const { name, email, role, avatar, bio, socialLinks } = req.body;

    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Author.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An author with this name already exists.' });
    }

    const author = await Author.create({
      name,
      slug,
      email,
      role: role || 'Technical Writer',
      avatar: avatar || undefined,
      bio,
      socialLinks: socialLinks || {}
    });

    res.status(201).json({
      success: true,
      message: 'Author created successfully',
      data: author
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Private
const updateAuthor = async (req, res, next) => {
  try {
    const { name, email, role, avatar, bio, socialLinks } = req.body;
    let updateFields = { email, role, avatar, bio, socialLinks };

    if (name) {
      updateFields.name = name;
      updateFields.slug = slugify(name, { lower: true, strict: true });
    }

    const author = await Author.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Author updated successfully',
      data: author
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete author
// @route   DELETE /api/authors/:id
// @access  Private
const deleteAuthor = async (req, res, next) => {
  try {
    const articleCount = await Article.countDocuments({ author: req.params.id });
    if (articleCount > 0) {
      const { reassignTo } = req.body || {};
      if (reassignTo) {
        if (reassignTo === req.params.id) {
          return res.status(400).json({
            success: false,
            message: 'Target author for reassignment cannot be the author being deleted.'
          });
        }
        const targetAuthor = await Author.findById(reassignTo);
        if (!targetAuthor) {
          return res.status(404).json({
            success: false,
            message: 'Target author for reassignment was not found.'
          });
        }
        // Reassign all associated articles to targetAuthor
        await Article.updateMany({ author: req.params.id }, { author: reassignTo });
      } else {
        return res.status(400).json({
          success: false,
          message: `Cannot delete author: ${articleCount} articles are assigned to this author. Reassign articles first or specify reassignTo.`
        });
      }
    }

    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Author deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuthors,
  getAuthorBySlug,
  createAuthor,
  updateAuthor,
  deleteAuthor
};

