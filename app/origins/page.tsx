import Link from 'next/link';
import { getOrigins } from '@/lib/data';
import PageHeader from '@/components/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Origins' };

export default function OriginsPage() {
  const origins = getOrigins();

  return (
    <div>
      <PageHeader
        eyebrow="Reference · Origins"
        title="Origins"
        subtitle="Your origin defines your background, starting equipment, and available vocations."
        count={origins.length}
        countLabel="origins"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {origins.map((origin) => (
          <Link
            key={origin.id}
            href={`/origins/${origin.slug}`}
            className="card-hover card-hover-origin"
            style={{
              display: 'block', padding: '18px 20px',
              backgroundColor: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: '12px', textDecoration: 'none',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Left origin bar */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
              backgroundColor: 'var(--c-origin)',
            }} />

            {/* Title + dot */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                fontWeight: 500, fontSize: '1.3rem', color: 'var(--text-primary)',
                letterSpacing: '-0.2px', margin: 0, lineHeight: 1.2,
              }}>
                {origin.name}
              </h2>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: 'var(--c-origin)', flexShrink: 0, marginTop: '6px',
              }} />
            </div>

            <p style={{
              fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55,
              marginBottom: '12px', minHeight: '58px',
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {origin.flavor}
            </p>

            {origin.vocations.length > 0 && (
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '8.5px', fontWeight: 500,
                  letterSpacing: '1.4px', textTransform: 'uppercase',
                  color: 'var(--text-tertiary)', marginBottom: '6px',
                }}>
                  Vocations
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {origin.vocations.map((v) => (
                    <span key={v.id} style={{
                      display: 'inline-block', padding: '2px 9px', borderRadius: '12px',
                      fontSize: '10.5px', fontFamily: 'var(--font-body)', fontWeight: 600,
                      color: 'var(--c-origin)',
                      backgroundColor: 'rgb(var(--c-origin-rgb) / 0.09)',
                      border: '1px solid rgb(var(--c-origin-rgb) / 0.40)',
                    }}>
                      {v.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
