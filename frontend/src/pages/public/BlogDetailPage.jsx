import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { articlesAPI } from '../../services/api';
import ArticleCard from '../../components/common/ArticleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotFoundPage from './NotFoundPage';
import SEOHead from '../../components/common/SEOHead';
import {
  Clock,
  Calendar,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ListTree,
  Bookmark,
  Mail
} from 'lucide-react';
import { TwitterIcon, LinkedInIcon, GitHubIcon, ThreadsIcon } from '../../components/common/SocialIcons';

const BlogDetailPage = () => {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [navigation, setNavigation] = useState({ previous: null, next: null });
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState('');

  // Dynamic scroll reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = window.scrollY;
      const windowHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (windowHeight > 0) {
        setReadProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch article detail
  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const res = await articlesAPI.getBySlug(slug);
        if (res.data.success && res.data.data) {
          setArticle(res.data.data);
          setNavigation(res.data.data.navigation || { previous: null, next: null });
          setRelatedArticles(res.data.data.relatedArticles || []);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetail();
  }, [slug]);

  // Inject heading IDs and track active TOC heading on scroll
  useEffect(() => {
    if (!article?.content) return;

    const timer = setTimeout(() => {
      const proseEl = document.querySelector('.article-prose');
      if (!proseEl) return;

      const headings = proseEl.querySelectorAll('h2, h3');
      const observedElements = [];

      headings.forEach((heading) => {
        if (!heading.id) {
          const raw = heading.textContent.trim();
          heading.id = raw
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
        observedElements.push(heading);
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHeading(entry.target.id);
            }
          });
        },
        { rootMargin: '-70px 0px -65% 0px', threshold: 0.1 }
      );

      observedElements.forEach((el) => observer.observe(el));

      return () => {
        observedElements.forEach((el) => observer.unobserve(el));
      };
    }, 150);

    return () => clearTimeout(timer);
  }, [article?.content]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`"${article.title}" on TechBlog`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleTocClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeading(targetId);
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Rendering editorial dispatch..." />;
  }

  if (notFound || !article) {
    return <NotFoundPage />;
  }

  const author = article.author || {
    name: 'TechBlog Editorial Staff',
    role: 'Staff Writer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Researches and reports on software architecture paradigms.'
  };

  // Sanitize content with DOMPurify
  const sanitizedContent = article.content
    ? DOMPurify.sanitize(article.content, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'a', 'b', 'strong', 'i', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code', 'kbd', 'samp',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'img', 'figure', 'figcaption',
          'iframe', 'div', 'span', 'hr', 'br'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
          'width', 'height', 'loading', 'frameborder', 'allowfullscreen'
        ]
      })
    : '';

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Dynamic Technical SEO, Meta & Structured Data */}
      <SEOHead
        title={article.seo?.metaTitle || article.title}
        description={article.seo?.metaDescription || article.excerpt}
        keywords={article.seo?.focusKeywords || article.tags}
        canonicalUrl={`${window.location.origin}/blog/${article.slug}`}
        ogType="article"
        ogImage={article.featuredImage?.url}
        article={article}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Dispatches', item: '/blog' },
          { name: article.category?.name || 'Category', item: `/category/${article.category?.slug}` },
          { name: article.title, item: `/blog/${article.slug}` }
        ]}
      />

      {/* Top Reading Progress Bar */}
      <div
        className="reading-progress-bar"
        style={{ width: `${Math.min(100, Math.max(0, readProgress))}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />

      {/* 1. Header with Breadcrumbs & Editorial Metadata */}
      <header className="article-detail-header">
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/blog">Dispatches</Link>
          <span>/</span>
          <Link to={`/category/${article.category?.slug}`}>{article.category?.name}</Link>
        </nav>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Link
            to={`/category/${article.category?.slug}`}
            className="badge badge-peach"
            style={{ textDecoration: 'none' }}
          >
            {article.category?.name}
          </Link>
        </div>

        <h1 className="article-hero-title">{article.title}</h1>

        <p className="article-hero-excerpt">{article.excerpt}</p>

        {/* Author Bio Row & Metadata */}
        <div className="article-meta-row" style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div className="author-pill">
            <img src={author.avatar} alt={author.name} className="author-avatar" style={{ width: '46px', height: '46px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-forest-dark)', fontSize: '1rem' }}>
                {author.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                {author.role}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={15} /> {formatDate(article.publishedAt || article.createdAt)}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={15} /> {article.readTimeMinutes || 6} min read
            </span>
          </div>
        </div>
      </header>

      {/* 2. Featured Image Banner */}
      {article.featuredImage?.url && (
        <figure className="article-featured-banner">
          <img
            src={article.featuredImage.url}
            alt={article.featuredImage.altText || article.title}
            loading="lazy"
          />
          {article.featuredImage.caption && (
            <figcaption
              style={{
                padding: '0.75rem 1rem',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-white)',
                textAlign: 'center',
                borderTop: 'var(--border-subtle)'
              }}
            >
              {article.featuredImage.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* 3. Article Content & Sidebar Layout */}
      <div className="article-layout-grid">
        {/* Table of Contents & Social Sidebar */}
        <aside className="toc-sidebar">
          {article.tableOfContents && article.tableOfContents.length > 0 && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <div className="toc-heading" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ListTree size={16} /> Table of Contents
              </div>
              <ul className="toc-list">
                {article.tableOfContents.map((item, idx) => {
                  const isActive = activeHeading === item.id;
                  return (
                    <li key={idx}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => handleTocClick(e, item.id)}
                        className={`toc-link ${item.level === 3 ? 'level-3' : ''} ${isActive ? 'active' : ''}`}
                      >
                        {item.text}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Social Sharing Actions */}
          <div>
            <div className="toc-heading">Share This Article</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={shareOnTwitter}
                className="btn btn-secondary btn-sm"
                title="Share on Twitter"
                style={{ flex: 1, padding: '0.5rem' }}
              >
                <TwitterIcon size={16} />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="btn btn-secondary btn-sm"
                title="Share on LinkedIn"
                style={{ flex: 1, padding: '0.5rem' }}
              >
                <LinkedInIcon size={16} />
              </button>
              <button
                onClick={handleCopyLink}
                className="btn btn-secondary btn-sm"
                title="Copy Article Link"
                style={{ flex: 1, padding: '0.5rem' }}
              >
                {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
            {copied && (
              <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '6px', textAlign: 'center', fontWeight: 600 }}>
                Link copied to clipboard!
              </div>
            )}
          </div>
        </aside>

        {/* Main Prose HTML Body with XSS Sanitation */}
        <article>
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: 'var(--space-10)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                Tags:
              </span>
              {article.tags.map((tag, i) => (
                <span key={i} className="badge badge-sage">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio Box */}
          <div className="article-author-card">
            <img src={author.avatar} alt={author.name} className="author-big-avatar" loading="lazy" />
            <div className="author-details" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4>Written by {author.name}</h4>
                  <div className="author-role">{author.role}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <a
                    href="https://github.com/oviya750"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    title={`${author.name} on GitHub`}
                    aria-label="GitHub"
                    style={{ width: '30px', height: '30px', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)' }}
                  >
                    <GitHubIcon size={14} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/oviya2006/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    title={`${author.name} on LinkedIn`}
                    aria-label="LinkedIn"
                  >
                    <LinkedInIcon size={14} />
                  </a>
                  <span
                    className="footer-social-btn footer-social-btn-disabled"
                    title="Threads (Coming Soon)"
                    aria-label="Threads (Coming Soon)"
                    role="button"
                    tabIndex={-1}
                    aria-disabled="true"
                    style={{ width: '30px', height: '30px', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)', opacity: 0.55 }}
                  >
                    <ThreadsIcon size={14} />
                  </span>
                  <a
                    href="mailto:oviya8466@gmail.com"
                    className="footer-social-btn"
                    title="Email Author"
                    aria-label="Email Author"
                    style={{ width: '30px', height: '30px', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)' }}
                  >
                    <Mail size={14} />
                  </a>
                </div>
              </div>
              <p className="author-bio">{author.bio}</p>
            </div>
          </div>

          {/* Previous / Next Article Navigation */}
          <nav
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-6)',
              margin: 'var(--space-10) 0',
              padding: 'var(--space-6) 0',
              borderTop: 'var(--border-subtle)',
              borderBottom: 'var(--border-subtle)'
            }}
            aria-label="Previous and Next Articles"
          >
            <div>
              {navigation.previous && (
                <Link
                  to={`/blog/${navigation.previous.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                    <ChevronLeft size={14} /> Previous Dispatch
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginTop: '4px' }}>
                    {navigation.previous.title}
                  </div>
                </Link>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              {navigation.next && (
                <Link
                  to={`/blog/${navigation.next.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Next Dispatch <ChevronRight size={14} />
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginTop: '4px' }}>
                    {navigation.next.title}
                  </div>
                </Link>
              )}
            </div>
          </nav>
        </article>
      </div>

      {/* 4. Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-10)', borderTop: 'var(--border-subtle)' }}>
          <div className="kicker">Contextual Exploration</div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-8)' }}>
            Related Dispatches from {article.category?.name}
          </h2>

          <div className="editorial-grid">
            {relatedArticles.map((rel) => (
              <ArticleCard
                key={rel._id}
                article={{ ...rel, category: article.category }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetailPage;
