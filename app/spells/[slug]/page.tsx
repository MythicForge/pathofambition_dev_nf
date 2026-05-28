import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSpells, getSpell } from '@/lib/data';
import MarkdownContent from '@/components/MarkdownContent';
import StatTile from '@/components/StatTile';
import TypeBadge from '@/components/TypeBadge';
import SpellActions from '@/components/SpellActions';
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

const ICON_RANGE = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const ICON_DURATION = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);
const ICON_AREA = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);
const ICON_COST = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
  </svg>
);

export default async function SpellDetailPage({ params }: Props) {
  const { slug } = await params;
  const spell = getSpell(slug);
  if (!spell) notFound();

  const related = spell.school
    ? getSpells()
        .filter((s) => s.school === spell.school && s.slug !== slug && !s.reference_only)
        .slice(0, 5)
    : [];

  const statTiles = [
    { label: 'Range', value: spell.range || '—', icon: ICON_RANGE },
    { label: 'Duration', value: spell.duration || '—', icon: ICON_DURATION },
    ...(spell.area ? [{ label: 'Area', value: spell.area, icon: ICON_AREA }] : []),
    ...(spell.cost ? [{ label: 'Cost', value: spell.cost, icon: ICON_COST }] : []),
  ];

  const metaChips: { key: string; val: string }[] = [
    ...(spell.school ? [{ key: 'School', val: spell.school }] : []),
    ...(spell.sources?.length ? [{ key: 'Source', val: spell.sources.join(', ') }] : []),
    ...(spell.spheres?.length && spell.spheres[0] ? [{ key: 'Sphere', val: spell.spheres.join(', ') }] : []),
  ];

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-2)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <Link href="/spells" style={{ color: 'var(--c-spell)', textDecoration: 'none' }}>Spells</Link>
        {spell.school && (
          <>
            <span style={{ color: 'var(--text-tertiary)' }}>›</span>
            <Link href={`/spells?school=${encodeURIComponent(spell.school)}`} style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>{spell.school}</Link>
          </>
        )}
        <span style={{ color: 'var(--text-tertiary)' }}>›</span>
        <span style={{ color: 'var(--text-secondary)' }}>{spell.name}</span>
      </nav>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          letterSpacing: '-1.2px',
          color: 'var(--text-primary)',
          margin: 0,
          flex: 1,
          minWidth: 0,
          lineHeight: 1.05,
        }}>
          {spell.name}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', paddingTop: '6px', flexShrink: 0 }}>
          <TypeBadge label={spell.is_cantrip ? 'Cantrip' : spell.tier_label} category="spell" />
          <SpellActions />
        </div>
      </div>

      {/* Meta chips */}
      {metaChips.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {metaChips.map(({ key, val }) => (
            <span key={key} style={chipStyle}>
              <span style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem' }}>{key}</span>
              <span style={{ color: 'var(--c-spell)' }}>{val}</span>
            </span>
          ))}
        </div>
      )}

      {/* Cyan fading divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, var(--c-spell) 0%, var(--border) 55%, transparent 100%)',
        marginBottom: '28px',
      }} />

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '28px', marginBottom: '36px' }}>
        {/* Left: StatTile stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {statTiles.map((t) => (
            <StatTile key={t.label} label={t.label} value={t.value} icon={t.icon} category="spell" />
          ))}
        </div>

        {/* Right: Effect card + amps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          {/* Leading effect card */}
          <div style={{
            background: 'linear-gradient(90deg, rgb(var(--c-spell-rgb) / 0.06) 0%, transparent 75%)',
            border: '1px solid var(--border)',
            borderLeft: '2px solid var(--c-spell)',
            borderRadius: '12px',
            padding: '20px 22px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              color: 'var(--c-spell)',
              marginBottom: '12px',
            }}>
              Effect
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontStyle: 'italic',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.65,
            }}>
              <MarkdownContent content={spell.description_markdown} />
            </div>
          </div>

          {/* Amps */}
          {spell.amps && spell.amps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9.5px',
                letterSpacing: '1.8px',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: '4px',
              }}>
                Amp Options
              </div>
              {spell.amps.map((amp, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '11px 15px',
                  backgroundColor: 'rgb(var(--c-spell-rgb) / 0.07)',
                  border: '1px solid rgb(var(--c-spell-rgb) / 0.30)',
                  borderRadius: '10px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '0.04em',
                    color: 'var(--c-spell)',
                    whiteSpace: 'nowrap',
                    paddingTop: '1px',
                  }}>
                    AMP {amp.cost}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {amp.effect}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related spells rail */}
      {related.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            marginBottom: '12px',
          }}>
            Related · {spell.school}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/spells/${s.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderLeft: '2px solid var(--c-spell)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
                className="card-hover-spell"
              >
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontStyle: 'italic',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  flex: 1,
                }}>
                  {s.name}
                </span>
                {s.is_cantrip ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--c-spell)', opacity: 0.7 }}>Cantrip</span>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{s.tier_label}</span>
                )}
                <span style={{ color: 'var(--c-spell)', fontSize: '14px', opacity: 0.8 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
