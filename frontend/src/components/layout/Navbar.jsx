import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Menu,
  X,
  Compass,
  Lock,
  ArrowRight,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { articlesAPI, categoriesAPI } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load categories for navigation dropdown
    categoriesAPI
      .getAll()
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  // Debounced search for the modal
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await articlesAPI.getAll({ search: searchQuery, limit: 5 });
        if (res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchModalOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          {/* Logo */}
          <Link to="/" className="brand-logo">
            <div className="brand-symbol">
              <Terminal size={22} strokeWidth={2.4} />
            </div>
            <div className="brand-name">
              TechBlog<span className="brand-dot">.</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav>
            <ul className="nav-links">
              <li className="nav-item">
                <NavLink to="/" end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/blog">All Articles</NavLink>
              </li>
              <li className="nav-item" style={{ position: 'relative' }}>
                <NavLink to="/category/software-development">Categories</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about">About</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact">Contact</NavLink>
              </li>
            </ul>
          </nav>

          {/* Actions: Search Trigger & Admin Button */}
          <div className="nav-actions">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="search-trigger-btn"
              title="Search articles"
              aria-label="Search articles"
            >
              <Search size={14} />
              <span>Search articles...</span>
              <kbd
                style={{
                  background: 'var(--color-warm-ivory)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '10px'
                }}
              >
                /
              </kbd>
            </button>

            {isAuthenticated ? (
              <Link to="/admin" className="btn btn-primary btn-sm">
                <Compass size={14} />
                <span>Editorial Admin</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="btn btn-outline btn-sm"
                title="Staff & Admin Portal"
              >
                <Lock size={13} />
                <span>Admin Login</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--color-warm-ivory)',
              borderBottom: 'var(--border-default)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="search-trigger-btn"
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Search size={16} />
              <span>Search articles...</span>
            </button>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, padding: '0.5rem 0' }}
            >
              Home
            </Link>
            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, padding: '0.5rem 0' }}
            >
              All Articles
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, padding: '0.5rem 0' }}
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: 600, padding: '0.5rem 0' }}
            >
              Contact
            </Link>

            <div style={{ paddingTop: '0.5rem', borderTop: 'var(--border-subtle)' }}>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.5rem'
                }}
              >
                Popular Categories
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="badge badge-sage"
                    style={{ textDecoration: 'none' }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Interactive Search Modal */}
      {searchModalOpen && (
        <div
          className="search-modal-backdrop"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="search-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="search-modal-header">
              <Search size={22} color="var(--color-forest)" />
              <input
                type="text"
                autoFocus
                placeholder="Search topics, architecture patterns, AI frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-modal-input"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-light)'
                }}
              >
                <X size={20} />
              </button>
            </form>

            <div className="search-modal-results">
              {searching && (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Searching publication archives...
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchResults.map((art) => (
                    <Link
                      key={art._id}
                      to={`/blog/${art.slug}`}
                      onClick={() => setSearchModalOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-ivory-light)',
                        textDecoration: 'none'
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--color-forest-dark)',
                            fontSize: '0.95rem'
                          }}
                        >
                          {art.title}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {art.category?.name} • {art.readTimeMinutes} min read
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--color-orange)" />
                    </Link>
                  ))}
                  <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-orange)' }}
                    >
                      View all matching results <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No published dispatches matched "<strong>{searchQuery}</strong>".
                </div>
              )}

              {!searchQuery && (
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-text-light)',
                      marginBottom: '0.75rem'
                    }}
                  >
                    Quick Topic Exploration
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {categories.map((c) => (
                      <Link
                        key={c._id}
                        to={`/category/${c.slug}`}
                        onClick={() => setSearchModalOpen(false)}
                        className="badge badge-sage"
                        style={{ textDecoration: 'none' }}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
