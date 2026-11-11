const express = require('express');
const router = express.Router();
const { subscribeNewsletter, submitContact, getContacts } = require('../controllers/subscriberController');
const { getSitemapXml, getRobotsTxt } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/newsletter/subscribe', subscribeNewsletter);
router.post('/contact', submitContact);
router.get('/contact', protect, getContacts);

router.get('/seo/sitemap.xml', getSitemapXml);
router.get('/seo/robots.txt', getRobotsTxt);

module.exports = router;

