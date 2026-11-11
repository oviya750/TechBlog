import React, { useState, useEffect } from 'react';
import { articlesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CalendarClock, CheckCircle, Edit, Play, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminScheduledPage = () => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchScheduled = async () => {
    try {
      setLoading(true);
      const res = await articlesAPI.getAll({ allStatus: 'true', status: 'scheduled' });
      if (res.data.success) {
        setScheduledPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, []);

  const handlePublishNow = async (post) => {
    try {
      await articlesAPI.update(post._id, { status: 'published', publishedAt: new Date() });
      setMessage(`"${post.title}" has been published immediately!`);
      setScheduledPosts(scheduledPosts.filter((p) => p._id !== post._id));
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert('Failed to publish post immediately.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
          Scheduled Publications Queue
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Articles staged for automatic embargo release at predetermined dates and times.
        </p>
      </div>

      {message && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle size={16} />
          <span>{message}</span>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner text="Querying scheduled publishing queue..." />
        ) : scheduledPosts.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Article Title</th>
                  <th>Desk</th>
                  <th>Author</th>
                  <th>Scheduled Release</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledPosts.map((post) => (
                  <tr key={post._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-sage">{post.category?.name}</span>
                    </td>
                    <td>{post.author?.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-forest)' }}>
                        <Clock size={14} />
                        <strong>
                          {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString() : 'Date Pending'}
                        </strong>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handlePublishNow(post)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '12px' }}
                        >
                          <Play size={12} /> Publish Now
                        </button>
                        <Link
                          to={`/admin/posts/edit/${post._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <CalendarClock size={44} color="var(--color-sage)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
              No Scheduled Dispatches
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              When composing an article, select 'Scheduled' to stage future embargo releases.
            </p>
            <Link to="/admin/posts/new" className="btn btn-primary btn-sm">
              Compose Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScheduledPage;
