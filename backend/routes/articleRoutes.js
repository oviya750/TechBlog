const express = require('express');
const router = express.Router();
const {
  getArticles,
  getFeaturedArticles,
  getTrendingArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  triggerPublishScheduled
} = require('../controllers/articleController');
const { protect, optionalProtect, restrictTo } = require('../middleware/authMiddleware');

// Public routes (with optional auth to allow admin preview of drafts)
router.get('/', optionalProtect, getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/trending', getTrendingArticles);
router.get('/slug/:slug', optionalProtect, getArticleBySlug);

// Protected routes (Admin / Editor)
router.post('/publish-scheduled', protect, restrictTo('admin', 'editor'), triggerPublishScheduled);
router.get('/:id', protect, restrictTo('admin', 'editor'), getArticleById);
router.post('/', protect, restrictTo('admin', 'editor'), createArticle);
router.put('/:id', protect, restrictTo('admin', 'editor'), updateArticle);
router.delete('/:id', protect, restrictTo('admin', 'editor'), deleteArticle);

module.exports = router;

