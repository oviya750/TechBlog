import React, { useState } from 'react';
import { SearchCheck, ExternalLink, Globe, FileCode, CheckCircle } from 'lucide-react';

const AdminSeoPage = () => {
  const [siteTitle, setSiteTitle] = useState('TechBlog — Insights in Software, AI, Cloud & Engineering');
  const [siteDesc, setSiteDesc] = useState(
    'A curated technology publication covering modern software engineering, artificial intelligence, cloud architectures, cybersecurity, and emerging industry paradigms.'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
          SEO & Search Engine Indexing
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Configure global metadata, search previews, structured data schema, and sitemap protocols.
        </p>
      </div>

      {saved && (
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
          <span>SEO settings updated successfully!</span>
        </div>
      )}

      {/* Live Index Endpoints Links */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileCode size={18} color="var(--color-orange)" /> Dynamic XML Sitemap
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Auto-generated XML sitemap containing all published articles and categories.
            </div>
          </div>
          <a
            href="/api/seo/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            Open XML <ExternalLink size={12} />
          </a>
        </div>

        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={18} color="var(--color-forest)" /> Crawler Directive (robots.txt)
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Directs Googlebot and search spiders to index public articles while protecting /admin.
            </div>
          </div>
          <a
            href="/api/seo/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            Open robots.txt <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-8)' }}>
        {/* Settings Form */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-4)' }}>
            Default Metadata
          </h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Global Default Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Global Meta Description</label>
              <textarea
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                rows={4}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Canonical Domain URL</label>
              <input
                type="text"
                defaultValue="https://techblog.internal"
                className="form-input"
                readOnly
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Save SEO Configuration
            </button>
          </form>
        </div>

        {/* Live Google Search Snippet Preview Simulator */}
        <div>
          <div className="admin-card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-4)' }}>
              Google SERP Result Preview
            </h3>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #dfe1e5',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'arial, sans-serif'
              }}
            >
              <div style={{ fontSize: '14px', color: '#202124', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600 }}>TechBlog</span>
                <span style={{ color: '#5f6368', fontSize: '12px' }}>https://techblog.internal › blog</span>
              </div>
              <div
                style={{
                  color: '#1a0dab',
                  fontSize: '20px',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginTop: '4px',
                  cursor: 'pointer'
                }}
              >
                {siteTitle}
              </div>
              <div
                style={{
                  color: '#4d5156',
                  fontSize: '14px',
                  lineHeight: 1.58,
                  marginTop: '4px'
                }}
              >
                {siteDesc}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              <strong>Schema.org Markup:</strong> Automatic <code>BlogPosting</code> and <code>TechArticle</code> JSON-LD schemas are generated for every individual blog post.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSeoPage;
