import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { articlesAPI } from '../../services/api';
import ArticleCard from '../../components/common/ArticleCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SEOHead from '../../components/common/SEOHead';
import { Search, ArrowLeft, X } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [articles, setArticles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [inputVal, setInputVal] = useState(query);

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  useEffect(() => {
    const executeSearch = async () => {
      if (!query.trim()) {
        setArticles([]);
        setTotalCount(0);
        setTotalPages(1);
        setLoading(false);
        document.title = 'Search Publication Archives — TechBlog';
        return;
      }
      try {
        setLoading(true);
        document.title = `Search: "${query}" — TechBlog`;
        const res = await articlesAPI.getAll({
          search: query.trim(),
          page: currentPage,
          limit: 9,
          sort: '-publishedAt'
        });
        if (res.data.success) {
          setArticles(res.data.data);
          setTotalCount(res.data.total || res.data.count || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to run search:', err);
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [query, currentPage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim(), page: '1' });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setInputVal('');
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
      <SEOHead
        title={query ? `Search: "${query}"` : 'Search Publication Archives'}
        description={`Search results across the TechBlog engineering dispatches archive.`}
        noindex={true}
      />
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/blog" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Back to all articles
        </Link>
      </div>

      <div style={{ maxWidth: '780px', marginBottom: 'var(--space-10)' }}>
        <div className="kicker">Archive Query Results</div>
        <h1 style={{ fontSize: '2.8rem', marginBottom: 'var(--space-4)' }}>
          {query ? `Search results for "${query}"` : 'Search Publication Archives'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          {query
            ? `${totalCount} ${totalCount === 1 ? 'dispatch' : 'dispatches'} discovered across the technical knowledge base.`
            : 'Enter a keyword, pattern, or architectural discipline to search our engineering dispatches.'}
        </p>

        {/* Search Input Box with Clear Action */}
        <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-6)', display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
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
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search by keywords, architecture patterns, or tags..."
              className="form-input"
              style={{ paddingLeft: '40px', paddingRight: inputVal ? '38px' : '14px', borderRadius: 'var(--radius-pill)' }}
            />
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-light)'
                }}
                title="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text={`Searching dispatches matching "${query}"...`} />
      ) : articles.length > 0 ? (
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
                  setSearchParams({ q: query, page: newPage.toString() });
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      ) : query ? (
        <EmptyState
          title={`No articles matched "${query}"`}
          message="Check your spelling, try broader keywords (e.g., 'Cloud', 'AI', 'Architecture'), or explore our topic categories."
          actionText="Browse All Desks"
          actionLink="/blog"
        />
      ) : (
        <EmptyState
          title="Begin your archive exploration"
          message="Type a technology keyword above or explore our curated editorial desks."
          actionText="Browse Complete Archive"
          actionLink="/blog"
        />
      )}
    </div>
  );
};

export default SearchResultsPage;

