const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    excerpt: {
      type: String,
      required: [true, 'Article excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Article content is required']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Author is required'],
      index: true
    },
    featuredImage: {
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
      },
      altText: {
        type: String,
        default: 'Technology article banner'
      },
      caption: {
        type: String,
        default: ''
      }
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft',
      index: true
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    readTimeMinutes: {
      type: Number,
      default: 5
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
      ogImage: { type: String, default: '' },
      focusKeywords: [{ type: String }]
    },
    tableOfContents: [
      {
        id: { type: String },
        text: { type: String },
        level: { type: Number, default: 2 }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound text index for robust full-text search
articleSchema.index(
  { title: 'text', excerpt: 'text', content: 'text', tags: 'text' },
  { weights: { title: 10, excerpt: 5, tags: 3, content: 1 }, name: 'ArticleTextIndex' }
);

// Calculate read time pre-save if not explicitly specified
articleSchema.pre('save', function (next) {
  if (this.content && (!this.readTimeMinutes || this.isModified('content'))) {
    // Strip HTML tags for word count estimate
    const plainText = this.content.replace(/<[^>]+>/g, ' ');
    const wordCount = plainText.trim().split(/\s+/).length;
    this.readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);

