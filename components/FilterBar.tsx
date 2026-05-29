'use client';

import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterBarProps {
  options: FilterOption[];
  active: Set<string>;
  onToggle: (value: string) => void;
  allLabel?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  sortLabel?: string;
  style?: React.CSSProperties;
}

function Pill({ label, count, active, onClick }: {
  label: string; count?: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 12px',
        borderRadius: '20px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.03em',
        border: active ? '1.5px solid var(--gold)' : '1.5px solid var(--border)',
        backgroundColor: active ? 'var(--gold)' : 'transparent',
        color: active ? 'var(--bg)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9.5px',
          opacity: active ? 0.8 : 0.65,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function FilterBar({
  options,
  active,
  onToggle,
  allLabel = 'All',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  sortLabel,
  style,
}: FilterBarProps) {
  const allActive = active.size === 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '12px 16px',
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        marginBottom: '1.25rem',
        ...style,
      }}
    >
      {/* All pill */}
      <Pill
        label={allLabel}
        active={allActive}
        onClick={() => { if (!allActive) { options.forEach(o => active.has(o.value) && onToggle(o.value)); } }}
      />

      {options.map(opt => (
        <Pill
          key={opt.value}
          label={opt.label}
          count={opt.count}
          active={active.has(opt.value)}
          onClick={() => onToggle(opt.value)}
        />
      ))}

      {/* Inline search */}
      {onSearchChange && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2}
              style={{ position: 'absolute', left: '8px', color: 'var(--text-secondary)', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                paddingLeft: '26px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px',
                fontSize: '0.7rem', fontFamily: 'var(--font-body)',
                backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                width: '160px',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--gold)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>
          {sortLabel && (
            <button style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.04em',
              color: 'var(--text-secondary)', backgroundColor: 'transparent',
              border: '1px solid var(--border)', borderRadius: '8px',
              padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              {sortLabel} ▾
            </button>
          )}
        </div>
      )}
    </div>
  );
}
