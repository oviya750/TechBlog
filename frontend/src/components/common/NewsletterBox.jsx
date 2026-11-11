import React, { useState } from 'react';
import { publicAPI } from '../../services/api';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const NewsletterBox = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please provide a valid engineering or work email address.');
      return;
    }

    try {
      setStatus('loading');
      const res = await publicAPI.subscribeNewsletter({ email });
      setStatus('success');
      setMessage(res.data.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Subscription failed. Please try again.');
    }
  };

  return (
    <section className="newsletter-banner">
      <div className="newsletter-content">
        <span className="badge badge-peach" style={{ marginBottom: '1rem' }}>
          Weekly Engineering Brief
        </span>
        <h2>Curated System Architectures Delivered to Your Inbox</h2>
        <p>
          Join 42,000+ senior engineers, CTOs, and technical researchers who read our Sunday morning
          deep dives into distributed consensus, compiler design, and frontier AI.
        </p>

        {status === 'success' ? (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-peach)',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={24} />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-form-inline">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email address..."
              className="newsletter-input"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="btn btn-peach"
              disabled={status === 'loading'}
              style={{ padding: '0.85rem 1.8rem', fontSize: 'var(--text-base)' }}
            >
              {status === 'loading' ? 'Joining...' : 'Subscribe Free'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div
            style={{
              color: '#ffcdd2',
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'var(--text-sm)'
            }}
          >
            <AlertCircle size={16} /> {message}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsletterBox;
