import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrigins, getOrigin, getOriginFeats } from '@/lib/data';
import MarkdownContent from '@/components/MarkdownContent';
import StatTile from '@/components/StatTile';
import TypeBadge from '@/components/TypeBadge';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getOrigins().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const origin = getOrigin(slug);
  return { title: origin?.name ?? 'Not Found' };
}

const ICON_VOCATION = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const ICON_PACK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);
const ICON_FEAT = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ICON_MAGIC = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  letterSpacing: '0.04em',
  padding: '6px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
};

export default async function OriginDetailPage({ params }: Props) {
  const { slug } = await params;
  const origin = getOrigin(slug);
  if (!origin) notFound();

  const { feats: allOriginFeats } = getOriginFeats();
  const originFeats = allOriginFeats.filter((f) => f.owner_id === origin.id);

  const related = getOrigins()
    .filter((o) => o.slug !== slug)
    .slice(0, 4);

  const isCaster = !!(origin as { caster?: boolean }).caster;

  const statTiles = [
    { label: 'Vocations', value: String(origin.vocations.length), icon: ICON_VOCATION },
    { label: 'Pack', value: origin.pack_name || '—', icon: ICON_PACK },
    { label: 'Feats', value: String(originFeats.length), icon: ICON_FEAT },
    ...(isCaster ? [{ label: 'Caster', value: 'Yes', icon: ICON_MAGIC }] : []),
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
    <div style={{ maxWidth: '960px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <Link href="/origins" style={{ color: 'var(--c-origin)', textDecoration: 'none' }}>Origins</Link>
        <span style={{ color: 'var(--text-tertiary)' }}>›</span>
        <span style={{ color: 'var(--text-secondary)' }}>{origin.name}</span>
      </nav>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
          letterSpacing: '-1px',
          color: 'var(--text-primary)',
          margin: 0,
          flex: 1,
          minWidth: 0,
          lineHeight: 1.05,
        }}>
          {origin.name}
        </h1>
        <div className="detail-title-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
          <TypeBadge label="Origin" category="origin" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={ghostBtn}>☆<span className="btn-label"> Favorite</span></button>
            <button style={ghostBtn}>＋<span className="btn-label"> Add to Sheet</span></button>
          </div>
        </div>
      </div>

      {/* Meta chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {origin.pack_name && (
          <span style={chipStyle}>
            <span style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem' }}>Pack</span>
            <span style={{ color: 'var(--c-origin)' }}>{origin.pack_name}</span>
          </span>
        )}
        {origin.vocations.length > 0 && (
          <span style={chipStyle}>
            <span style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem' }}>Vocations</span>
            <span style={{ color: 'var(--text-primary)' }}>{origin.vocations.map((v) => v.name).join(' · ')}</span>
          </span>
        )}
        {isCaster && (
          <span style={chipStyle}>
            <span style={{ color: 'var(--c-spell)' }}>Caster</span>
          </span>
        )}
      </div>

      {/* Origin fading divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, var(--c-origin) 0%, var(--border) 55%, transparent 100%)',
        marginBottom: '28px',
      }} />

      {/* Two-column body */}
      <div className="detail-two-col">

        {/* Left: StatTile stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {statTiles.map((t) => (
            <StatTile key={t.label} label={t.label} value={t.value} icon={t.icon} category="origin" />
          ))}
        </div>

        {/* Right: Flavor overview + origin features + vocation sub-cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

          {/* Leading flavor card */}
          <div style={{
            background: 'linear-gradient(90deg, rgb(var(--c-origin-rgb) / 0.06) 0%, transparent 75%)',
            border: '1px solid var(--border)',
            borderLeft: '2px solid var(--c-origin)',
            borderRadius: '12px',
            padding: '20px 22px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--c-origin)', marginBottom: '10px' }}>
              Overview
            </div>
            <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: '17px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>
              {origin.flavor}
            </p>
          </div>

          {/* Origin-level features */}
          {origin.origin_features.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Origin Features
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {origin.origin_features.map((feat) => (
                  <div key={feat.id} style={{
                    padding: '13px 16px',
                    backgroundColor: 'rgb(var(--c-origin-rgb) / 0.05)',
                    border: '1px solid rgb(var(--c-origin-rgb) / 0.22)',
                    borderRadius: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: feat.description_markdown ? '8px' : 0 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--c-origin)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{feat.name}</span>
                      {feat.traits?.[0] && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{feat.traits[0]}</span>
                      )}
                    </div>
                    {feat.description_markdown && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '14px' }}>
                        <MarkdownContent content={feat.description_markdown} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocation sub-cards */}
          {origin.vocations.map((voc) => (
            <div key={voc.id} style={{
              backgroundColor: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ width: '3px', height: '18px', borderRadius: '2px', backgroundColor: 'var(--c-origin)', flexShrink: 0 }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 500, fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>
                  {voc.name}
                </h2>
                {voc.attribute_bonus?.raw && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1px',
                    textTransform: 'uppercase', color: 'var(--c-origin)',
                    backgroundColor: 'rgb(var(--c-origin-rgb) / 0.09)',
                    border: '1px solid rgb(var(--c-origin-rgb) / 0.40)',
                    padding: '2px 8px', borderRadius: '12px',
                  }}>
                    {voc.attribute_bonus.raw}
                  </span>
                )}
              </div>

              {voc.flavor && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px', fontStyle: 'italic' }}>
                  {voc.flavor}
                </p>
              )}

              {voc.features.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {voc.features.map((feat) => (
                    <div key={feat.id} style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-2)',
                      borderRadius: '8px',
                      alignItems: 'flex-start',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--c-origin)', flexShrink: 0, marginTop: '7px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: feat.description_markdown ? '4px' : 0 }}>
                          {feat.name}
                        </div>
                        {feat.description_markdown && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            <MarkdownContent content={feat.description_markdown} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Origin feats */}
          {originFeats.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                {origin.name} Feats
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {originFeats.map((feat) => (
                  <div key={feat.id} style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderLeft: '2px solid var(--c-origin)',
                    borderRadius: '8px',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{feat.name}</span>
                        {feat.tier != null && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-tertiary)', flexShrink: 0 }}>T{feat.tier}</span>
                        )}
                      </div>
                      {feat.required && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Requires: {feat.required}</div>
                      )}
                      {feat.description_markdown && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                          <MarkdownContent content={feat.description_markdown} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related origins rail */}
      {related.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
            Other Origins
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {related.map((o) => (
              <Link
                key={o.slug}
                href={`/origins/${o.slug}`}
                className="card-hover-origin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderLeft: '2px solid var(--c-origin)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                  {o.name}
                </span>
                {o.vocations.length > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                    {o.vocations.map((v) => v.name).join(' · ')}
                  </span>
                )}
                <span style={{ color: 'var(--c-origin)', fontSize: '14px', opacity: 0.8 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
