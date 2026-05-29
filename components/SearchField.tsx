'use client';

import { useRef } from 'react';

interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  onFocus?: () => void;
  showKbd?: boolean;
  style?: React.CSSProperties;
}

export default function SearchField({
  placeholder = 'Search…',
  value,
  onChange,
  onFocus,
  showKbd = true,
  style,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '11px 14px',
        gap: '8px',
        cursor: 'text',
        ...style,
      }}
      onClick={() => { inputRef.current?.focus(); onFocus?.(); }}
    >
      {/* Search icon */}
      <svg
        width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth={2}
        style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          minWidth: 0,
        }}
      />

      {showKbd && !value && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: 'var(--text-tertiary)',
            backgroundColor: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '2px 5px',
            flexShrink: 0,
            pointerEvents: 'none',
          }}
        >
          ⌘K
        </span>
      )}
    </div>
  );
}
