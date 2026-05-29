'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import FilterBar from './FilterBar';
import type { SearchResult } from '@/lib/types';

const TYPE_CONFIG: Record<string, {
  label: string;
  color: string;
  colorRgb: string;
  href: (slug: string) => string;
}> = {
  profession: { label: 'Profession', color: '--c-prof',   colorRgb: '--c-prof-rgb',   href: (slug) => `/professions/${slug}` },
  spell:      { label: 'Spell',      color: '--c-spell',  colorRgb: '--c-spell-rgb',  href: (slug) => `/spells/${slug}` },
  origin:     { label: 'Origin',     color: '--c-origin', colorRgb: '--c-origin-rgb', href: (slug) => `/origins/${slug}` },
  feat:       { label: 'Feat',       color: '--c-feat',   colorRgb: '--c-feat-rgb',   href: () => `/feats` },
  action:     { label: 'Action',     color: '--c-action', colorRgb: '--c-action-rgb', href: () => `/actions` },
  equipment:  { label: 'Equipment',  color: '--c-equip',  colorRgb: '--c-equip-rgb',  href: () => `/equipment` },
};

const TYPE_ORDER = ['profession', 'origin', 'spell', 'feat', 'action', 'equipment'];

interface Props {
  index: SearchResult[];
}

export default function SearchClient({ index }: Props) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [searched, setSearched]     = useState(false);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());

  const fuse = useCallback(
    () => new Fuse(index, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'tags', weight: 0.5 },
      ],
      threshold: 0.35,
      minMatchCharLength: 2,
    }),
    [index]
  );

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setResults(fuse().search(q).map((r) => r.item));
    setSearched(true);
  }, [fuse]);

  const toggleType = (type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const allGrouped = useMemo(() =>
    results.reduce<Record<string, SearchResult[]>>((acc, r) => {
      (acc[r.type] ??= []).push(r); return acc;
    }, {}),
    [results]
  );

  const filteredResults = useMemo(() =>
    activeTypes.size === 0 ? results : results.filter((r) => activeTypes.has(r.type)),
    [results, activeTypes]
  );

  const filteredGrouped = useMemo(() =>
    filteredResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
      (acc[r.type] ??= []).push(r); return acc;
    }, {}),
    [filteredResults]
  );

  const filterOptions = TYPE_ORDER
    .filter((t) => allGrouped[t]?.length)
    .map((t) => ({ value: t, label: TYPE_CONFIG[t].label, count: allGrouped[t].length }));

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <div style={{
          position: 'absolute', left: '1rem', top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)', pointerEvents: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search professions, spells, feats, origins, actions…"
          aria-label="Search game content"
          autoFocus
          style={{
            width: '100%',
            padding: '0.9375rem 1rem 0.9375rem 3rem',
            fontSize: '1.0625rem',
            fontFamily: 'var(--font-body)',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            backgroundColor: 'var(--panel)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--gold)';
            e.target.style.boxShadow = '0 0 0 3px rgb(var(--gold-rgb) / 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* FilterBar — shown when results exist with > 1 category */}
      {searched && filterOptions.length > 1 && (
        <FilterBar
          options={filterOptions}
          active={activeTypes}
          onToggle={toggleType}
          allLabel="All types"
          style={{ marginBottom: '1.25rem' }}
        />
      )}

      {/* Pre-search empty state */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 1.25rem',
            borderRadius: '16px',
            backgroundColor: 'rgb(var(--gold-rgb) / 0.07)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={1.5}
              style={{ color: 'var(--gold-dim)' }} aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.375rem',
          }}>
            Search the compendium
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            color: 'var(--text-tertiary)', letterSpacing: '0.04em',
          }}>
            {index.length} ENTRIES INDEXED
          </p>
        </div>
      )}

      {/* No results */}
      {searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.375rem',
          }}>
            No results for &ldquo;{query}&rdquo;
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            color: 'var(--text-tertiary)', letterSpacing: '0.04em',
          }}>
            TRY A DIFFERENT TERM
          </p>
        </div>
      )}

      {/* Results */}
      {searched && filteredResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            color: 'var(--text-tertiary)', letterSpacing: '0.04em',
          }}>
            {filteredResults.length} RESULT{filteredResults.length !== 1 ? 'S' : ''} · &ldquo;{query}&rdquo;
          </p>

          {TYPE_ORDER.filter((t) => filteredGrouped[t]?.length).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const items = filteredGrouped[type];
            return (
              <div key={type} style={{
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                {/* Group header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: `rgb(var(${cfg.colorRgb}) / 0.06)`,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '2px', textTransform: 'uppercase' as const,
                    color: `var(${cfg.color})`,
                  }}>
                    {cfg.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'var(--text-tertiary)', letterSpacing: '0.04em',
                  }}>
                    {items.length}
                  </span>
                </div>

                {/* Result rows */}
                <div>
                  {items.slice(0, 20).map((item, i) => (
                    <Link
                      key={item.id}
                      href={cfg.href(item.slug)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                        textDecoration: 'none',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--panel-hi)';
                        const bar = e.currentTarget.querySelector<HTMLElement>('[data-bar]');
                        if (bar) bar.style.opacity = '1';
                        const name = e.currentTarget.querySelector<HTMLElement>('[data-name]');
                        if (name) name.style.color = 'var(--gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        const bar = e.currentTarget.querySelector<HTMLElement>('[data-bar]');
                        if (bar) bar.style.opacity = '0';
                        const name = e.currentTarget.querySelector<HTMLElement>('[data-name]');
                        if (name) name.style.color = 'var(--text-primary)';
                      }}
                    >
                      {/* Category left bar */}
                      <div
                        data-bar=""
                        style={{
                          width: '2px', alignSelf: 'stretch', flexShrink: 0,
                          backgroundColor: `var(${cfg.color})`,
                          opacity: 0, transition: 'opacity 0.1s',
                        }}
                      />
                      <div style={{
                        flex: 1, padding: '0.625rem 1rem',
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            data-name=""
                            style={{
                              fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                              fontWeight: 500, fontSize: '0.9375rem',
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              transition: 'color 0.1s',
                            }}
                          >
                            {item.name}
                          </div>
                          {item.description && (
                            <div style={{
                              fontSize: '0.775rem', color: 'var(--text-secondary)',
                              lineHeight: 1.45, marginTop: '2px',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical' as const,
                              overflow: 'hidden',
                            }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '9px',
                          fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' as const,
                          color: `var(${cfg.color})`,
                          backgroundColor: `rgb(var(${cfg.colorRgb}) / 0.1)`,
                          padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                        }}>
                          {cfg.label}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2}
                          style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
                          aria-hidden="true">
                          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
