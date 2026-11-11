import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit, Trash2, FolderPlus, CheckCircle, AlertCircle } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#073F32',
    icon: 'Folder'
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesAPI.getAll();
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', color: '#073F32', icon: 'Folder' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#073F32',
      icon: cat.icon || 'Folder'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await categoriesAPI.update(editingId, formData);
        setFeedback({ type: 'success', message: 'Category desk updated.' });
      } else {
        await categoriesAPI.create(formData);
        setFeedback({ type: 'success', message: 'Category desk established.' });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Action failed.'
      });
    }
  };

  const handleDelete = async (id, name, count) => {
    if (count > 0) {
      alert(`Cannot delete '${name}' because it contains ${count} published articles. Reassign them first.`);
      return;
    }
    if (window.confirm(`Permanently remove category '${name}'?`)) {
      try {
        await categoriesAPI.delete(id);
        setCategories(categories.filter((c) => c._id !== id));
        setFeedback({ type: 'success', message: 'Category deleted.' });
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
            Category Desks & Taxonomies
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Organize dispatches into editorial sections across the publication.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} /> New Category
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
          <LoadingSpinner text="Fetching categories..." />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '20px' }}>Color</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Articles</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          backgroundColor: cat.color || 'var(--color-forest)'
                        }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-forest-dark)' }}>{cat.name}</strong>
                    </td>
                    <td>
                      <code style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ maxWidth: '320px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {cat.description || '—'}
                    </td>
                    <td>
                      <span className="badge badge-sage">{cat.articleCount || 0}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Category"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name, cat.articleCount)}
                          className="btn btn-ghost btn-sm"
                          title="Delete Category"
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

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="search-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="search-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--color-forest-dark)' }}>
              {editingId ? 'Edit Category Desk' : 'Create New Category Desk'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Distributed Systems"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Desk Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of articles covered by this editorial desk..."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Theme Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{ height: '42px', width: '100%', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Icon Name</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="form-select"
                  >
                    <option value="Code2">Code (Software)</option>
                    <option value="Cpu">CPU (AI/ML)</option>
                    <option value="Smartphone">Smartphone (Mobile)</option>
                    <option value="Sparkles">Sparkles (Innovation)</option>
                    <option value="ShieldCheck">Shield (Cybersecurity)</option>
                    <option value="Cloud">Cloud (Infrastructure)</option>
                    <option value="TrendingUp">Trending (Insights)</option>
                    <option value="Folder">Folder (General)</option>
                  </select>
                </div>
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
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;

