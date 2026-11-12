const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', protect, restrictTo('admin'), updateSettings);

module.exports = router;
