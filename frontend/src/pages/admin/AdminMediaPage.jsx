import React, { useState, useEffect } from 'react';
import { mediaAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Upload, Copy, Check, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

const AdminMediaPage = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [notification, setNotification] = useState('');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await mediaAPI.getAll();
      if (res.data.success) {
        setMediaList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      setUploading(true);
      const res = await mediaAPI.upload(data);
      if (res.data.success) {
        setNotification('Asset successfully uploaded!');
        setTimeout(() => setNotification(''), 3000);
        fetchMedia();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url, id) => {
    // If relative path, prefix origin
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
            Media Asset Library
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Upload, inspect, and copy image assets for article headers and inline editorial figures.
          </p>
        </div>

        <div>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            <span>{uploading ? 'Uploading...' : 'Upload Media Asset'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {notification && (
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
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading media assets..." />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-6)'
          }}
        >
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="card-editorial"
              style={{ overflow: 'hidden', padding: 0 }}
            >
              <div style={{ height: '170px', position: 'relative', backgroundColor: 'var(--color-warm-ivory)' }}>
                <img
                  src={item.url}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className="badge badge-forest"
                  style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px' }}
                >
                  {item.storage}
                </span>
              </div>

              <div style={{ padding: 'var(--space-4)' }}>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--color-forest-dark)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 'var(--space-2)'
                  }}
                  title={item.name}
                >
                  {item.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                    {Math.round(item.size / 1024)} KB
                  </span>

                  <button
                    onClick={() => copyUrl(item.url, item.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.3rem 0.65rem', fontSize: '11px' }}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={12} color="var(--color-success)" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMediaPage;

