const express = require('express');
const router = express.Router();
const {
  getAuthors,
  getAuthorBySlug,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/authorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getAuthors);
router.get('/slug/:slug', getAuthorBySlug);

router.post('/', protect, restrictTo('admin'), createAuthor);
router.put('/:id', protect, restrictTo('admin'), updateAuthor);
router.delete('/:id', protect, restrictTo('admin'), deleteAuthor);

module.exports = router;

