'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadCharacters } from '@/lib/characterStorage';
import type { Character } from '@/lib/characterTypes';

export default function HomeResume() {
  const [chars, setChars] = useState<Character[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = loadCharacters().sort(
      (a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
    );
    setChars(loaded);
    setMounted(true);
  }, []);

  if (!mounted || chars.length === 0) return null;

  const latest = chars[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Resume card */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', padding: '20px 22px',
        backgroundColor: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: '12px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '8px',
            backgroundColor: 'rgb(var(--gold-rgb) / 0.07)',
            border: '1px solid rgb(var(--gold-rgb) / 0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold)', fontSize: '1.2rem', flexShrink: 0,
          }}>⚔</div>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '9.5px', fontWeight: 500,
              letterSpacing: '1.8px', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', marginBottom: '3px',
            }}>
              Resume where you left off
            </p>
            <p style={{
              fontFamily: 'var(--font-heading)', fontStyle: 'italic',
              fontWeight: 500, fontSize: '1.1rem', color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              {latest.name || 'Unnamed Adventurer'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              {[latest.professionName, latest.originName].filter(Boolean).join(', ')}
              {latest.tier ? ` · Tier ${latest.tier}` : ''}
            </p>
          </div>
        </div>
        <Link href={`/characters/${latest.id}`} style={{
          padding: '7px 16px', flexShrink: 0,
          color: 'var(--gold)', border: '1px solid var(--border-hi)',
          borderRadius: '8px', textDecoration: 'none',
          fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '0.75rem',
          letterSpacing: '0.04em',
        }}>
          Open sheet →
        </Link>
      </div>

      {/* Activity table */}
      {chars.length > 1 && (
        <div style={{
          backgroundColor: 'var(--panel)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto auto',
            gap: '12px', padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
          }}>
            {['Name', 'Profession', 'Tier', 'Updated'].map(h => (
              <span key={h} style={{
                fontFamily: 'var(--font-mono)', fontSize: '9.5px', fontWeight: 500,
                letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text-tertiary)',
              }}>{h}</span>
            ))}
          </div>
          {chars.slice(0, 5).map((char, i) => (
            <Link key={char.id} href={`/characters/${char.id}`} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto',
              gap: '12px', padding: '12px 20px',
              borderBottom: i < Math.min(chars.length, 5) - 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none',
              backgroundColor: 'transparent',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--panel-hi)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span style={{
                fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                fontSize: '0.9rem', color: 'var(--text-primary)',
              }}>{char.name || 'Unnamed'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {char.professionName ?? '—'}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: 'var(--gold)', fontWeight: 500,
              }}>
                {char.tier ?? 1}/3
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: 'var(--text-tertiary)', whiteSpace: 'nowrap',
              }}>
                {char.updatedAt ? new Date(char.updatedAt).toLocaleDateString() : '—'}
              </span>
            </Link>
          ))}
          {chars.length > 5 && (
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)' }}>
              <Link href="/characters" style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: 'var(--text-tertiary)', textDecoration: 'none',
                letterSpacing: '0.04em',
              }}>
                View all {chars.length} characters →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
