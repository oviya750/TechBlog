import React, { useState, useEffect } from 'react';
import { authorsAPI } from '../../services/api';
import { ShieldCheck, Cpu, Sparkles, Feather, BookOpen, CheckCircle, Mail } from 'lucide-react';
import SEOHead from '../../components/common/SEOHead';
import { LinkedInIcon, GitHubIcon, ThreadsIcon } from '../../components/common/SocialIcons';

const AboutPage = () => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    authorsAPI.getAll().then((res) => {
      if (res.data.success) {
        setAuthors(res.data.data);
      }
    });
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
      <SEOHead
        title="Editorial Mission & Research Contributors"
        description="Learn about TechBlog's mission, research contributors, and editorial standards for software architecture and engineering journalism."
        canonicalUrl={typeof window !== 'undefined' ? `${window.location.origin}/about` : 'https://techblog.internal/about'}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'About', item: '/about' }
        ]}
      />
      {/* Hero / Mission Statement */}
      <div style={{ maxWidth: '840px', margin: '0 auto var(--space-16) auto', textAlign: 'center' }}>
        <div className="kicker" style={{ justifyContent: 'center' }}>
          About TechBlog Editorial
        </div>
        <h1 style={{ fontSize: '3.4rem', lineHeight: '1.2', marginBottom: 'var(--space-6)' }}>
          Illuminating the Boundaries of Modern Software Engineering
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
          TechBlog is an independent, engineer-run publication dedicated to high-signal technical
          rigor. We bridge deep academic research and high-scale production realities, providing
          clarity in an era of rapid technological acceleration.
        </p>
      </div>

      {/* Editorial Principles & Values */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-16)'
        }}
      >
        <div className="card-editorial" style={{ padding: 'var(--space-8)' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-sage-light)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)'
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-2)' }}>
            Empirical Engineering Rigor
          </h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            We reject breathless vendor hype and synthetic summaries. Every architectural pattern,
            benchmark, and code snippet published on TechBlog has been tested and verified against
            active production runtimes.
          </p>
        </div>

        <div className="card-editorial" style={{ padding: 'var(--space-8)' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-peach-light)',
              color: 'var(--color-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)'
            }}
          >
            <Feather size={26} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-2)' }}>
            The Nature-Tech Aesthetic
          </h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Digital interfaces need not be clinical and sterile. Our publication embraces warm ivory
            tones, deep forest greens, generous whitespace, and organic typography inspired by the
            tactile timelessness of classical print journals.
          </p>
        </div>

        <div className="card-editorial" style={{ padding: 'var(--space-8)' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-sage-subtle)',
              color: 'var(--color-forest-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)'
            }}
          >
            <BookOpen size={26} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: 'var(--space-2)' }}>
            Open Peer Review Standards
          </h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Our editorial staff collaborates with senior practitioners, university researchers, and
            open-source maintainers to subject technical claims to rigorous scrutiny before release.
          </p>
        </div>
      </div>

      {/* Editorial Board / Authors */}
      <section id="board" style={{ margin: 'var(--space-16) 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-12) auto' }}>
          <div className="kicker" style={{ justifyContent: 'center' }}>
            Research Contributors
          </div>
          <h2 style={{ fontSize: '2.6rem', marginBottom: 'var(--space-3)' }}>
            The Editorial Board & Fellows
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            The senior engineers, systems architects, and research scientists behind TechBlog's
            investigations.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-8)'
          }}
        >
          {authors.map((author) => (
            <div key={author._id} className="card-editorial" style={{ padding: 'var(--space-6)' }}>
              <img
                src={author.avatar}
                alt={author.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-pill)',
                  objectFit: 'cover',
                  marginBottom: 'var(--space-4)',
                  border: '2px solid var(--color-sage)'
                }}
              />
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-1)' }}>{author.name}</h3>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-sage-dark)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 'var(--space-3)'
                }}
              >
                {author.role}
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                {author.bio}
              </p>
              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: 'var(--border-subtle)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href="https://github.com/oviya750"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="GitHub"
                  aria-label="GitHub"
                  style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)' }}
                >
                  <GitHubIcon size={14} />
                </a>
                <a
                  href="https://www.linkedin.com/in/oviya2006/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                  style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)' }}
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
                  style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)', opacity: 0.55 }}
                >
                  <ThreadsIcon size={14} />
                </span>
                <a
                  href="mailto:oviya8466@gmail.com"
                  className="footer-social-btn"
                  title="Contact via Email"
                  aria-label="Email"
                  style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-sage-light)', color: 'var(--color-forest)' }}
                >
                  <Mail size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

