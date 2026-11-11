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
  deleteArticle
} = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/trending', getTrendingArticles);
router.get('/slug/:slug', getArticleBySlug);

// Protected routes (Admin / Editor)
router.get('/:id', protect, getArticleById);
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

module.exports = router;

