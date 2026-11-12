const express = require('express');
const router = express.Router();
const { getTags, createTag, updateTag, deleteTag } = require('../controllers/tagController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getTags);
router.post('/', protect, restrictTo('admin', 'editor'), createTag);
router.put('/:id', protect, restrictTo('admin', 'editor'), updateTag);
router.delete('/:id', protect, restrictTo('admin'), deleteTag);

module.exports = router;

