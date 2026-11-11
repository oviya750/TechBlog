import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

const FeaturedHeroCard = ({ article }) => {
  if (!article) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const categoryName = article.category?.name || 'Deep Tech';
  const categorySlug = article.category?.slug || 'software-development';
  const authorName = article.author?.name || 'TechBlog Staff';
  const authorAvatar =
    article.author?.avatar ||
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';

  const imageUrl =
    article.featuredImage?.url ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  return (
    <article className="featured-lead-card">
      <div className="featured-lead-image-wrap">
        <Link to={`/blog/${article.slug}`}>
          <img
            src={imageUrl}
            alt={article.featuredImage?.altText || article.title}
            className="featured-lead-image"
          />
        </Link>
        <div className="featured-lead-badge">
          <Link to={`/category/${categorySlug}`} className="badge badge-peach">
            {categoryName}
          </Link>
        </div>
      </div>

      <div className="featured-lead-body">
        <div className="kicker">Lead Editorial Investigation</div>

        <h2 className="featured-lead-title">
          <Link to={`/blog/${article.slug}`}>{article.title}</Link>
        </h2>

        <p className="featured-lead-excerpt">{article.excerpt}</p>

        <div className="article-meta-row">
          <div className="author-pill">
            <img src={authorAvatar} alt={authorName} className="author-avatar" />
            <div>
              <div className="author-name">{authorName}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                {article.author?.role || 'Staff Writer'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="article-date-read">
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={13} /> {article.readTimeMinutes || 7} min
              </span>
            </div>

            <Link to={`/blog/${article.slug}`} className="btn btn-primary btn-sm">
              Read Article <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default FeaturedHeroCard;
