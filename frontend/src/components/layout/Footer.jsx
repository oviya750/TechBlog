import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Rss, Mail } from 'lucide-react';
import { TwitterIcon, LinkedInIcon, GitHubIcon, ThreadsIcon } from '../common/SocialIcons';

const Footer = () => {
  // Configurable Threads profile URL; displays non-clickable 'Coming Soon' when unset
  const threadsUrl = '';
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          {/* Col 1: Brand & Editorial Manifesto */}
          <div className="footer-brand">
            <Link to="/" className="brand-logo" style={{ color: 'var(--color-white)' }}>
              <div className="brand-symbol">
                <Terminal size={22} strokeWidth={2.4} />
              </div>
              <div className="brand-name" style={{ color: 'var(--color-white)' }}>
                TechBlog<span className="brand-dot">.</span>
              </div>
            </Link>
            <p>
              An independent technical journal investigating the frontiers of autonomous intelligence,
              distributed systems, cloud platforms, and software craftsmanship. Built for practicing
              architects and curious engineers.
            </p>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="footer-heading">Editorial Desks</h4>
            <ul className="footer-links">
              <li>
                <Link to="/category/software-development">Software Architecture</Link>
              </li>
              <li>
                <Link to="/category/artificial-intelligence-machine-learning">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link to="/category/cloud-computing">Cloud & Distributed Systems</Link>
              </li>
              <li>
                <Link to="/category/cybersecurity">Zero Trust Cybersecurity</Link>
              </li>
              <li>
                <Link to="/category/web-and-mobile-app-development">
                  Web & Mobile Engineering
                </Link>
              </li>
              <li>
                <Link to="/category/technology-innovation">Technology Horizons</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Integrity */}
          <div>
            <h4 className="footer-heading">Journal</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about">Editorial Mission</Link>
              </li>
              <li>
                <Link to="/about#board">Research Contributors</Link>
              </li>
              <li>
                <Link to="/contact">Pitch an Investigation</Link>
              </li>
              <li>
                <Link to="/contact">Corrections & Ethics</Link>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
                  XML Sitemap
                </a>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                  Robots Index
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Feeds & Access */}
          <div>
            <h4 className="footer-heading">Staff & Systems</h4>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
              Authorized company editors and technical contributors can sign in to the publishing portal.
            </p>
            <Link to="/admin" className="btn btn-peach btn-sm" style={{ width: '100%' }}>
              Access Editorial Dashboard
            </Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} TechBlog Publications Inc. All rights reserved. Nature-Tech
            Editorial Engine.
          </div>

          <div className="footer-social-row">
            <a
              href="https://github.com/oviya750"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              title="GitHub"
              aria-label="GitHub"
            >
              <GitHubIcon size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              title="Twitter"
              aria-label="Twitter"
            >
              <TwitterIcon size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/oviya2006/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={16} />
            </a>
            {/* Threads: configurable profile URL, displays as Coming Soon when unset */}
            {threadsUrl ? (
              <a
                href={threadsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="Threads"
                aria-label="Threads"
              >
                <ThreadsIcon size={16} />
              </a>
            ) : (
              <span
                className="footer-social-btn footer-social-btn-disabled"
                title="Threads (Coming Soon)"
                aria-label="Threads (Coming Soon)"
                role="button"
                tabIndex={-1}
                aria-disabled="true"
              >
                <ThreadsIcon size={16} />
              </span>
            )}
            <a
              href="mailto:oviya8466@gmail.com"
              className="footer-social-btn"
              title="Email Editorial Desk"
              aria-label="Email Editorial Desk"
            >
              <Mail size={16} />
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              title="XML Sitemap Feed"
              aria-label="XML Sitemap Feed"
            >
              <Rss size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
