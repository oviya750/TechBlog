import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI, categoriesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
  FileEdit
} from 'lucide-react';

const AdminPostsPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        allStatus: 'true',
        page,
        limit: 10
      };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      const res = await articlesAPI.getAll(params);
      if (res.data.success) {
        setArticles(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoriesAPI.getAll().then((res) => {
      if (res.data.success) setCategories(res.data.data);
    });
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, categoryFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        await articlesAPI.delete(id);
        setArticles(articles.filter((a) => a._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete article.');
      }
    }
  };

  const handleToggleFeatured = async (art) => {
    try {
      const res = await articlesAPI.update(art._id, { isFeatured: !art.isFeatured });
      if (res.data.success) {
        setArticles(articles.map((a) => (a._id === art._id ? { ...a, isFeatured: !a.isFeatured } : a)));
      }
    } catch (err) {
      alert('Failed to update featured flag');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
            Article Archives & Editorial Pipeline
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Manage drafts, schedule future publications, and edit published dispatches.
          </p>
        </div>

        <Link to="/admin/posts/new" className="btn btn-primary">
          <Plus size={16} /> Compose New Article
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['', 'published', 'draft', 'scheduled'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {st || 'All Posts'}
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '520px', justifyContent: 'flex-end' }}>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ width: '180px', padding: '0.45rem 0.8rem', fontSize: 'var(--text-xs)' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ padding: '0.45rem 0.8rem', fontSize: 'var(--text-xs)' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                <Search size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner text="Loading articles index..." />
        ) : articles.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Feat</th>
                  <th>Title & Slug</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => (
                  <tr key={art._id}>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(art)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: art.isFeatured ? 'var(--color-orange)' : 'rgba(7, 63, 50, 0.2)'
                        }}
                        title={art.isFeatured ? 'Featured on homepage' : 'Mark as featured'}
                      >
                        <Star size={16} fill={art.isFeatured ? 'var(--color-orange)' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>{art.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-light)', fontFamily: 'var(--font-code)' }}>
                        /blog/{art.slug}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-sage">{art.category?.name || 'Tech'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img
                          src={art.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={art.author?.name}
                          style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                        />
                        <span style={{ fontSize: '13px' }}>{art.author?.name || 'Staff'}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            art.status === 'published'
                              ? '#e8f5e9'
                              : art.status === 'scheduled'
                              ? '#e3f2fd'
                              : 'var(--color-peach-light)',
                          color:
                            art.status === 'published'
                              ? '#2e7d32'
                              : art.status === 'scheduled'
                              ? '#0288d1'
                              : '#a04910'
                        }}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td>{art.viewsCount || 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {art.status === 'published' && (
                          <Link
                            to={`/blog/${art.slug}`}
                            target="_blank"
                            className="btn btn-ghost btn-sm"
                            title="Preview public view"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        <Link
                          to={`/admin/posts/edit/${art._id}`}
                          className="btn btn-secondary btn-sm"
                          title="Edit dispatch"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(art._id, art.title)}
                          className="btn btn-ghost btn-sm"
                          title="Delete article"
                          style={{ color: 'var(--color-error)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No articles found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPostsPage;
