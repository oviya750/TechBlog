import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { articlesAPI } from '../../services/api';
import ArticleCard from '../../components/common/ArticleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Search, ArrowLeft } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputVal, setInputVal] = useState(query);

  useEffect(() => {
    const executeSearch = async () => {
      if (!query.trim()) {
        setArticles([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await articlesAPI.getAll({ search: query, limit: 12 });
        if (res.data.success) {
          setArticles(res.data.data);
        }
      } catch (err) {
        console.error('Failed to run search:', err);
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
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
          {articles.length} {articles.length === 1 ? 'dispatch' : 'dispatches'} discovered across
          the technical knowledge base.
        </p>

        {/* Search Input Box */}
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
              placeholder="Refine search query..."
              className="form-input"
              style={{ paddingLeft: '40px', borderRadius: 'var(--radius-pill)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text={`Searching dispatches matching "${query}"...`} />
      ) : articles.length > 0 ? (
        <div className="editorial-grid">
          {articles.map((art) => (
            <ArticleCard key={art._id} article={art} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No articles matched "${query}"`}
          message="Check your spelling, try broader keywords (e.g., 'Cloud', 'AI', 'Architecture'), or explore our topic categories."
          actionText="Browse All Desks"
          actionLink="/blog"
        />
      )}
    </div>
  );
};

export default SearchResultsPage;

