type Category =
  | "prof"
  | "origin"
  | "spell"
  | "feat"
  | "action"
  | "equip"
  | "gold"
  | "hybrid";

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  category?: Category;
  large?: boolean;
  style?: React.CSSProperties;
}

const RGB_VAR: Record<Category, string> = {
  prof: "--c-prof-rgb",
  origin: "--c-origin-rgb",
  spell: "--c-spell-rgb",
  feat: "--c-feat-rgb",
  action: "--c-action-rgb",
  equip: "--c-equip-rgb",
  gold: "--gold-rgb",
  hybrid: "--c-hybrid-rgb",
};

const COLOR_VAR: Record<Category, string> = {
  prof: "--c-prof",
  origin: "--c-origin",
  spell: "--c-spell",
  feat: "--c-feat",
  action: "--c-action",
  equip: "--c-equip",
  gold: "--gold",
  hybrid: "--c-hybrid-rgb",
};

export default function StatTile({
  label,
  value,
  icon,
  category = "gold",
  large = false,
  style,
}: StatTileProps) {
  const rgbVar = RGB_VAR[category];
  const colorVar = `var(${COLOR_VAR[category]})`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            backgroundColor: `rgb(var(${rgbVar}) / 0.07)`,
            border: `1px solid rgb(var(${rgbVar}) / 0.20)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colorVar,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            fontSize: large ? "28px" : "18px",
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            fontSize: "9.5px",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            marginTop: "2px",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
