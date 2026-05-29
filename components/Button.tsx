import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  as?: 'button' | 'a';
  href?: string;
}

const STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-dim) 100%)',
    color: '#1c1409',
    border: '1px solid var(--gold)',
    fontWeight: 600,
  },
  secondary: {
    background: 'transparent',
    color: 'var(--gold)',
    border: '1px solid var(--border-hi)',
    fontWeight: 500,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    fontWeight: 400,
  },
};

export default function Button({
  variant = 'secondary',
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        ...STYLES[variant],
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        padding: '7px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'border-color 0.15s, color 0.15s, background 0.15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === 'ghost') {
          e.currentTarget.style.color = 'var(--gold)';
          e.currentTarget.style.borderColor = 'var(--border-hi)';
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === 'ghost') {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
