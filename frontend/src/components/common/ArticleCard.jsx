import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';

const ArticleCard = ({ article, variant = 'standard' }) => {
  if (!article) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const categoryName = article.category?.name || 'Technology';
  const categorySlug = article.category?.slug || 'software-development';
  const authorName = article.author?.name || 'TechBlog Staff';
  const authorRole = article.author?.role || 'Staff Writer';
  const authorAvatar =
    article.author?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  const imageUrl =
    article.featuredImage?.url ||
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';

  const isHorizontal = variant === 'horizontal';

  return (
    <article className={`card-editorial ${isHorizontal ? 'card-editorial-horizontal' : ''}`}>
      <div className="card-image-wrap">
        <Link to={`/blog/${article.slug}`}>
          <img
            src={imageUrl}
            alt={article.featuredImage?.altText || article.title}
            className="card-image"
            loading="lazy"
          />
        </Link>
        <div className="card-category-badge">
          <Link
            to={`/category/${categorySlug}`}
            className="badge badge-sage"
            style={{ textDecoration: 'none' }}
          >
            {categoryName}
          </Link>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">
          <Link to={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="card-excerpt">{article.excerpt}</p>

        <div className="article-meta-row">
          <div className="author-pill">
            <img src={authorAvatar} alt={authorName} className="author-avatar" />
            <div>
              <span className="author-name">{authorName}</span>
            </div>
          </div>

          <div className="article-date-read">
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={12} /> {formatDate(article.publishedAt || article.createdAt)}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={12} /> {article.readTimeMinutes || 5} min
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;

