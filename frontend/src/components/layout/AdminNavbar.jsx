import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, Shield } from 'lucide-react';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="admin-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
          Editorial Management Console
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/admin/posts/new" className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>New Article</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            }
            alt={user?.name || 'Admin'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-pill)',
              objectFit: 'cover',
              border: '1.5px solid var(--color-sage)'
            }}
          />
          <div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-forest-dark)',
                lineHeight: 1.2
              }}
            >
              {user?.name || 'Editorial Director'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-sage-dark)',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              {user?.role || 'Admin'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          title="Sign out of editorial console"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;

