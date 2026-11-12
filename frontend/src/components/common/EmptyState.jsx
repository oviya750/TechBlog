import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const EmptyState = ({
  title = 'No articles found',
  message = 'Try refining your search terms or exploring another technology category.',
  actionLink = '/blog',
  actionText = 'Browse All Articles',
  onAction
}) => {
  return (
    <div style={{
      background: 'var(--color-white)',
      borderRadius: 'var(--radius-2xl)',
      padding: '4rem 2rem',
      textAlign: 'center',
      border: 'var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)',
      maxWidth: '600px',
      margin: '3rem auto'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-peach-light)',
        color: 'var(--color-orange)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem'
      }}>
        <Sparkles size={28} />
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--color-forest-dark)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
        {message}
      </p>
      {onAction ? (
        <button onClick={onAction} className="btn btn-primary">
          {actionText} <ArrowRight size={16} />
        </button>
      ) : actionLink ? (
        <Link to={actionLink} className="btn btn-primary">
          {actionText} <ArrowRight size={16} />
        </Link>
      ) : null}
    </div>
  );
};

export default EmptyState;

