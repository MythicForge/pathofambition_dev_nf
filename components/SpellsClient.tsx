'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Spell } from '@/lib/types';

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface Props {
  spells: Spell[];
}

const SORT_OPTIONS = ['Alphabetical', 'Tier'] as const;
type SortOption = typeof SORT_OPTIONS[number];

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
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
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.03em',
        border: '1px solid',
        borderColor: active ? 'transparent' : 'var(--border)',
        backgroundColor: active ? 'var(--gold)' : 'transparent',
        color: active ? 'var(--bg)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          fontSize: '0.65rem',
          opacity: active ? 0.75 : 0.6,
          fontWeight: 500,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function SpellsClient({ spells }: Props) {
  const [activeTiers, setActiveTiers] = useState<Set<string>>(new Set());
  const [activeSchool, setActiveSchool] = useState<string | null>(null);
  const [activeSources, setActiveSources] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('Alphabetical');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const toggleTier = (v: string) => {
    setActiveTiers((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  };

  // Compute filter options with total counts (before active filter)
  const schools = useMemo(() => {
    const counts: Record<string, number> = {};
    spells.forEach((s) => { if (s.school) counts[s.school] = (counts[s.school] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [spells]);

  const sources = useMemo(() => {
    const counts: Record<string, number> = {};
    spells.forEach((s) => (s.sources ?? []).forEach((src) => { counts[src] = (counts[src] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [spells]);

  // Tier counts
  const tierCounts = useMemo(() => {
    const c: Record<string, number> = { cantrip: 0, t1: 0, t2: 0, t3: 0 };
    spells.forEach((s) => {
      if (s.is_cantrip) c.cantrip++;
      else if (s.tier === 1) c.t1++;
      else if (s.tier === 2) c.t2++;
      else if (s.tier === 3) c.t3++;
    });
    return c;
  }, [spells]);

  const tierOptions: FilterOption[] = [
    { value: 'cantrip', label: 'Cantrips', count: tierCounts.cantrip },
    { value: 't1', label: 'Tier 1', count: tierCounts.t1 },
    { value: 't2', label: 'Tier 2', count: tierCounts.t2 },
    { value: 't3', label: 'Tier 3', count: tierCounts.t3 },
  ];

  const filtered = useMemo(() => {
    let result = spells.filter((spell) => {
      if (activeTiers.size > 0) {
        const tierKey = spell.is_cantrip ? 'cantrip' : `t${spell.tier}`;
        if (!activeTiers.has(tierKey)) return false;
      }
      if (activeSchool && spell.school !== activeSchool) return false;
      if (activeSources.size > 0 && !(spell.sources ?? []).some((src) => activeSources.has(src))) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!spell.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sort === 'Alphabetical') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result = [...result].sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
    }

    return result;
  }, [spells, activeTiers, activeSchool, activeSources, search, sort]);

  const hasFilters = activeTiers.size > 0 || activeSchool || activeSources.size > 0 || search.trim();

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        marginBottom: '20px',
        padding: '16px 18px',
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Tier row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {tierOptions.map((opt) => (
            <FilterPill
              key={opt.value}
              label={opt.label}
              count={opt.count}
              active={activeTiers.has(opt.value)}
              onClick={() => toggleTier(opt.value)}
            />
          ))}
          <div style={{ flex: 1 }} />
          {/* Sort control */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {sort}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {showSortMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 4px)',
                backgroundColor: 'var(--panel-hi)',
                border: '1px solid var(--border-hi)',
                borderRadius: '8px',
                padding: '4px',
                zIndex: 20,
                minWidth: '130px',
              }}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSort(opt); setShowSortMenu(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      backgroundColor: sort === opt ? 'rgb(var(--c-spell-rgb) / 0.10)' : 'transparent',
                      color: sort === opt ? 'var(--c-spell)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* School pills */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginRight: '2px' }}>School</span>
          {schools.map(([school, count]) => (
            <FilterPill
              key={school}
              label={school}
              count={count}
              active={activeSchool === school}
              onClick={() => setActiveSchool(activeSchool === school ? null : school)}
            />
          ))}
        </div>

        {/* Source pills + search row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Source</span>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', flex: 1 }}>
            {sources.map(([src, count]) => (
              <FilterPill
                key={src}
                label={src}
                count={count}
                active={activeSources.has(src)}
                onClick={() => setActiveSources((prev) => {
                  const next = new Set(prev);
                  next.has(src) ? next.delete(src) : next.add(src);
                  return next;
                })}
              />
            ))}
          </div>
          {/* Inline search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              aria-label="Filter spells by name"
              style={{
                padding: '5px 10px 5px 28px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-2)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '160px',
              }}
            />
          </div>
        </div>

        {/* Filter summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            {filtered.length} of {spells.length} spells
          </span>
          {hasFilters && (
            <button
              onClick={() => { setActiveTiers(new Set()); setActiveSchool(null); setActiveSources(new Set()); setSearch(''); }}
              style={{ fontSize: '0.72rem', color: 'var(--c-spell)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', padding: '2px 6px' }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Compact row list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          No spells match the selected filters.
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px 80px 24px',
            gap: '12px',
            padding: '8px 16px 8px 20px',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
          }}>
            <span>Name</span>
            <span>School</span>
            <span>Source</span>
            <span>Tier</span>
            <span />
          </div>

          {filtered.map((spell, i) => (
            <Link
              key={spell.id}
              href={`/spells/${spell.slug}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 80px 24px',
                gap: '12px',
                padding: '11px 16px 11px 18px',
                borderLeft: '2px solid var(--c-spell)',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none',
                alignItems: 'center',
                transition: 'background-color 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--panel-hi)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {/* Name */}
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: '15px',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {spell.name}
              </span>

              {/* School */}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                letterSpacing: '0.5px',
                color: 'var(--c-spell)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {spell.school || '—'}
              </span>

              {/* Source */}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                color: 'var(--text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {(spell.sources ?? []).join(', ') || '—'}
              </span>

              {/* Tier */}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: spell.is_cantrip ? 'var(--c-spell)' : 'var(--text-tertiary)',
              }}>
                {spell.is_cantrip ? 'Cantrip' : `T${spell.tier}`}
              </span>

              {/* Arrow */}
              <span style={{ color: 'var(--c-spell)', fontSize: '14px', opacity: 0.6, textAlign: 'right' }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
