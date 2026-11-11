import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoriesAPI, articlesAPI } from '../../services/api';
import ArticleCard from '../../components/common/ArticleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FolderTree, ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const [catRes, artRes, allCatRes] = await Promise.all([
          categoriesAPI.getBySlug(slug),
          articlesAPI.getAll({ category: slug, limit: 12 }),
          categoriesAPI.getAll()
        ]);

        if (catRes.data.success) setCategory(catRes.data.data);
        if (artRes.data.success) setArticles(artRes.data.data);
        if (allCatRes.data.success) setAllCategories(allCatRes.data.data);
      } catch (err) {
        console.error('Failed to load category page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner text="Retrieving category dispatches..." />;
  }

  if (!category) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <EmptyState
          title="Category Not Found"
          message="The technology category you requested does not exist or may have been consolidated."
          actionText="Return to All Categories"
          actionLink="/blog"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/blog" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Back to all articles
        </Link>
      </div>

      {/* Category Header */}
      <div
        style={{
          background: 'var(--color-white)',
          padding: 'var(--space-10) var(--space-8)',
          borderRadius: 'var(--radius-2xl)',
          border: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--space-12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '8px',
            height: '100%',
            backgroundColor: category.color || 'var(--color-forest)'
          }}
        />

        <div className="kicker" style={{ color: category.color || 'var(--color-orange)' }}>
          Editorial Category Desk
        </div>

        <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>{category.name}</h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '800px', lineHeight: '1.6', marginBottom: 'var(--space-6)' }}>
          {category.description || 'Deep architectural research, case studies, and engineering guidelines.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-light)' }}>
          <span className="badge badge-sage">
            {articles.length} {articles.length === 1 ? 'Dispatch' : 'Dispatches'} Published
          </span>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="editorial-grid">
          {articles.map((art) => (
            <ArticleCard key={art._id} article={art} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No articles currently filed under ${category.name}`}
          message="Our editorial researchers are actively preparing upcoming dispatches for this desk."
          actionText="Browse Other Topics"
          actionLink="/blog"
        />
      )}

      {/* Other Categories Switcher */}
      <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-10)', borderTop: 'var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-6)' }}>Explore Other Desks</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {allCategories
            .filter((c) => c.slug !== slug)
            .map((cat) => (
              <Link key={cat._id} to={`/category/${cat.slug}`} className="btn btn-secondary btn-sm">
                {cat.name} ({cat.articleCount})
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

