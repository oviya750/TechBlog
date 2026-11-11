import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { articlesAPI, categoriesAPI } from '../../services/api';
import ArticleCard from '../../components/common/ArticleCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const BlogListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Load categories once
  useEffect(() => {
    categoriesAPI.getAll().then((res) => {
      if (res.data.success) {
        setCategories(res.data.data);
      }
    });
  }, []);

  // Fetch articles based on query params
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 9,
          sort: '-publishedAt'
        };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;

        const res = await articlesAPI.getAll(params);
        if (res.data.success) {
          setArticles(res.data.data);
          setTotalCount(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory, searchQuery, currentPage]);

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === selectedCategory) {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value.trim()) {
      newParams.set('search', e.target.value);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
      {/* Editorial Header */}
      <div style={{ maxWidth: '780px', marginBottom: 'var(--space-10)' }}>
        <div className="kicker">Archive & Publications</div>
        <h1 style={{ fontSize: '3.2rem', marginBottom: 'var(--space-4)' }}>
          Engineering Dispatches & Field Inquiries
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)' }}>
          Explore our complete archive of technical analyses, architectural blueprints, and deep dives
          across modern software engineering disciplines.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div
        style={{
          background: 'var(--color-white)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          border: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--space-10)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          {/* Search Field */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)'
              }}
            />
            <input
              type="text"
              placeholder="Search by keywords, tags, or topics..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="form-input"
              style={{ paddingLeft: '40px', borderRadius: 'var(--radius-pill)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            <SlidersHorizontal size={16} />
            <span>
              Showing <strong>{totalCount}</strong> published {totalCount === 1 ? 'article' : 'articles'}
            </span>
            {(selectedCategory || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-orange)' }}
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => handleCategorySelect('')}
            className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Desks
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat.name} ({cat.articleCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content Area */}
      {loading ? (
        <LoadingSpinner text="Fetching articles archive..." />
      ) : articles.length > 0 ? (
        <>
          <div className="editorial-grid">
            {articles.map((art) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', newPage.toString());
              setSearchParams(newParams);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
          />
        </>
      ) : (
        <EmptyState
          title="No articles match your criteria"
          message="Try adjusting your keyword query or select 'All Desks' to browse the complete index."
          actionText="Reset All Filters"
          actionLink="/blog"
        />
      )}
    </div>
  );
};

export default BlogListingPage;
