import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderTree,
  Tags,
  Users,
  Image,
  CalendarClock,
  SearchCheck,
  Settings,
  ExternalLink,
  Terminal
} from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'All Posts', path: '/admin/posts', icon: FileText },
    { label: 'Create Post', path: '/admin/posts/new', icon: PlusCircle },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Tags', path: '/admin/tags', icon: Tags },
    { label: 'Authors', path: '/admin/authors', icon: Users },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'Scheduled Posts', path: '/admin/scheduled', icon: CalendarClock },
    { label: 'SEO Management', path: '/admin/seo', icon: SearchCheck },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="brand-symbol" style={{ width: '34px', height: '34px' }}>
            <Terminal size={18} />
          </div>
          <div>
            <div style={{ color: 'var(--color-white)', fontWeight: 800, fontSize: '1.15rem' }}>
              TechBlog
            </div>
            <div style={{ color: 'var(--color-peach)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              CMS Editorial
            </div>
          </div>
        </Link>
      </div>

      <ul className="admin-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="admin-nav-item">
              <NavLink to={item.path} end={item.end}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Link
          to="/"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--color-white)',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <span>View Public Site</span>
          <ExternalLink size={14} />
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
