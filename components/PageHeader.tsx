interface Props {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, count, countLabel, children }: Props) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: '2rem',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              color: 'var(--text-tertiary)',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              lineHeight: 1.5,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {count !== undefined && (
          <span style={{
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '0.2rem 0.625rem',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
            alignSelf: 'flex-start',
            marginTop: '0.25rem',
          }}>
            {count} {countLabel ?? 'entries'}
          </span>
        )}
      </div>
      {children && <div style={{ marginTop: '1rem' }}>{children}</div>}
    </div>
  );
}
