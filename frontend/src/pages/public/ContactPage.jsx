import React, { useState } from 'react';
import { publicAPI } from '../../services/api';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus('error');
      setFeedback('Please complete all fields before sending.');
      return;
    }

    try {
      setStatus('loading');
      const res = await publicAPI.submitContact(formData);
      setStatus('success');
      setFeedback(res.data.message || 'Thank you! Your message has been received.');
      setFormData({
        name: '',
        email: '',
        category: 'General Inquiry',
        subject: '',
        message: ''
      });
    } catch (err) {
      setStatus('error');
      setFeedback(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto var(--space-12) auto', textAlign: 'center' }}>
        <div className="kicker" style={{ justifyContent: 'center' }}>
          Get in Touch
        </div>
        <h1 style={{ fontSize: '3.2rem', marginBottom: 'var(--space-3)' }}>
          Contact Editorial & Research Staff
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          Have a correction, an architectural case study to pitch, or a partnership inquiry?
          Reach our editorial desk directly.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: 'var(--space-12)',
          maxWidth: '1040px',
          margin: '0 auto'
        }}
      >
        {/* Contact Info Sidebar */}
        <div
          style={{
            background: 'var(--color-forest)',
            color: 'var(--color-white)',
            padding: 'var(--space-8)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span className="badge badge-peach" style={{ marginBottom: '1.5rem' }}>
              Editorial Bureau
            </span>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1.8rem', marginBottom: 'var(--space-4)' }}>
              Direct Lines
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '2rem' }}>
              We review technical pitches on Tuesdays and Thursdays. For security vulnerabilities or
              embargoed research, please tag your subject line with [EMBARGO].
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} color="var(--color-peach)" />
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)' }}>Editorial Queries</div>
                  <div style={{ fontWeight: 600 }}>editors@techblog.internal</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={20} color="var(--color-peach)" />
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)' }}>Headquarters</div>
                  <div style={{ fontWeight: 600 }}>TechBlog Media, Engineering Hub 4</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '2rem' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>
              Response latency SLA: &lt; 24 business hours.
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div
          style={{
            background: 'var(--color-white)',
            padding: 'var(--space-8)',
            borderRadius: 'var(--radius-2xl)',
            border: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {status === 'success' ? (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <CheckCircle2 size={54} color="var(--color-success)" />
              <h3 style={{ fontSize: '1.6rem', color: 'var(--color-forest-dark)' }}>
                Inquiry Dispatched!
              </h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{feedback}</p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {status === 'error' && (
                <div
                  style={{
                    backgroundColor: 'var(--color-error-bg)',
                    color: 'var(--color-error)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <AlertCircle size={16} /> {feedback}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ada Lovelace"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ada@company.com"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Department</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option>General Inquiry</option>
                  <option>Editorial Pitch</option>
                  <option>Partnership</option>
                  <option>Corrections</option>
                  <option>Technical Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Summary of your inquiry or paper topic..."
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Details *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Provide context, references, or your proposal..."
                  rows={5}
                  className="form-textarea"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === 'loading'}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                <Send size={16} />
                <span>{status === 'loading' ? 'Dispatching...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

