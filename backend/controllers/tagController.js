const Tag = require('../models/Tag');
const Article = require('../models/Article');
const slugify = require('slugify');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort('-count name').lean();
    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create tag
// @route   POST /api/tags
// @access  Private
const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tag name is required.' });
    }

    const slug = slugify(name, { lower: true, strict: true });
    let tag = await Tag.findOne({ slug });
    if (tag) {
      return res.status(200).json({ success: true, data: tag });
    }

    tag = await Tag.create({ name: name.trim(), slug });
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private
const updateTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tag name is required.' });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName, { lower: true, strict: true });

    const existing = await Tag.findOne({ slug, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A tag with this name already exists.' });
    }

    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found.' });
    }

    const oldName = tag.name;
    tag.name = trimmedName;
    tag.slug = slug;
    await tag.save();

    // Propagate tag renaming across any articles that reference oldName
    if (oldName !== trimmedName) {
      await Article.updateMany(
        { tags: oldName },
        { $set: { 'tags.$': trimmedName } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Tag updated successfully',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private
const deleteTag = async (req, res, next) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Tag removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTags, createTag, updateTag, deleteTag };

