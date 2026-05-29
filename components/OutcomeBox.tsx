type OutcomeType = 'success' | 'failure';

interface OutcomeBoxProps {
  type: OutcomeType;
  label?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const CONFIG = {
  success: {
    colorVar:  'var(--ok)',
    rgbVar:    'var(--ok-rgb)',
    dotColor:  'var(--ok)',
    defaultLabel: 'Success',
  },
  failure: {
    colorVar:  'var(--fail)',
    rgbVar:    'var(--fail-rgb)',
    dotColor:  'var(--fail)',
    defaultLabel: 'Failure',
  },
};

export default function OutcomeBox({ type, label, children, style }: OutcomeBoxProps) {
  const cfg = CONFIG[type];
  const stateRgb = type === 'success' ? '--ok-rgb' : '--fail-rgb';

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        backgroundColor: `rgb(var(${stateRgb}) / 0.09)`,
        border: `1px solid rgb(var(${stateRgb}) / 0.40)`,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: cfg.dotColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '10px',
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            color: cfg.colorVar,
          }}
        >
          {label ?? cfg.defaultLabel}
        </span>
      </div>
      <div
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
    </div>
  );
}
