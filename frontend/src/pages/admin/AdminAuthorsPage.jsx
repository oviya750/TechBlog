import React, { useState, useEffect } from 'react';
import { authorsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';

const AdminAuthorsPage = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Technical Staff Writer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: ''
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await authorsAPI.getAll();
      if (res.data.success) {
        setAuthors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load authors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      role: 'Staff Systems Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: ''
    });
    setShowModal(true);
  };

  const openEditModal = (author) => {
    setEditingId(author._id);
    setFormData({
      name: author.name,
      email: author.email || '',
      role: author.role || 'Staff Writer',
      avatar: author.avatar || '',
      bio: author.bio || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await authorsAPI.update(editingId, formData);
        setFeedback({ type: 'success', message: 'Author profile updated.' });
      } else {
        await authorsAPI.create(formData);
        setFeedback({ type: 'success', message: 'Author registered.' });
      }
      setShowModal(false);
      fetchAuthors();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Action failed.' });
    }
  };

  const handleDelete = async (id, name, count) => {
    if (count > 0) {
      alert(`Cannot delete '${name}' because they have ${count} published articles. Reassign articles first.`);
      return;
    }
    if (window.confirm(`Permanently remove author '${name}'?`)) {
      try {
        await authorsAPI.delete(id);
        setAuthors(authors.filter((a) => a._id !== id));
        setFeedback({ type: 'success', message: 'Author removed.' });
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
            Editorial Authors & Fellows
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Manage staff journalists, guest researchers, and technical essayists.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} /> Register Author
        </button>
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

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner text="Fetching authors list..." />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Role</th>
                  <th>Bio</th>
                  <th>Articles</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={author.avatar}
                          alt={author.name}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--color-forest-dark)', display: 'block' }}>
                            {author.name}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                            {author.email || author.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-sage">{author.role}</span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {author.bio || '—'}
                    </td>
                    <td>
                      <strong>{author.articleCount || 0}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(author)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Author"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(author._id, author.name, author.articleCount)}
                          className="btn btn-ghost btn-sm"
                          title="Delete Author"
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
        )}
      </div>

      {/* Author Edit/Create Modal */}
      {showModal && (
        <div className="search-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="search-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--color-forest-dark)' }}>
              {editingId ? 'Edit Author Profile' : 'Register New Editorial Contributor'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Alan Turing"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Professional Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Staff AI Researcher"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@techblog.internal"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Author Biography</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="2-3 sentence biography outlining background, specializations, and interests..."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Profile' : 'Register Contributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthorsPage;

