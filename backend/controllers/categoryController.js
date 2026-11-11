const Category = require('../models/Category');
const Article = require('../models/Article');
const slugify = require('slugify');

// @desc    Get all categories with dynamic article counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name').lean();

    // Dynamically calculate published counts for precision
    const counts = await Article.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      articleCount: countMap[cat._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: enrichedCategories.length,
      data: enrichedCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug.toLowerCase() });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const count = await Article.countDocuments({ category: category._id, status: 'published' });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        articleCount: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;

    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      color: color || '#073F32',
      icon: icon || 'Folder'
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;
    let updateFields = { description, color, icon };

    if (name) {
      updateFields.name = name;
      updateFields.slug = slugify(name, { lower: true, strict: true });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const articleCount = await Article.countDocuments({ category: req.params.id });
    if (articleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${articleCount} articles are assigned to it. Reassign articles first.`
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};

