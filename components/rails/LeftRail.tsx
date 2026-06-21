"use client";

/**
 * LeftRail — Attributes grid (Brawn/Finesse/Mind/Will), V.I.T.A.L.S. skills,
 * and proficiencies. Pure display + attribute/skill steppers via `persist`.
 *
 * Extracted from CharacterSheet.renderLeftRail() (REFACTOR_PLAN R7).
 */
import {
  TIER_TOTAL_SLOTS,
  calcBaseDiceFromAttr,
  calcSkillAttrValue,
  calcSkillPool,
} from "@/lib/characterCalc";
import type {
  Character,
  AttributeKey,
  BuilderProfession,
} from "@/lib/characterTypes";

/** Signed attribute/mod formatter (+3 / -1). */
const fmtAttr = (v: number) => (v >= 0 ? `+${v}` : String(v));

interface LeftRailProps {
  c: Character;
  persist: (patch: Partial<Character>) => void;
  attrs: Record<AttributeKey, number>;
  effectiveChar: Character;
  effectiveTier: number;
  prof: BuilderProfession | null;
  isArmorProficient: boolean;
}

export default function LeftRail({
  c,
  persist,
  attrs,
  effectiveChar,
  effectiveTier,
  prof,
  isArmorProficient,
}: LeftRailProps) {
  const totalAvailableBase = TIER_TOTAL_SLOTS[effectiveTier - 1] ?? 5;
  const currentTotalBase =
    (c.baseAttributes.brawn ?? 0) +
    (c.baseAttributes.finesse ?? 0) +
    (c.baseAttributes.mind ?? 0) +
    (c.baseAttributes.will ?? 0);
  const dynamicUnspent = totalAvailableBase - currentTotalBase;
  const totalAvailableSkill = 4 + 2 * Math.floor((c.featsPurchased ?? 0) / 2);
  const totalSpentSkill = Object.values(c.skillPoints ?? {}).reduce(
    (s, v) => s + v,
    0,
  );
  const dynUnspentSkill = totalAvailableSkill - totalSpentSkill;

  return (
    <>
      {/* Attributes */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.5rem 1rem",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--bg-nav)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              fontFamily: "var(--font-heading)",
              fontStyle: "italic",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              textTransform: "uppercase" as const,
            }}
          >
            Attributes
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--text-faint)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {currentTotalBase}/{totalAvailableBase} pts
          </span>
        </div>
        {dynamicUnspent > 0 && (
          <div
            style={{
              margin: "10px 12px 0",
              padding: "0.375rem 0.625rem",
              backgroundColor: "var(--accent-light)",
              border: "1px solid var(--accent)",
              borderRadius: "0.375rem",
              fontSize: "0.75rem",
              color: "var(--text)",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
            }}
          >
            ⚠ {dynamicUnspent} unspent attr pt
            {dynamicUnspent !== 1 ? "s" : ""}
            <span style={{ fontWeight: 400, marginLeft: "0.35rem" }}>
              ({currentTotalBase} / {totalAvailableBase})
            </span>
          </div>
        )}
        {/* Score tiles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            padding: "12px 12px 0",
          }}
        >
          {(["brawn", "finesse", "mind", "will"] as const).map((key) => {
            const val = attrs[key];
            const isHighest =
              val ===
              Math.max(attrs.brawn, attrs.finesse, attrs.mind, attrs.will);
            return (
              <div
                key={key}
                style={{
                  backgroundColor: "var(--bg-nav)",
                  border: `1px solid ${isHighest ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "6px",
                  padding: "10px 8px 8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase" as const,
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  {key.toUpperCase()}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: isHighest ? "var(--primary)" : "var(--text)",
                    lineHeight: 1,
                  }}
                >
                  {fmtAttr(val)}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    marginTop: "3px",
                    letterSpacing: "0.08em",
                  }}
                >
                  {/*{key}*/}
                </div>
              </div>
            );
          })}
        </div>
        {/* Edit controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            padding: "8px 12px 12px",
          }}
        >
          {(["brawn", "finesse", "mind", "will"] as const).map((key) => {
            const val = attrs[key];
            const base = c.baseAttributes[key];
            const voc =
              effectiveChar.vocationAttributeBonus.attribute === key
                ? effectiveChar.vocationAttributeBonus.value
                : 0;
            const canIncrease = dynamicUnspent > 0 && val < 12;
            const canDecrease = base > 0;
            function adjustAttr(delta: number) {
              const newBase = base + delta;
              if (newBase < 0 || newBase + voc > 12) return;
              if (delta > 0 && !canIncrease) return;
              persist({
                baseAttributes: { ...c.baseAttributes, [key]: newBase },
                unspentAttributePoints: Math.max(0, dynamicUnspent - delta),
              });
            }
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <button
                    onClick={() => adjustAttr(-1)}
                    disabled={!canDecrease}
                    className="poa-attr-btn"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg-card)",
                      cursor: canDecrease ? "pointer" : "not-allowed",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      minWidth: "16px",
                      textAlign: "center" as const,
                    }}
                  >
                    {fmtAttr(base)}
                  </span>
                  <button
                    onClick={() => adjustAttr(1)}
                    disabled={!canIncrease}
                    className="poa-attr-btn"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg-card)",
                      cursor: canIncrease ? "pointer" : "not-allowed",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>
                {voc > 0 && (
                  <span
                    style={{
                      fontSize: "0.58rem",
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {/*+{voc}*/}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* V.I.T.A.L.S. */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0.5rem 1rem",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--bg-nav)",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              fontFamily: "var(--font-heading)",
              fontStyle: "italic",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              textTransform: "uppercase" as const,
            }}
          >
            V.I.T.A.L.S.
          </span>
        </div>
        <div
          style={{
            padding: "0.875rem 1rem",
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.75rem",
          }}
        >
          {!isArmorProficient && (
            <div
              style={{
                padding: "0.4rem 0.75rem",
                backgroundColor: "var(--section-alert-bg)",
                border: "1px solid rgb(var(--fail-rgb) / 0.70)",
                borderRadius: "0.375rem",
                fontSize: "0.78rem",
                color: "var(--fail)",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
              }}
            >
              ⚠ Armor Penalty active — all skill dice reduced one step (min d4)
            </div>
          )}
          {dynUnspentSkill > 0 && (
            <div
              style={{
                padding: "0.4rem 0.75rem",
                backgroundColor: "var(--accent-light)",
                border: "1px solid rgb(var(--gold-rgb) / 0.40)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "var(--gold-dim)",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
              }}
            >
              ✦ {dynUnspentSkill} unspent Skill Point
              {dynUnspentSkill !== 1 ? "s" : ""} — allocate below
              <span style={{ fontWeight: 400, marginLeft: "0.5rem" }}>
                ({totalSpentSkill} / {totalAvailableSkill} spent)
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              gap: "0.3rem",
            }}
          >
            {[
              "Vigor",
              "Intuition",
              "Talent",
              "Awareness",
              "Lore",
              "Social",
            ].map((skill) => {
              const pool = calcSkillPool(
                skill,
                attrs,
                c.vitalsProficiencies,
                c.vitalsExpertiseBumps ?? {},
                c.skillPoints ?? {},
              );
              const invested = c.skillPoints?.[skill] ?? 0;
              const canAdd = dynUnspentSkill > 0 && invested < 12;
              const canRemove = invested > 0;
              const RANK_COLORS: Record<string, string> = {
                Untrained: "var(--text-muted)",
                Trained: "var(--primary)",
                Expert: "var(--accent)",
                Master: "#7C3AED",
              };
              const DIE_STEP = [4, 6, 8, 10, 12] as const;
              function stepDown(faces: number): number {
                const i = DIE_STEP.indexOf(faces as (typeof DIE_STEP)[number]);
                return i > 0 ? DIE_STEP[i - 1] : 4;
              }
              const penalizedDisplay = (() => {
                if (pool.profDieFaces !== null)
                  return `${pool.baseDiceCount + pool.skillDiceCount}d${stepDown(pool.profDieFaces)}`;
                const baseFaces = calcBaseDiceFromAttr(
                  calcSkillAttrValue(skill, attrs),
                );
                return `${pool.baseDiceCount + pool.skillDiceCount}d${stepDown(baseFaces)}`;
              })();
              const dieFaces =
                pool.profDieFaces ??
                calcBaseDiceFromAttr(calcSkillAttrValue(skill, attrs));
              const badgeStyle: React.CSSProperties =
                dieFaces >= 10
                  ? {
                      backgroundColor: "var(--primary)",
                      color: "var(--text-on-primary)",
                    }
                  : dieFaces === 8
                    ? {
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                        border: "1px solid var(--primary)",
                      }
                    : {
                        backgroundColor: "var(--bg-nav)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      };
              return (
                <div
                  key={skill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "var(--bg-nav)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0.375rem 0.625rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text)",
                      flex: 1,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {skill}
                  </span>
                  {pool.rank !== "Untrained" && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-heading)",
                        padding: "0.1rem 0.35rem",
                        borderRadius: "9999px",
                        border: `1px solid ${RANK_COLORS[pool.rank]}`,
                        color: RANK_COLORS[pool.rank],
                      }}
                    >
                      {pool.rank}
                    </span>
                  )}
                  {isArmorProficient ? (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-heading)",
                        padding: "1px 7px",
                        borderRadius: "5px",
                        ...badgeStyle,
                      }}
                    >
                      {pool.display}
                    </span>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.2rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontFamily: "var(--font-heading)",
                          color: "var(--text-muted)",
                          textDecoration: "line-through",
                        }}
                      >
                        {pool.display}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-heading)",
                          padding: "1px 7px",
                          borderRadius: "5px",
                          backgroundColor: "var(--bg-nav)",
                          color: "var(--fail)",
                          border: "1px solid var(--fail)",
                        }}
                      >
                        {penalizedDisplay}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => {
                        if (!canRemove) return;
                        persist({
                          skillPoints: {
                            ...(c.skillPoints ?? {}),
                            [skill]: invested - 1,
                          },
                          unspentSkillPoints:
                            totalAvailableSkill - (totalSpentSkill - 1),
                        });
                      }}
                      disabled={!canRemove}
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--bg-card)",
                        cursor: canRemove ? "pointer" : "not-allowed",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        minWidth: "14px",
                        textAlign: "center" as const,
                        color: "var(--primary)",
                      }}
                    >
                      {invested}
                    </span>
                    <button
                      onClick={() => {
                        if (!canAdd) return;
                        persist({
                          skillPoints: {
                            ...(c.skillPoints ?? {}),
                            [skill]: invested + 1,
                          },
                          unspentSkillPoints:
                            totalAvailableSkill - (totalSpentSkill + 1),
                        });
                      }}
                      disabled={!canAdd}
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--bg-card)",
                        cursor: canAdd ? "pointer" : "not-allowed",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Armaments / Protection / Tool Kits */}
      {[
        { label: "Armaments", items: prof?.armaments ?? [] },
        { label: "Protection", items: prof?.protection ?? [] },
        {
          label: "Tool Kits",
          items: (prof?.toolKits ?? []).filter((t) => t !== "-"),
        },
      ]
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div
            key={group.label}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "0.5rem 1rem",
                borderBottom: "1px solid var(--border)",
                backgroundColor: "var(--bg-nav)",
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  letterSpacing: "0.12em",
                  color: "var(--text-muted)",
                  textTransform: "uppercase" as const,
                }}
              >
                {group.label}
              </span>
            </div>
            <div
              style={{
                padding: "0.5rem 1rem",
                display: "flex",
                flexDirection: "column" as const,
                gap: "0.35rem",
              }}
            >
              {group.items.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.45rem 0.75rem",
                    backgroundColor: "var(--bg-nav)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.375rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "var(--text)",
                      flex: 1,
                    }}
                  >
                    {item}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-heading)",
                      padding: "0.1rem 0.35rem",
                      borderRadius: "9999px",
                      border: "1px solid var(--primary)",
                      color: "var(--primary)",
                    }}
                  >
                    Proficient
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
}
