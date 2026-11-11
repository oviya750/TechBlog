const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadMedia, listMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('image'), uploadMedia);
router.get('/', protect, listMedia);

module.exports = router;

