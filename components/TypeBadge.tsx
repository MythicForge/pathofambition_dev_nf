type Category = 'prof' | 'origin' | 'spell' | 'feat' | 'action' | 'equip' | 'gold';

interface TypeBadgeProps {
  label: string;
  category?: Category;
  style?: React.CSSProperties;
}

const COLOR_VAR: Record<Category, string> = {
  prof:   '--c-prof',
  origin: '--c-origin',
  spell:  '--c-spell',
  feat:   '--c-feat',
  action: '--c-action',
  equip:  '--c-equip',
  gold:   '--gold',
};

const RGB_VAR: Record<Category, string> = {
  prof:   '--c-prof-rgb',
  origin: '--c-origin-rgb',
  spell:  '--c-spell-rgb',
  feat:   '--c-feat-rgb',
  action: '--c-action-rgb',
  equip:  '--c-equip-rgb',
  gold:   '--gold-rgb',
};

export default function TypeBadge({ label, category = 'spell', style }: TypeBadgeProps) {
  const rgbVar = RGB_VAR[category];
  const colorVar = `var(${COLOR_VAR[category]})`;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 13px',
        borderRadius: '16px',
        fontSize: '10.5px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        letterSpacing: '1.6px',
        textTransform: 'uppercase',
        color: colorVar,
        backgroundColor: `rgb(var(${rgbVar}) / 0.14)`,
        border: `1px solid rgb(var(${rgbVar}) / 0.53)`,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </span>
  );
}
