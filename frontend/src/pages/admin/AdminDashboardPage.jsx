import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FileText,
  CheckCircle,
  Clock,
  FileEdit,
  FolderTree,
  Eye,
  Plus,
  ArrowRight,
  TrendingUp,
  Image,
  Calendar
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI
      .getDashboard()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load dashboard metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing editorial metrics..." />;
  }

  const summary = stats?.summary || {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledArticles: 0,
    totalCategories: 0,
    totalViews: 0
  };

  const recentArticles = stats?.recentArticles || [];
  const topArticles = stats?.topArticles || [];

  return (
    <div>
      {/* Top Welcome & Actions Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
            Publication Overview
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Real-time analytics and publication status across all engineering desks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/posts/new" className="btn btn-primary">
            <Plus size={16} /> New Article
          </Link>
          <Link to="/admin/media" className="btn btn-secondary">
            <Image size={16} /> Media Assets
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="metric-cards-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)' }}>
            <FileText size={26} />
          </div>
          <div>
            <div className="metric-val">{summary.totalArticles}</div>
            <div className="metric-label">Total Articles</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
            <CheckCircle size={26} />
          </div>
          <div>
            <div className="metric-val">{summary.publishedArticles}</div>
            <div className="metric-label">Published</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange)' }}>
            <FileEdit size={26} />
          </div>
          <div>
            <div className="metric-val">{summary.draftArticles}</div>
            <div className="metric-label">Drafts in Progress</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: '#e3f2fd', color: '#0288d1' }}>
            <Clock size={26} />
          </div>
          <div>
            <div className="metric-val">{summary.scheduledArticles}</div>
            <div className="metric-label">Scheduled</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}>
            <FolderTree size={26} />
          </div>
          <div>
            <div className="metric-val">{summary.totalCategories}</div>
            <div className="metric-label">Active Desks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: '#fff3e0', color: '#ef6c00' }}>
            <Eye size={26} />
          </div>
          <div>
            <div className="metric-val">{summary.totalViews.toLocaleString()}</div>
            <div className="metric-label">Total Readers</div>
          </div>
        </div>
      </div>

      {/* 2 Column Section: Recent Posts & Top Performing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-8)' }}>
        {/* Recent Posts Table */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
              Recent Dispatches
            </h3>
            <Link to="/admin/posts" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-forest)' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((art) => (
                  <tr key={art._id}>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {art.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                        by {art.author?.name || 'Staff'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-sage">{art.category?.name || 'Tech'}</span>
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
                    <td>
                      <Link
                        to={`/admin/posts/edit/${art._id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '12px' }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Articles */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <TrendingUp size={20} color="var(--color-orange)" />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
              Most Read Articles
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topArticles.map((art, index) => (
              <div
                key={art._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: index < topArticles.length - 1 ? '1px solid rgba(7, 63, 50, 0.06)' : 'none'
                }}
              >
                <div>
                  <Link
                    to={`/blog/${art.slug}`}
                    target="_blank"
                    style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-forest-dark)', display: 'block' }}
                  >
                    {art.title}
                  </Link>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {art.category?.name} • {art.readTimeMinutes} min
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                    {art.viewsCount?.toLocaleString() || 0}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                    Views
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
