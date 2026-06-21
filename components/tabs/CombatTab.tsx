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
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              flexWrap: "wrap" as const,
              gap: "6px",
            }}
          >
            {(
              Object.entries(CONDITIONS) as [
                string,
                { stack: boolean; tip: string },
              ][]
            ).map(([code, def]) => {
              const count = activeConds[code] ?? 0;
              const active = count > 0;
              const isStack = STACKING.has(code);
              return (
                <div
                  key={code}
                  title={def.tip}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: active ? "3px 8px 3px 8px" : "3px 8px",
                    borderRadius: "5px",
                    border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                    backgroundColor: active
                      ? "var(--primary-light)"
                      : "var(--bg-nav)",
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                  onClick={() =>
                    setCondition(
                      code,
                      isStack ? (active ? 0 : 1) : active ? 0 : 1,
                    )
                  }
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.06em",
                      color: active ? "var(--primary)" : "var(--text-muted)",
                      fontWeight: active ? 700 : 400,
                    }}
                  >
                    {code}
                  </span>
                  {active && !isStack && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: "var(--primary)",
                        marginLeft: "1px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                  {active && isStack && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCondition(code, count - 1);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "11px",
                          color: "var(--primary)",
                          padding: "0 1px",
                          lineHeight: 1,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--primary)",
                          fontWeight: 700,
                          minWidth: "12px",
                          textAlign: "center" as const,
                        }}
                      >
                        {count}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCondition(code, count + 1);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "11px",
                          color: "var(--primary)",
                          padding: "0 1px",
                          lineHeight: 1,
                        }}
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!conditionsCollapsed &&
          Object.values(activeConds).some((v) => v > 0) && (
            <div
              style={{
                padding: "0 14px 10px",
                display: "flex",
                flexDirection: "column" as const,
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                Active
              </div>
              {(Object.entries(activeConds) as [string, number][])
                .filter(([, v]) => v > 0)
                .map(([code, count]) => {
                  const def = CONDITIONS[code as keyof typeof CONDITIONS];
                  if (!def) return null;
                  return (
                    <div
                      key={code}
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start",
                        padding: "6px 10px",
                        backgroundColor: "var(--bg-nav)",
                        border: "1px solid var(--primary)",
                        borderRadius: "5px",
                        borderLeftWidth: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "var(--primary)",
                          minWidth: "32px",
                        }}
                      >
                        {code}
                        {count > 1 ? ` ×${count}` : ""}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          lineHeight: 1.4,
                        }}
                      >
                        {def.tip}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
      </div>
    </>
  );
}
