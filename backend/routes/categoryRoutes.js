const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);

router.post('/', protect, restrictTo('admin', 'editor'), createCategory);
router.put('/:id', protect, restrictTo('admin', 'editor'), updateCategory);
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);

module.exports = router;

