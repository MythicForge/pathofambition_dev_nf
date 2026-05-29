type Category =
  | "prof"
  | "origin"
  | "spell"
  | "feat"
  | "action"
  | "equip"
  | "gold"
  | "muted"
  | "hybrid";

interface CategoryTagProps {
  label: string;
  category?: Category;
  mono?: boolean;
  style?: React.CSSProperties;
}

const COLOR_VAR: Record<Category, string> = {
  prof: "--c-prof",
  origin: "--c-origin",
  spell: "--c-spell",
  feat: "--c-feat",
  action: "--c-action",
  equip: "--c-equip",
  gold: "--gold",
  hybrid: "--c-hybrid",
  muted: "--text-tertiary",
};

const RGB_VAR: Record<Category, string> = {
  prof: "--c-prof-rgb",
  origin: "--c-origin-rgb",
  spell: "--c-spell-rgb",
  feat: "--c-feat-rgb",
  action: "--c-action-rgb",
  equip: "--c-equip-rgb",
  gold: "--gold-rgb",
  hybrid: "--c-hybrid-rgb",
  muted: "--text-tertiary",
};

export default function CategoryTag({
  label,
  category = "gold",
  mono = false,
  style,
}: CategoryTagProps) {
  const colorVar = `var(${COLOR_VAR[category]})`;
  const rgbVar = RGB_VAR[category];
  const isMuted = category === "muted";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: "12px",
        fontSize: "10.5px",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        fontWeight: 600,
        letterSpacing: "0.03em",
        color: colorVar,
        backgroundColor: isMuted ? "var(--bg-2)" : `rgb(var(${rgbVar}) / 0.09)`,
        border: isMuted
          ? "1px solid var(--border)"
          : `1px solid rgb(var(${rgbVar}) / 0.40)`,
        lineHeight: 1.5,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {label}
    </span>
  );
}
