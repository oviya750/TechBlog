import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search, BookOpen } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="container"
      style={{
        padding: 'var(--space-20) var(--space-6)',
        textAlign: 'center',
        maxWidth: '700px',
        margin: '0 auto'
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--color-peach-light)',
          color: 'var(--color-orange)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-6) auto'
        }}
      >
        <Compass size={40} />
      </div>

      <div className="kicker" style={{ justifyContent: 'center' }}>
        404 — Coordinate Unmapped
      </div>

      <h1 style={{ fontSize: '3.6rem', marginBottom: 'var(--space-4)', color: 'var(--color-forest-dark)' }}>
        This Dispatch Does Not Exist
      </h1>

      <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: 'var(--space-8)' }}>
        The article URL may have been updated, relocated, or unpublished from our index.
        Please check the permalink or explore our active publications.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Return to Homepage
        </Link>
        <Link to="/blog" className="btn btn-secondary">
          <BookOpen size={16} /> Browse All Dispatches
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

