"use client";

/**
 * CombatTab — equipped gear summary, attack/defense readout, and the
 * active-conditions tracker (stacking-condition counters).
 *
 * Extracted from CharacterSheet.renderCombatTab() (REFACTOR_PLAN R5).
 * The conditions-card collapse toggle is tab-local. Equipped-slot items and
 * total attributes are computed in CharacterSheet and passed as props; the
 * persisted condition counts live on the character via `persist`.
 */
import { useState } from "react";
import { CONDITIONS } from "@/conditions";
import type {
  Character,
  InventoryItem,
  AttributeKey,
} from "@/lib/characterTypes";

/** Signed attribute/mod formatter (+3 / -1). */
const fmtAttr = (v: number) => (v >= 0 ? `+${v}` : String(v));

const COND_CATEGORY: Record<string, string> = {
  Bleeding: "damage", Burning: "damage",
  Poisoned: "poison",
  Blinded: "sense", Deafened: "sense",
  Charmed: "mind", Compelled: "mind", Dominated: "mind", Frightened: "mind", Enraged: "mind",
  Restrained: "control", Immobilized: "control", Stunned: "control", Inert: "control", Unconscious: "control", Prone: "control",
  Dazed: "hinder", Weakened: "hinder", Sapped: "hinder", Crippled: "hinder", Maimed: "hinder", Silenced: "hinder",
};
const COND_COLOR: Record<string, string> = {
  damage: "#e0623d", poison: "#5fae6b", sense: "#5f94d6",
  mind: "#d877ab", control: "#9d80dd", hinder: "#cf9a4e",
};

interface CombatTabProps {
  c: Character;
  persist: (patch: Partial<Character>) => void;
  equippedMain: InventoryItem | null;
  equippedOff: InventoryItem | null;
  equippedTwoHands: InventoryItem | null;
  equippedBody: InventoryItem | null;
  attrs: Record<AttributeKey, number>;
}

