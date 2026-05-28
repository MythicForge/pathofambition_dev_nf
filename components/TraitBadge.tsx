interface Props {
  trait: string;
  variant?: 'default' | 'accent' | 'muted';
}

export default function TraitBadge({ trait, variant = 'default' }: Props) {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'rgb(var(--gold-rgb) / 0.09)',
      color: 'var(--gold)',
      border: '1px solid rgb(var(--gold-rgb) / 0.40)',
    },
    accent: {
      backgroundColor: 'rgb(var(--gold-rgb) / 0.14)',
      color: 'var(--gold-hi)',
      border: '1px solid rgb(var(--gold-rgb) / 0.53)',
    },
    muted: {
      backgroundColor: 'var(--bg-2)',
      color: 'var(--text-tertiary)',
      border: '1px solid var(--border)',
    },
  };

  return (
    <span
      style={{
        ...styles[variant],
        fontSize: '0.65rem',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '0.15rem 0.45rem',
        borderRadius: '9999px',
        display: 'inline-block',
        lineHeight: 1.4,
      }}
    >
      {trait}
    </span>
  );
}
