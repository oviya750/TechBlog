import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Menu,
  X,
  Compass,
  Lock,
  ArrowRight,
  Terminal,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { articlesAPI, categoriesAPI } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState([]);

  const dropdownRef = useRef(null);

  // Mutually exclusive active state resolution
  const isHomeActive = pathname === '/';
  const isArticlesActive =
    !pathname.startsWith('/admin') &&
    (pathname === '/blog' || (pathname.startsWith('/blog/') && !pathname.startsWith('/blog/category')));
  const isCategoriesActive =
    !pathname.startsWith('/admin') &&
    (pathname.startsWith('/category/') || pathname === '/category' || pathname === '/categories');
  const isAboutActive =
    !pathname.startsWith('/admin') && (pathname === '/about' || pathname.startsWith('/about/'));
  const isContactActive =
    !pathname.startsWith('/admin') && (pathname === '/contact' || pathname.startsWith('/contact/'));

  // Close dropdown and mobile drawer on route navigation
  useEffect(() => {
    setCategoryDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close category dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    if (categoryDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [categoryDropdownOpen]);

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

  // Global keyboard shortcuts: "/" or "Ctrl+K" / "Cmd+K" to open search; "Escape" to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      const isInputActive =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) ||
        document.activeElement?.isContentEditable;

      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
        return;
      }

      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        !isInputActive
      ) {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

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
                <Link to="/" className={`nav-link ${isHomeActive ? 'active' : ''}`}>
                  <span className="nav-label">Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/blog" className={`nav-link ${isArticlesActive ? 'active' : ''}`}>
                  <span className="nav-label">All Articles</span>
                </Link>
              </li>
              <li
                ref={dropdownRef}
                className="nav-item has-dropdown"
                style={{ position: 'relative' }}
                onMouseEnter={() => setCategoryDropdownOpen(true)}
                onMouseLeave={() => setCategoryDropdownOpen(false)}
              >
                <button
                  type="button"
                  className={`nav-link nav-dropdown-trigger ${isCategoriesActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategoryDropdownOpen((prev) => !prev);
                  }}
                  aria-expanded={categoryDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Editorial Categories Menu"
                >
                  <span className="nav-label">Categories</span>
                  <ChevronDown
                    size={14}
                    className={`nav-chevron ${categoryDropdownOpen ? 'open' : ''}`}
                  />
                </button>

                {categoryDropdownOpen && categories.length > 0 && (
                  <div
                    className="nav-category-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: 'var(--color-white)',
                      boxShadow: 'var(--shadow-lg)',
                      borderRadius: 'var(--radius-lg)',
                      border: 'var(--border-subtle)',
                      padding: '0.6rem',
                      minWidth: '240px',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setCategoryDropdownOpen(false)}
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500,
                          color: 'var(--color-forest-dark)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor:
                            pathname === `/category/${cat.slug}` ? 'var(--color-ivory-light)' : 'transparent'
                        }}
                      >
                        <span>{cat.name}</span>
                        {cat.articleCount > 0 && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-text-light)',
                              background: 'var(--color-ivory-light)',
                              padding: '1px 6px',
                              borderRadius: '8px'
                            }}
                          >
                            {cat.articleCount}
                          </span>
                        )}
                      </Link>
                    ))}
                    <div style={{ borderTop: 'var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
                      <Link
                        to="/blog"
                        onClick={() => setCategoryDropdownOpen(false)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '12px',
                          color: 'var(--color-orange)',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'block'
                        }}
                      >
                        View All Desks →
                      </Link>
                    </div>
                  </div>
                )}
              </li>
              <li className="nav-item">
                <Link to="/about" className={`nav-link ${isAboutActive ? 'active' : ''}`}>
                  <span className="nav-label">About</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className={`nav-link ${isContactActive ? 'active' : ''}`}>
                  <span className="nav-label">Contact</span>
                </Link>
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
              style={{
                fontWeight: isHomeActive ? 700 : 500,
                color: isHomeActive ? 'var(--color-forest-dark)' : 'var(--color-text-main)',
                borderLeft: isHomeActive ? '3px solid var(--color-orange)' : '3px solid transparent',
                padding: '0.4rem 0.6rem',
                textDecoration: 'none'
              }}
            >
              Home
            </Link>
            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontWeight: isArticlesActive ? 700 : 500,
                color: isArticlesActive ? 'var(--color-forest-dark)' : 'var(--color-text-main)',
                borderLeft: isArticlesActive ? '3px solid var(--color-orange)' : '3px solid transparent',
                padding: '0.4rem 0.6rem',
                textDecoration: 'none'
              }}
            >
              All Articles
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontWeight: isAboutActive ? 700 : 500,
                color: isAboutActive ? 'var(--color-forest-dark)' : 'var(--color-text-main)',
                borderLeft: isAboutActive ? '3px solid var(--color-orange)' : '3px solid transparent',
                padding: '0.4rem 0.6rem',
                textDecoration: 'none'
              }}
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontWeight: isContactActive ? 700 : 500,
                color: isContactActive ? 'var(--color-forest-dark)' : 'var(--color-text-main)',
                borderLeft: isContactActive ? '3px solid var(--color-orange)' : '3px solid transparent',
                padding: '0.4rem 0.6rem',
                textDecoration: 'none'
              }}
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

