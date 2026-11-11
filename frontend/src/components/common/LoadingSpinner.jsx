import React from 'react';

const LoadingSpinner = ({ text = 'Loading editorial dispatches...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      gap: '1rem',
      color: 'var(--color-forest)'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(7, 63, 50, 0.15)',
        borderTopColor: 'var(--color-forest)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: 'var(--color-text-muted)'
      }}>
        {text}
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;

