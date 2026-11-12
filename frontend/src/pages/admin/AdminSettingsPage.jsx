import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { settingsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'TechBlog',
    tagline: 'The Engineering & Technology Editorial',
    readingSpeedWpm: 200,
    twitterUrl: 'https://twitter.com/techblog',
    githubUrl: 'https://github.com/techblog',
    linkedinUrl: 'https://linkedin.com/company/techblog',
    enableComments: false,
    enableNewsletterPopup: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    settingsAPI
      .get()
      .then((res) => {
        if (res.data.success && res.data.data) {
          const s = res.data.data;
          setSettings({
            siteName: s.siteName || 'TechBlog',
            tagline: s.tagline || 'The Engineering & Technology Editorial',
            readingSpeedWpm: s.readingSpeedWpm || 200,
            twitterUrl: s.twitterUrl || '',
            githubUrl: s.githubUrl || '',
            linkedinUrl: s.linkedinUrl || '',
            enableComments: !!s.enableComments,
            enableNewsletterPopup: s.enableNewsletterPopup !== false
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });
      await settingsAPI.update(settings);
      setFeedback({ type: 'success', message: 'Platform settings updated and persisted to database!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading publication preferences from database..." />;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
          Platform Settings
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Configure global publishing parameters, social channel links, and editorial defaults.
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
          {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-4)' }}>
            General Publication Info
          </h3>

          <div className="form-group">
            <label className="form-label">Publication Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Editorial Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reading Speed (Words Per Minute)</label>
            <input
              type="number"
              value={settings.readingSpeedWpm}
              onChange={(e) => setSettings({ ...settings, readingSpeedWpm: parseInt(e.target.value, 10) || 200 })}
              className="form-input"
              style={{ maxWidth: '200px' }}
              min={100}
              max={400}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
              Standard technical reading pace is 180-220 words per minute.
            </span>
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-4)' }}>
            Official Social Accounts
          </h3>

          <div className="form-group">
            <label className="form-label">Twitter / X URL</label>
            <input
              type="url"
              value={settings.twitterUrl}
              onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Repository URL</label>
            <input
              type="url"
              value={settings.githubUrl}
              onChange={(e) => setSettings({ ...settings, githubUrl: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">LinkedIn Organization URL</label>
            <input
              type="url"
              value={settings.linkedinUrl}
              onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.85rem 1.8rem' }}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Platform Settings'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
