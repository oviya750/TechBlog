const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'TechBlog',
      trim: true
    },
    tagline: {
      type: String,
      default: 'The Engineering & Technology Editorial',
      trim: true
    },
    siteTitle: {
      type: String,
      default: 'TechBlog — Insights in Software, AI, Cloud & Engineering',
      trim: true
    },
    siteDescription: {
      type: String,
      default: 'A curated technology publication covering modern software engineering, artificial intelligence, cloud architectures, cybersecurity, and emerging industry paradigms.',
      trim: true
    },
    canonicalUrl: {
      type: String,
      default: 'https://techblog.internal',
      trim: true
    },
    readingSpeedWpm: {
      type: Number,
      default: 200
    },
    twitterUrl: {
      type: String,
      default: 'https://twitter.com/techblog',
      trim: true
    },
    githubUrl: {
      type: String,
      default: 'https://github.com/techblog',
      trim: true
    },
    linkedinUrl: {
      type: String,
      default: 'https://linkedin.com/company/techblog',
      trim: true
    },
    enableComments: {
      type: Boolean,
      default: false
    },
    enableNewsletterPopup: {
      type: Boolean,
      default: true
    },
    defaultOgImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
