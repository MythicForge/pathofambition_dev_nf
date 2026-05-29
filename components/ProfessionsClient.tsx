'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import FilterBar from './FilterBar';
import type { FilterOption } from './FilterBar';
import type { Profession } from '@/lib/types';

type ProfCategory = 'combat' | 'magic' | 'stealth';

const PROF_CATEGORY: Record<string, ProfCategory> = {
  Berserker: 'combat', Fighter: 'combat', Mercenary: 'combat', Oathbound: 'combat',
  Mage: 'magic', Mesmer: 'magic', Eidolon: 'magic', Stygian: 'magic',
  Agent: 'stealth', Drifter: 'stealth', Duelist: 'stealth', Warden: 'stealth',
};

const CAT_COLOR: Record<ProfCategory, string> = {
  combat:  'var(--c-action)',
  magic:   'var(--c-spell)',
  stealth: 'var(--c-feat)',
};
const CAT_RGB: Record<ProfCategory, string> = {
  combat:  '--c-action-rgb',
  magic:   '--c-spell-rgb',
  stealth: '--c-feat-rgb',
};

interface Props { professions: Profession[] }

export default function ProfessionsClient({ professions }: Props) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  function toggle(v: string) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return professions.filter(p => {
      const cat = PROF_CATEGORY[p.name];
      if (activeFilters.size > 0 && cat && !activeFilters.has(cat)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.role ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [professions, activeFilters, search]);

  const counts: Record<string, number> = {};
  professions.forEach(p => {
    const cat = PROF_CATEGORY[p.name];
    if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
  });

  const filterOptions: FilterOption[] = [
    { value: 'combat',  label: 'Combat',          count: counts.combat },
    { value: 'magic',   label: 'Magic',            count: counts.magic },
    { value: 'stealth', label: 'Stealth & Skill',  count: counts.stealth },
  ];

  return (
    <div>
      <FilterBar
        options={filterOptions}
        active={activeFilters}
        onToggle={toggle}
        allLabel="All"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search professions…"
        sortLabel="Alphabetical"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {filtered.map((prof) => {
          const cat = PROF_CATEGORY[prof.name];
          const dotColor = cat ? CAT_COLOR[cat] : 'var(--gold)';
          const dotRgb = cat ? CAT_RGB[cat] : '--gold-rgb';
          return (
            <Link
              key={prof.id}
              href={`/professions/${prof.slug}`}
              style={{
                display: 'block', padding: '18px 20px',
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '12px', textDecoration: 'none',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = dotColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {/* Left category bar */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
                backgroundColor: dotColor,
              }} />

              {/* Title + category dot */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                  fontWeight: 500, fontSize: '1.3rem', color: 'var(--text-primary)',
                  letterSpacing: '-0.2px', margin: 0, lineHeight: 1.2,
                }}>
                  {prof.name}
                </h2>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: dotColor, flexShrink: 0, marginTop: '6px',
                }} />
              </div>

              {/* Path tags */}
              {prof.path_options.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                  {prof.path_options.map((p) => (
                    <span key={p} style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '12px',
                      fontSize: '10.5px', fontFamily: 'var(--font-body)', fontWeight: 600,
                      color: dotColor,
                      backgroundColor: `rgb(var(${dotRgb}) / 0.09)`,
                      border: `1px solid rgb(var(${dotRgb}) / 0.40)`,
                      whiteSpace: 'nowrap',
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Description — the body copy fix */}
              <p style={{
                fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55,
                minHeight: '58px',
                display: '-webkit-box', WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {prof.role}
              </p>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '12px 0 10px' }} />

              {/* Footer stats */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '8.5px', fontWeight: 500,
                    letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-tertiary)',
                    marginBottom: '2px',
                  }}>Vitality</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 500,
                    fontSize: '0.875rem', color: 'var(--text-primary)',
                  }}>{prof.starting_vitality}</div>
                </div>
                {prof.favored_attributes_raw && (
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '8.5px', fontWeight: 500,
                      letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-tertiary)',
                      marginBottom: '2px',
                    }}>Favored</div>
                    <div style={{
                      fontSize: '0.8rem', color: 'var(--text-secondary)',
                    }}>{prof.favored_attributes_raw}</div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{
          padding: '3rem', textAlign: 'center',
          color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
        }}>
          No professions match.
        </div>
      )}
    </div>
  );
}
