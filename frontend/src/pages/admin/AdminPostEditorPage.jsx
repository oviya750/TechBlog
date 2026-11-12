import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { articlesAPI, categoriesAPI, authorsAPI, mediaAPI } from '../../services/api';
import RichEditor from '../../components/common/RichEditor';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  Sparkles,
  Search,
  FileText
} from 'lucide-react';

const AdminPostEditorPage = () => {
  const { id } = useParams(); // If present, edit mode; else create mode
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    tags: '',
    featuredImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    featuredImageAlt: 'Technology Article Banner',
    featuredImageCaption: '',
    isFeatured: false,
    isTrending: false,
    status: 'draft',
    scheduledFor: '',
    metaTitle: '',
    metaDescription: '',
    focusKeywords: ''
  });

  useEffect(() => {
    // Fetch categories and authors
    Promise.all([categoriesAPI.getAll(), authorsAPI.getAll()])
      .then(([catRes, authRes]) => {
        if (catRes.data.success) {
          setCategories(catRes.data.data);
          if (!isEditMode && catRes.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, category: catRes.data.data[0]._id }));
          }
        }
        if (authRes.data.success) {
          setAuthors(authRes.data.data);
          if (!isEditMode && authRes.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, author: authRes.data.data[0]._id }));
          }
        }
      })
      .catch((err) => console.error('Error fetching selects:', err));

    // If edit mode, load article by ID
    if (isEditMode) {
      articlesAPI
        .getById(id)
        .then((res) => {
          if (res.data.success) {
            const art = res.data.data;
            setFormData({
              title: art.title || '',
              slug: art.slug || '',
              excerpt: art.excerpt || '',
              content: art.content || '',
              category: art.category?._id || art.category || '',
              author: art.author?._id || art.author || '',
              tags: Array.isArray(art.tags) ? art.tags.join(', ') : '',
              featuredImageUrl: art.featuredImage?.url || '',
              featuredImageAlt: art.featuredImage?.altText || '',
              featuredImageCaption: art.featuredImage?.caption || '',
              isFeatured: !!art.isFeatured,
              isTrending: !!art.isTrending,
              status: art.status || 'draft',
              scheduledFor: art.scheduledFor ? new Date(art.scheduledFor).toISOString().slice(0, 16) : '',
              metaTitle: art.seo?.metaTitle || '',
              metaDescription: art.seo?.metaDescription || '',
              focusKeywords: Array.isArray(art.seo?.focusKeywords) ? art.seo.focusKeywords.join(', ') : ''
            });
          }
        })
        .catch((err) => {
          console.error('Failed to load article:', err);
          setFeedback({ type: 'error', message: 'Failed to retrieve article details.' });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  // Auto-restore draft from sessionStorage on new post creation
  useEffect(() => {
    if (!isEditMode) {
      const cached = sessionStorage.getItem('techblog_create_post_draft');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.title || parsed.content || parsed.excerpt)) {
            setFormData((prev) => ({ ...prev, ...parsed }));
            if (parsed.slug) setIsSlugManuallyEdited(true);
          }
        } catch (err) {
          console.error('Failed to parse cached draft', err);
        }
      }
    }
  }, [isEditMode]);

  // Auto-save form state to sessionStorage on /admin/posts/new
  useEffect(() => {
    if (!isEditMode && (formData.title || formData.content || formData.excerpt)) {
      sessionStorage.setItem('techblog_create_post_draft', JSON.stringify(formData));
    }
  }, [formData, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value
    }));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      // Auto generate slug if slug hasn't been manually customized
      slug: !isEditMode && !isSlugManuallyEdited
        ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug,
      metaTitle: !prev.metaTitle || prev.metaTitle === prev.title ? newTitle : prev.metaTitle
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      setFeedback({ type: 'info', message: 'Uploading asset...' });
      const res = await mediaAPI.upload(data);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, featuredImageUrl: res.data.data.url }));
        setFeedback({ type: 'success', message: 'Image uploaded successfully!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Image upload failed.' });
    }
  };

  const handleSubmit = async (targetStatus) => {
    // Precise field-by-field validation with helpful feedback
    if (!formData.title || !formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Article Title is required.' });
      return;
    }
    if (formData.title.trim().length > 200) {
      setFeedback({ type: 'error', message: 'Article Title cannot exceed 200 characters.' });
      return;
    }
    if (!formData.excerpt || !formData.excerpt.trim()) {
      setFeedback({ type: 'error', message: 'Lead Excerpt / Summary is required.' });
      return;
    }
    if (formData.excerpt.trim().length > 500) {
      setFeedback({ type: 'error', message: 'Summary / Excerpt cannot exceed 500 characters.' });
      return;
    }
    if (!formData.content || !formData.content.trim()) {
      setFeedback({ type: 'error', message: 'Article Content is required.' });
      return;
    }
    if (!formData.category) {
      setFeedback({ type: 'error', message: 'Please select a Category Desk for this article.' });
      return;
    }
    if (!formData.author) {
      setFeedback({ type: 'error', message: 'Please select an Author / Researcher for this article.' });
      return;
    }
    if (targetStatus === 'scheduled' || formData.status === 'scheduled') {
      if (!formData.scheduledFor || new Date(formData.scheduledFor) <= new Date()) {
        setFeedback({ type: 'error', message: 'Please provide a future date and time for scheduled release.' });
        return;
      }
    }

    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });

      const finalStatus = targetStatus || formData.status;

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        category: formData.category,
        author: formData.author,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featuredImage: {
          url: formData.featuredImageUrl,
          altText: formData.featuredImageAlt,
          caption: formData.featuredImageCaption
        },
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        status: finalStatus,
        scheduledFor: finalStatus === 'scheduled' ? new Date(formData.scheduledFor) : null,
        seo: {
          metaTitle: formData.metaTitle || formData.title,
          metaDescription: formData.metaDescription || formData.excerpt,
          focusKeywords: formData.focusKeywords.split(',').map((k) => k.trim()).filter(Boolean)
        }
      };

      if (isEditMode) {
        await articlesAPI.update(id, payload);
        setFeedback({ type: 'success', message: 'Article updated successfully!' });
      } else {
        const res = await articlesAPI.create(payload);
        const created = res.data.data;
        sessionStorage.removeItem('techblog_create_post_draft');
        setFeedback({
          type: 'success',
          message: finalStatus === 'draft'
            ? 'Draft saved to database! Redirecting to editor...'
            : 'Article published successfully!'
        });
        if (finalStatus === 'draft') {
          setTimeout(() => navigate(`/admin/posts/edit/${created._id}`, { replace: true }), 700);
        } else {
          setTimeout(() => navigate('/admin/posts'), 1200);
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error saving article.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading article editor..." />;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/posts" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
            <ArrowLeft size={16} /> Back to Posts
          </Link>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-forest-dark)' }}>
            {isEditMode ? 'Edit Editorial Dispatch' : 'Compose New Dispatch'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="btn btn-secondary"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={16} /> {saving ? 'Publishing...' : 'Publish Dispatch'}
          </button>
        </div>
      </div>

      {feedback.message && (
        <div
          style={{
            backgroundColor:
              feedback.type === 'error'
                ? 'var(--color-error-bg)'
                : feedback.type === 'success'
                ? 'var(--color-success-bg)'
                : 'var(--color-info-bg)',
            color:
              feedback.type === 'error'
                ? 'var(--color-error)'
                : feedback.type === 'success'
                ? 'var(--color-success)'
                : 'var(--color-info)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-sm)'
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Editor Grid: Main Left (A, B, F), Settings Right (C, D, E) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
        {/* Left Column: Core Editorial & Content */}
        <div>
          {/* SECTION A: Article Information */}
          <div className="editor-section-card">
            <div className="editor-section-header">
              <div className="editor-section-title">
                <FileText size={18} color="var(--color-forest)" />
                <span>Article Information</span>
              </div>
              <span className="editor-section-badge">Section A</span>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Article Title *</label>
                <span style={{ fontSize: 'var(--text-xs)', color: formData.title.length > 180 ? 'var(--color-orange)' : 'var(--color-text-light)' }}>
                  {formData.title.length} / 200
                </span>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Asynchronous Agentic Consensus in Distributed Swarms"
                className="form-input"
                style={{ fontSize: '1.25rem', fontWeight: 600 }}
                maxLength={200}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', fontFamily: 'var(--font-code)' }}>
                  /blog/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="article-url-slug"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-code)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Summary / Lead Excerpt *</label>
                <span style={{ fontSize: 'var(--text-xs)', color: formData.excerpt.length > 450 ? 'var(--color-orange)' : 'var(--color-text-light)' }}>
                  {formData.excerpt.length} / 500
                </span>
              </div>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="2-3 sentence technical overview summarizing the core findings or thesis..."
                rows={3}
                className="form-textarea"
                maxLength={500}
                required
              />
            </div>
          </div>

          {/* SECTION B: Content Editor */}
          <div className="editor-section-card">
            <div className="editor-section-header">
              <div className="editor-section-title">
                <Sparkles size={18} color="var(--color-forest)" />
                <span>Content Editor & Live Preview</span>
              </div>
              <span className="editor-section-badge">Section B</span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <RichEditor
                value={formData.content}
                onChange={(newVal) => setFormData((prev) => ({ ...prev, content: newVal }))}
              />
            </div>
          </div>

          {/* SECTION F: SEO & Search Discovery */}
          <div className="editor-section-card">
            <div className="editor-section-header">
              <div className="editor-section-title">
                <Search size={18} color="var(--color-orange)" />
                <span>SEO & Search Discovery</span>
              </div>
              <span className="editor-section-badge">Section F</span>
            </div>

            <div className="form-group">
              <label className="form-label">SEO Title (SERP)</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder={formData.title || 'Optimal 60-character SERP headline'}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="150-160 character snippet for Google search snippets and Open Graph..."
                rows={2}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Focus Keywords (comma-separated)</label>
              <input
                type="text"
                name="focusKeywords"
                value={formData.focusKeywords}
                onChange={handleChange}
                placeholder="Distributed Systems, Consensus, Kafka, Kubernetes"
                className="form-input"
              />
            </div>

            {/* Live Google SERP Snippet Preview */}
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: 'var(--border-subtle)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                Live Google SERP Snippet Preview
              </div>
              <div className="google-serp-preview">
                <div className="serp-url">
                  <span className="serp-url-badge">Search Result</span>
                  <span>https://techblog.internal › blog › {formData.slug || 'article-slug'}</span>
                </div>
                <div className="serp-title">
                  {formData.metaTitle || formData.title || 'Optimal Article Title — TechBlog'}
                </div>
                <div className="serp-desc">
                  {formData.metaDescription || formData.excerpt || 'Concise article description and summary that will appear in search results...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Publishing Sidebar Settings (C, D, E) */}
        <div>
          {/* SECTION C: Publishing Settings */}
          <div className="editor-section-card">
            <div className="editor-section-header">
              <div className="editor-section-title">
                <Calendar size={18} color="var(--color-forest)" />
                <span>Publishing Settings</span>
              </div>
              <span className="editor-section-badge">Section C</span>
            </div>

            <div className="form-group">
              <label className="form-label">Publication State</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
                <option value="scheduled">Scheduled (Future Date)</option>
              </select>
            </div>

            {formData.status === 'scheduled' && (
              <div className="form-group">
                <label className="form-label">Scheduled Release Date & Time</label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            )}

            <div style={{ margin: 'var(--space-4) 0', borderTop: 'var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Featured on Homepage</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={formData.isTrending}
                  onChange={handleChange}
                />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Mark as Trending Dispatch</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: 'var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={saving}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                <Save size={14} /> Publish
              </button>
            </div>
          </div>

          {/* SECTION D: Taxonomy */}
          <div className="editor-section-card">
            <div className="editor-section-header">
              <div className="editor-section-title">
                <Eye size={18} color="var(--color-forest)" />
                <span>Taxonomy & Desks</span>
              </div>
              <span className="editor-section-badge">Section D</span>
            </div>

            <div className="form-group">
              <label className="form-label">Category Desk *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Author / Researcher *</label>
              <select
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Author</option>
                {authors.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="AI, Architecture, Microservices"
                className="form-input"
              />
            </div>
          </div>

          {/* SECTION E: Media */}
          <div className="editor-section-card">
            <div className="editor-section-header">
              <div className="editor-section-title">
                <ImageIcon size={18} color="var(--color-forest)" />
                <span>Featured Media Asset</span>
              </div>
              <span className="editor-section-badge">Section E</span>
            </div>

            {formData.featuredImageUrl && (
              <div style={{ height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-3)', border: '1px solid rgba(7,63,50,0.1)' }}>
                <img
                  src={formData.featuredImageUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="text"
                name="featuredImageUrl"
                value={formData.featuredImageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="form-input"
                style={{ fontSize: 'var(--text-xs)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload New Banner</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ fontSize: 'var(--text-xs)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alt Text</label>
              <input
                type="text"
                name="featuredImageAlt"
                value={formData.featuredImageAlt}
                onChange={handleChange}
                placeholder="Descriptive image text"
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Image Caption</label>
              <input
                type="text"
                name="featuredImageCaption"
                value={formData.featuredImageCaption}
                onChange={handleChange}
                placeholder="Editorial caption displayed under image"
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPostEditorPage;

