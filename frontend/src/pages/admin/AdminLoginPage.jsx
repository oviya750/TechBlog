import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Terminal, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@techblog.internal');
    setPassword('AdminPassword2026!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-warm-ivory)',
        padding: '2rem 1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--color-white)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-10) var(--space-8)',
          boxShadow: 'var(--shadow-lg)',
          border: 'var(--border-subtle)'
        }}
      >
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div
            className="brand-symbol"
            style={{ width: '48px', height: '48px', margin: '0 auto var(--space-4) auto' }}
          >
            <Terminal size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
            Staff Editorial Console
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            TechBlog Content Management & Publishing System
          </p>
        </div>

        {error && (
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
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)'
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@techblog.internal"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)'
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Credentials Quick Fill Helper */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--color-sage-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(77, 155, 112, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="var(--color-sage-dark)" /> Demo Admin Account
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '0.2rem 0.5rem' }}
            >
              Fill Credentials
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <strong>Email:</strong> admin@techblog.internal<br />
            <strong>Password:</strong> AdminPassword2026!
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest)' }}>
            ← Return to public journal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
