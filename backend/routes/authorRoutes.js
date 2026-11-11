const express = require('express');
const router = express.Router();
const {
  getAuthors,
  getAuthorBySlug,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = require('../controllers/authorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAuthors);
router.get('/slug/:slug', getAuthorBySlug);

router.post('/', protect, createAuthor);
router.put('/:id', protect, updateAuthor);
router.delete('/:id', protect, deleteAuthor);

module.exports = router;

