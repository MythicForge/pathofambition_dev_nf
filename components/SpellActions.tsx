'use client';
import { useState } from 'react';

const BASE: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  letterSpacing: '0.04em',
  padding: '6px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  transition: 'color 0.15s, border-color 0.15s',
  whiteSpace: 'nowrap' as const,
};

const ACTIVE: React.CSSProperties = {
  color: 'var(--gold)',
  borderColor: 'var(--border-hi)',
};

export default function SpellActions() {
  const [favorited, setFavorited] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => setFavorited((f) => !f)}
        style={{ ...BASE, ...(favorited ? ACTIVE : {}) }}
        onMouseEnter={(e) => { if (!favorited) { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--border-hi)'; } }}
        onMouseLeave={(e) => { if (!favorited) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
      >
        {favorited ? '★' : '☆'} Favorite
      </button>
      <button
        style={BASE}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--border-hi)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        ＋ Add to Sheet
      </button>
    </div>
  );
}
