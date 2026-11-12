import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { categoriesAPI, articlesAPI } from '../../services/api';
import ArticleCard from '../../components/common/ArticleCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import NotFoundPage from './NotFoundPage';
import SEOHead from '../../components/common/SEOHead';
import { FolderTree, ArrowLeft, Search, X } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const categorySearch = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(categorySearch);

  useEffect(() => {
    setSearchInput(categorySearch);
  }, [categorySearch]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const [catRes, allCatRes] = await Promise.all([
          categoriesAPI.getBySlug(slug),
          categoriesAPI.getAll()
        ]);

        if (catRes.data.success && catRes.data.data) {
          setCategory(catRes.data.data);
          document.title = `${catRes.data.data.name} — TechBlog`;
        } else {
          setNotFound(true);
          return;
        }

        if (allCatRes.data.success) {
          setAllCategories(allCatRes.data.data);
        }

        // Fetch paginated articles for this category
        const artParams = {
          category: slug,
          page: currentPage,
          limit: 9,
          sort: '-publishedAt'
        };
        if (categorySearch) {
          artParams.search = categorySearch;
        }

        const artRes = await articlesAPI.getAll(artParams);
        if (artRes.data.success) {
          setArticles(artRes.data.data);
          setTotalCount(artRes.data.total || 0);
          setTotalPages(artRes.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load category page:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug, currentPage, categorySearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('q', searchInput.trim());
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving category dispatches..." />;
  }

  if (notFound || !category) {
    return <NotFoundPage />;
  }

  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
      <SEOHead
        title={`${category.name} Articles & Architectural Research`}
        description={category.description || `Technical analyses, blueprints, and dispatches published under ${category.name}.`}
        canonicalUrl={typeof window !== 'undefined' ? `${window.location.origin}/category/${category.slug}` : `https://techblog.internal/category/${category.slug}`}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Dispatches', item: '/blog' },
          { name: category.name, item: `/category/${category.slug}` }
        ]}
      />
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
          marginBottom: 'var(--space-10)',
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

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span className="badge badge-sage">
            {totalCount} {totalCount === 1 ? 'Dispatch' : 'Dispatches'} Published
          </span>

          {/* Search within this Category */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '380px', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder={`Search in ${category.name}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="form-input"
                style={{ paddingRight: categorySearch ? '32px' : '12px', fontSize: 'var(--text-xs)' }}
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-light)'
                  }}
                  title="Clear category search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              <Search size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <>
          <div className="editorial-grid">
            {articles.map((art) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 'var(--space-10)' }}>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('page', newPage.toString());
                  setSearchParams(newParams);
                  window.scrollTo({ top: 250, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      ) : categorySearch ? (
        <EmptyState
          title={`No articles matched "${categorySearch}" in ${category.name}`}
          message="Try different search terms or clear your search to view all dispatches in this category."
          actionText="Clear Category Search"
          onAction={handleClearSearch}
        />
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

