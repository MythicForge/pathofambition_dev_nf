'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
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

export default function CommandPalette({ index }: Props) {
  const [open, setOpen]             = useState(false);
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  const fuse = useCallback(
    () => new Fuse(index, {
      keys: [{ name: 'name', weight: 2 }, { name: 'description', weight: 1 }, { name: 'tags', weight: 0.5 }],
      threshold: 0.35,
      minMatchCharLength: 1,
    }),
    [index]
  );

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery('');
    setResults([]);
    setSelectedIdx(0);
    setTimeout(() => inputRef.current?.focus(), 40);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => { if (!o) setTimeout(() => inputRef.current?.focus(), 40); return !o; });
        if (open) closePalette();
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') { closePalette(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[selectedIdx];
        if (item) { router.push(TYPE_CONFIG[item.type]?.href(item.slug) ?? '#'); closePalette(); }
      }
    }
    function onPaletteOpen() { openPalette(); }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('palette:open', onPaletteOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('palette:open', onPaletteOpen);
    };
  }, [open, results, selectedIdx, openPalette, closePalette, router]);

  function handleSearch(q: string) {
    setQuery(q);
    setSelectedIdx(0);
    if (q.trim().length < 1) { setResults([]); return; }
    setResults(fuse().search(q).slice(0, 32).map((r) => r.item));
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r); return acc;
  }, {});

  // Flat list for keyboard nav
  const flatResults = TYPE_ORDER.flatMap((t) => grouped[t] ?? []);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePalette}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        style={{
          position: 'fixed', top: '18%', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2001,
          width: 'calc(100vw - 2rem)',
          maxWidth: '640px',
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border-hi)',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '72vh',
        }}
      >
        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '15px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            style={{ color: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search compendium…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'var(--text-primary)',
            }}
          />
          <kbd style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-tertiary)',
            backgroundColor: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '4px', padding: '2px 6px', flexShrink: 0,
          }}>Esc</kbd>
        </div>

        {/* Results scroll area */}
        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {query.length < 1 && (
            <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: 'var(--text-tertiary)', letterSpacing: '0.06em',
              }}>
                START TYPING TO SEARCH {index.length} ENTRIES
              </p>
            </div>
          )}

          {query.length >= 1 && results.length === 0 && (
            <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                fontSize: '0.9375rem', color: 'var(--text-secondary)',
              }}>
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {TYPE_ORDER.filter((t) => grouped[t]?.length).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const items = grouped[type];
            return (
              <div key={type}>
                {/* Group header */}
                <div style={{
                  padding: '5px 20px 4px',
                  fontFamily: 'var(--font-mono)', fontSize: '9.5px',
                  fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' as const,
                  color: `var(${cfg.color})`,
                  backgroundColor: `rgb(var(${cfg.colorRgb}) / 0.07)`,
                  borderBottom: '1px solid var(--border)',
                }}>
                  {cfg.label}
                </div>
                {items.map((item) => {
                  const flatIdx = flatResults.indexOf(item);
                  const isSel = flatIdx === selectedIdx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => { router.push(cfg.href(item.slug)); closePalette(); }}
                      onMouseEnter={() => setSelectedIdx(flatIdx)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: isSel ? 'var(--panel-hi)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background-color 0.08s',
                      }}
                    >
                      {/* Category left bar */}
                      <div style={{
                        width: '2px', alignSelf: 'stretch', flexShrink: 0,
                        backgroundColor: isSel ? `var(${cfg.color})` : 'transparent',
                        transition: 'background-color 0.08s',
                      }} />
                      <div style={{
                        flex: 1, padding: '9px 18px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                          fontSize: '0.9375rem', fontWeight: 500,
                          color: isSel ? 'var(--gold)' : 'var(--text-primary)',
                          flex: 1, minWidth: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'color 0.08s',
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '9px',
                          letterSpacing: '1.5px', textTransform: 'uppercase' as const,
                          color: `var(${cfg.color})`,
                          backgroundColor: `rgb(var(${cfg.colorRgb}) / 0.1)`,
                          padding: '2px 5px', borderRadius: '3px', flexShrink: 0,
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: '16px',
          fontFamily: 'var(--font-mono)', fontSize: '9.5px',
          color: 'var(--text-tertiary)', letterSpacing: '0.04em',
          flexShrink: 0,
        }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </>
  );
}
