const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadMedia, listMedia, deleteMedia } = require('../controllers/mediaController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/upload', protect, restrictTo('admin', 'editor'), upload.single('image'), uploadMedia);
router.get('/', protect, restrictTo('admin', 'editor'), listMedia);
router.delete('/:id', protect, restrictTo('admin', 'editor'), deleteMedia);

module.exports = router;