export default function CombatTab({
  c,
  persist,
  equippedMain,
  equippedOff,
  equippedTwoHands,
  equippedBody,
  attrs,
}: CombatTabProps) {
  const [conditionsCollapsed, setConditionsCollapsed] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const activeConds = c.activeConditions ?? {};
  const STACKING = new Set([
    "Bleeding",
    "Burning",
    "Dazed",
    "Poisoned",
    "Weakened",
  ]);

  function setCondition(code: string, val: number) {
    persist({
      activeConditions: { ...activeConds, [code]: Math.max(0, val) },
    });
  }

  const equippedSlots: { label: string; item: typeof equippedMain }[] = [
    { label: "Main Hand", item: equippedMain },
    { label: "Two Hands", item: equippedTwoHands },
    { label: "Off Hand", item: equippedOff },
    { label: "Body", item: equippedBody },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    marginBottom: "14px",
    overflow: "hidden",
  };
  const headStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderBottom: "1px solid var(--border)",
    backgroundColor: "var(--bg-nav)",
    fontSize: "10px",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
  };

  return (
    <>
      {/* ── Equipped Gear ── */}
      <div style={cardStyle}>
        <div style={headStyle}>Equipped Gear</div>
        <div style={{ padding: "4px 0" }}>
          {equippedSlots.map(({ label, item }) => {
            if (!item) {
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 14px",
                    borderBottom: "1px solid var(--border)",
                    opacity: 0.35,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase" as const,
                      color: "var(--text-muted)",
                      minWidth: "72px",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "13px",
                      fontStyle: "italic",
                      color: "var(--text-muted)",
                    }}
                  >
                    — empty —
                  </span>
                </div>
              );
            }
            const isWeapon = item.category === "Weapon";
            const isArmor = item.category === "Armor";
            const isShield = item.category === "Shield";
            const modKey = item.modifierStat ?? "brawn";
            const toHitMod = attrs[modKey] + (item.masterworkBonus ?? 0);
            const dmgStr =
              item.damageDiceCount > 0
                ? `${item.damageDiceCount}d${item.damageDiceSize}`
                : null;
            const typeStr = item.damageTypeTags.join(" / ");
            const shieldPool = item.reductionPoolCurrent ?? null;
            const shieldMax = item.reductionPoolMax ?? null;
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase" as const,
                    color: "var(--text-muted)",
                    minWidth: "72px",
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "2px",
                    }}
                  >
                    {item.name}
                    {item.masterworkBonus > 0 && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--primary)",
                          marginLeft: "5px",
                        }}
                      >
                        +{item.masterworkBonus}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap" as const,
                      alignItems: "center",
                    }}
                  >
                    {isWeapon && dmgStr && (
                      <>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {fmtAttr(toHitMod)} to hit
                        </span>
                        <span
                          style={{ fontSize: "10px", color: "var(--border)" }}
                        >
                          ·
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text)",
                          }}
                        >
                          {dmgStr}
                          {fmtAttr(attrs[modKey])}
                        </span>
                        {typeStr && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-heading)",
                              color: "var(--text-muted)",
                              textTransform: "capitalize" as const,
                            }}
                          >
                            {typeStr}
                          </span>
                        )}
                      </>
                    )}
                    {isArmor && (
                      <>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          +{item.armorBonus} armor
                        </span>
                        {item.armorCategory && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-heading)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {item.armorCategory}
                          </span>
                        )}
                      </>
                    )}
                    {isShield && shieldPool != null && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          color:
                            shieldPool === 0
                              ? "var(--fail)"
                              : "var(--text-muted)",
                        }}
                      >
                        Pool {shieldPool}/{shieldMax}
                        {shieldPool === 0 ? " (broken)" : ""}
                      </span>
                    )}
                    {item.traits.length > 0 &&
                      item.traits.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: "9px",
                            padding: "1px 6px",
                            border: "1px solid var(--border)",
                            borderRadius: "9999px",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-heading)",
                            textTransform: "capitalize" as const,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Conditions ── */}
      <div style={cardStyle}>
        <div
          style={{
            ...headStyle,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onClick={() => setConditionsCollapsed((v) => !v)}
        >
          <span>Conditions</span>
          <span style={{ fontSize: "10px", opacity: 0.6 }}>
            {conditionsCollapsed ? "▶" : "▼"}
          </span>
        </div>
        {!conditionsCollapsed && (
          <>
            {/* Active chip row */}
            <div
              style={{
                padding: "10px 14px",
                display: "flex",
                flexWrap: "wrap" as const,
                gap: "6px",
                alignItems: "center",
              }}
            >
              {(Object.entries(activeConds) as [string, number][])
                .filter(([, v]) => v > 0)
                .map(([code, count]) => {
                  const cat = COND_CATEGORY[code] ?? "hinder";
                  const color = COND_COLOR[cat] ?? "#cf9a4e";
                  const isStack = STACKING.has(code);
                  return (
                    <div
                      key={code}
                      title={(CONDITIONS[code as keyof typeof CONDITIONS])?.tip}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "3px 6px",
                        borderRadius: "5px",
                        border: `1px solid ${color}55`,
                        backgroundColor: `${color}18`,
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: color,
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.04em",
                          color: "var(--text)",
                        }}
                      >
                        {code}
                      </span>
                      {isStack ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCondition(code, count - 1); }}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color, padding: "0 1px", lineHeight: 1 }}
                          >
                            −
                          </button>
                          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color, fontWeight: 700 }}>
                            {count}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCondition(code, count + 1); }}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color, padding: "0 1px", lineHeight: 1 }}
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>∞</span>
                      )}
                      <button
                        onClick={() => setCondition(code, 0)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", padding: "0 1px", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              <button
                onClick={() => setShowPicker((v) => !v)}
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  padding: "2px 8px",
                  borderRadius: "5px",
                  border: "1px solid var(--border)",
                  background: showPicker ? "var(--primary-light)" : "var(--bg-nav)",
                  color: showPicker ? "var(--primary)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {showPicker ? "− hide" : "+ add"}
              </button>
            </div>

            {/* Condition picker grid */}
            {showPicker && (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  padding: "10px 14px",
                  display: "flex",
                  flexWrap: "wrap" as const,
                  gap: "5px",
                }}
              >
                {(Object.entries(CONDITIONS) as [string, { stack: boolean; tip: string }][]).map(([code, def]) => {
                  const count = activeConds[code] ?? 0;
                  const active = count > 0;
                  const cat = COND_CATEGORY[code] ?? "hinder";
                  const color = COND_COLOR[cat] ?? "#cf9a4e";
                  return (
                    <button
                      key={code}
                      title={def.tip}
                      onClick={() => setCondition(code, active ? 0 : 1)}
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                        padding: "2px 7px",
                        borderRadius: "4px",
                        border: `1px solid ${active ? color : "var(--border)"}`,
                        backgroundColor: active ? `${color}18` : "var(--bg-nav)",
                        color: active ? color : "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
