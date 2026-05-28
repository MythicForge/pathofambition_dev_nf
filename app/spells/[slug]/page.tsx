import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSpells, getSpell } from '@/lib/data';
import MarkdownContent from '@/components/MarkdownContent';
import TraitBadge from '@/components/TraitBadge';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getSpells().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const spell = getSpell(slug);
  return { title: spell?.name ?? 'Not Found' };
}

function schoolStyle(_school: string) {
  return {
    bg: 'rgb(var(--c-spell-rgb) / 0.14)',
    border: 'rgb(var(--c-spell-rgb) / 0.53)',
    text: 'var(--c-spell)',
  };
}

export default async function SpellDetailPage({ params }: Props) {
  const { slug } = await params;
  const spell = getSpell(slug);
  if (!spell) notFound();

  const sc = schoolStyle(spell.school);

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
        <Link href="/spells" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Spells</Link>
        <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>›</span>
        <span style={{ color: 'var(--text-muted)' }}>{spell.name}</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 500, fontSize: '2rem', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            {spell.name}
          </h1>
          {spell.is_cantrip && <TraitBadge trait="Cantrip" variant="accent" />}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.15rem 0.5rem', borderRadius: '4px',
            backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
          }}>
            {spell.school}
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            padding: '0.15rem 0.5rem', borderRadius: '4px',
            backgroundColor: 'rgb(var(--c-spell-rgb) / 0.09)',
            color: 'var(--c-spell)',
            border: '1px solid rgb(var(--c-spell-rgb) / 0.40)',
          }}>
            {spell.tier_label}
          </span>
          {(spell.sources ?? []).map((src) => (
            <span key={src} style={{
              fontSize: '0.7rem', fontWeight: 500, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              padding: '0.15rem 0.5rem', borderRadius: '4px',
              backgroundColor: 'var(--bg-2)', color: 'var(--text-tertiary)', border: '1px solid var(--border)',
            }}>
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* Spell stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Range', value: spell.range },
          { label: 'Duration', value: spell.duration },
          ...(spell.cost ? [{ label: 'Cost', value: spell.cost }] : []),
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--panel)',
            borderRadius: '6px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderLeft: '2px solid var(--c-spell)', borderRadius: '6px' }}>
        <MarkdownContent content={spell.description_markdown} />
      </div>

      {/* Amps */}
      {spell.amps && spell.amps.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 500, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
            Amp Options
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {spell.amps.map((amp, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgb(var(--c-spell-rgb) / 0.07)',
                border: '1px solid rgb(var(--c-spell-rgb) / 0.30)',
                borderRadius: '6px',
                alignItems: 'flex-start',
              }}>
                <span style={{
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  color: 'var(--c-spell)',
                  whiteSpace: 'nowrap',
                }}>
                  AMP {amp.cost}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {amp.effect}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <Link href="/spells" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>
          ← Back to Spells
        </Link>
      </div>
    </div>
  );
}
