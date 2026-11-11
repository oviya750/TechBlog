import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        margin: '3rem 0 1rem'
      }}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn btn-secondary btn-sm"
        style={{
          opacity: page === 1 ? 0.4 : 1,
          cursor: page === 1 ? 'not-allowed' : 'pointer',
          padding: '0.45rem 0.8rem'
        }}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} /> Prev
      </button>

      {pages.map((p) => {
        const isActive = p === page;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="btn btn-sm"
            style={{
              backgroundColor: isActive ? 'var(--color-forest)' : 'var(--color-white)',
              color: isActive ? 'var(--color-white)' : 'var(--color-forest-dark)',
              border: isActive ? '1px solid var(--color-forest)' : '1px solid rgba(7, 63, 50, 0.15)',
              minWidth: '38px',
              height: '38px',
              padding: 0
            }}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="btn btn-secondary btn-sm"
        style={{
          opacity: page === totalPages ? 0.4 : 1,
          cursor: page === totalPages ? 'not-allowed' : 'pointer',
          padding: '0.45rem 0.8rem'
        }}
        aria-label="Next Page"
      >
        Next <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
