import React, { useState, useEffect } from 'react';
import { tagsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Tags, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const AdminTagsPage = () => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await tagsAPI.getAll();
      if (res.data.success) {
        setTags(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const res = await tagsAPI.create({ name: newTagName.trim() });
      if (res.data.success) {
        setNewTagName('');
        setFeedback({ type: 'success', message: 'Tag added successfully.' });
        fetchTags();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to add tag.' });
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete tag '#${name}'?`)) {
      try {
        await tagsAPI.delete(id);
        setTags(tags.filter((t) => t._id !== id));
        setFeedback({ type: 'success', message: 'Tag removed.' });
      } catch (err) {
        alert('Failed to delete tag.');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
          Article Tags & Focus Terms
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Manage granular keywords and index terms referenced across articles.
        </p>
      </div>

      {feedback.message && (
        <div
          style={{
            backgroundColor: feedback.type === 'error' ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
            color: feedback.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Quick Add Tag Card */}
      <div className="admin-card">
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-3)' }}>
          Quick Add Tag
        </h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', maxWidth: '480px' }}>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="e.g. WebAssembly, ZeroTrust, GraphQL"
            className="form-input"
            required
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Add Tag
          </button>
        </form>
      </div>

      {/* Tags Cloud / Table */}
      <div className="admin-card">
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-4)' }}>
          All Registered Tags ({tags.length})
        </h3>

        {loading ? (
          <LoadingSpinner text="Loading tags..." />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {tags.map((tag) => (
              <div
                key={tag._id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-ivory-light)',
                  border: 'var(--border-default)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.4rem 0.9rem',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>#{tag.name}</span>
                {tag.count > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      background: 'var(--color-sage-light)',
                      color: 'var(--color-sage-dark)',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}
                  >
                    {tag.count}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(tag._id, tag.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-light)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Remove tag"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTagsPage;

