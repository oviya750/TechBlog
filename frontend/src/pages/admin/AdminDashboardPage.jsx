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
  Calendar,
  Users,
  Mail,
  Activity
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
          <div className="metric-icon-box" style={{ backgroundColor: '#e0f2f1', color: '#00695c' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="metric-val">{summary.totalAuthors || 0}</div>
            <div className="metric-label">Total Authors</div>
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

      {/* Useful Dashboard Activity Information Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-white)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
          marginBottom: 'var(--space-8)',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--color-sage)" />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-forest-dark)' }}>
            Publication Live Activity:
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            All systems operational • Persistent MongoDB storage active
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: 'var(--text-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} color="var(--color-orange)" />
            <span style={{ color: 'var(--color-text-muted)' }}>Subscribers:</span>
            <strong style={{ color: 'var(--color-forest-dark)' }}>{summary.totalSubscribers || 0}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Unread Inquiries:</span>
            <strong style={{ color: summary.unreadContacts > 0 ? 'var(--color-orange)' : 'var(--color-forest-dark)' }}>
              {summary.unreadContacts || 0}
            </strong>
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
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {art.status === 'published' && (
                          <Link
                            to={`/blog/${art.slug}`}
                            target="_blank"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                            title="Preview public view"
                          >
                            <Eye size={13} />
                          </Link>
                        )}
                        <Link
                          to={`/admin/posts/edit/${art._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '12px' }}
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Articles */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--color-orange)" />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                Most Read Articles
              </h3>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', fontWeight: 600 }}>
              All-Time Views
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topArticles.map((art, index) => {
              const maxViews = Math.max(...topArticles.map((a) => a.viewsCount || 1), 1);
              const percentage = Math.round(((art.viewsCount || 0) / maxViews) * 100);

              return (
                <div
                  key={art._id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-ivory-light)',
                    border: '1px solid rgba(7, 63, 50, 0.05)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: index === 0 ? 'var(--color-orange)' : 'var(--color-sage)',
                          lineHeight: 1.2
                        }}
                      >
                        0{index + 1}
                      </span>
                      <div>
                        <Link
                          to={`/blog/${art.slug}`}
                          target="_blank"
                          style={{
                            fontWeight: 600,
                            fontSize: '0.925rem',
                            color: 'var(--color-forest-dark)',
                            display: 'block',
                            lineHeight: 1.35
                          }}
                        >
                          {art.title}
                        </Link>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                          {art.category?.name} • {art.readTimeMinutes || 5} min read
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: 'var(--color-forest)', fontSize: '1rem' }}>
                        {art.viewsCount?.toLocaleString() || 0}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        readers
                      </div>
                    </div>
                  </div>

                  {/* Visual Reader Volume Bar */}
                  <div
                    style={{
                      height: '4px',
                      backgroundColor: 'rgba(7, 63, 50, 0.08)',
                      borderRadius: '2px',
                      marginTop: '0.65rem',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: index === 0 ? 'var(--color-orange)' : 'var(--color-sage)',
                        borderRadius: '2px',
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

