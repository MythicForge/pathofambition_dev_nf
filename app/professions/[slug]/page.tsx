import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfessions, getProfession, getProfessionFeats } from "@/lib/data";
import MarkdownContent from "@/components/MarkdownContent";
import StatTile from "@/components/StatTile";
import TypeBadge from "@/components/TypeBadge";
import CategoryTag from "@/components/CategoryTag";
import type { Metadata } from "next";
import type { Feat } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

type ProfCategory = "combat" | "magic" | "stealth" | "hybrid";

const PROF_CATEGORY: Record<string, ProfCategory> = {
  Berserker: "combat",
  Fighter: "combat",
  Mercenary: "combat",
  Oathbound: "hybrid",
  Mage: "magic",
  Mesmer: "magic",
  Eidolon: "magic",
  Elementalist: "hybrid",
  Agent: "combat",
  Shaman: "magic",
  Warden: "hybrid",
};

const CAT_LABEL: Record<ProfCategory, string> = {
  combat: "Martial",
  magic: "Spellcaster",
  stealth: "Skill",
  hybrid: "Hybrid",
};

const CAT_TYPE: Record<ProfCategory, "action" | "spell" | "feat" | "hybrid"> = {
  combat: "action",
  magic: "spell",
  stealth: "feat",
  hybrid: "hybrid",
};

const CAT_COLOR: Record<ProfCategory, string> = {
  combat: "var(--c-action)",
  magic: "var(--c-spell)",
  stealth: "var(--c-feat)",
  hybrid: "var(--c-hybrid)",
};

const CAT_RGB: Record<ProfCategory, string> = {
  combat: "--c-action-rgb",
  magic: "--c-spell-rgb",
  stealth: "--c-feat-rgb",
  hybrid: "--c-hybrid-rgb",
};

export async function generateStaticParams() {
  return getProfessions().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prof = getProfession(slug);
  return { title: prof?.name ?? "Not Found" };
}

const ICON_VITALITY = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const ICON_FAVORED = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);
const ICON_GROWTH = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
    <polyline points="17,6 23,6 23,12" />
  </svg>
);
const ICON_SHIELD = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default async function ProfessionDetailPage({ params }: Props) {
  const { slug } = await params;
  const prof = getProfession(slug);
  if (!prof) notFound();

  const cat = PROF_CATEGORY[prof.name];
  const catColor = cat ? CAT_COLOR[cat] : "var(--gold)";
  const catRgb = cat ? CAT_RGB[cat] : "--gold-rgb";
  const catType = cat ? CAT_TYPE[cat] : "gold";

  // Feats grouped by path tag
  const { feats: allFeats } = getProfessionFeats();
  const profFeats = allFeats.filter((f) => f.owner_name === prof.name);

  const baseFeatTag = prof.name;
  const pathFeatGroups: Record<string, Feat[]> = {};
  profFeats.forEach((f) => {
    const tag = f.tag ?? baseFeatTag;
    if (!pathFeatGroups[tag]) pathFeatGroups[tag] = [];
    pathFeatGroups[tag].push(f);
  });

  // Path sub-cards: show path_options first, then any extra tags
  const pathOrder = [
    ...prof.path_options,
    ...Object.keys(pathFeatGroups).filter(
      (t) => !prof.path_options.includes(t) && t !== baseFeatTag,
    ),
  ];

  // Related: same category
  const related = cat
    ? getProfessions()
        .filter((p) => PROF_CATEGORY[p.name] === cat && p.slug !== slug)
        .slice(0, 4)
    : [];

  const statTiles = [
    {
      label: "Starting Vitality",
      value: prof.starting_vitality || "—",
      icon: ICON_VITALITY,
    },
    {
      label: "Favored",
      value: prof.favored_attributes_raw || "—",
      icon: ICON_FAVORED,
    },
    {
      label: "Vitality / Tier",
      value: prof.vitality_gained_per_tier || "—",
      icon: ICON_GROWTH,
    },
    ...(prof.wound_bonus_per_tier
      ? [
          {
            label: "Wound Bonus / Tier",
            value: `+${prof.wound_bonus_per_tier}`,
            icon: ICON_SHIELD,
          },
        ]
      : []),
  ];

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg-2)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
  };

  const ghostBtn: React.CSSProperties = {
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.04em",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  };

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "20px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <Link
          href="/professions"
          style={{ color: catColor, textDecoration: "none" }}
        >
          Professions
        </Link>
        <span style={{ color: "var(--text-tertiary)" }}>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{prof.name}</span>
      </nav>

      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
            letterSpacing: "-1px",
            color: "var(--text-primary)",
            margin: 0,
            flex: 1,
            minWidth: 0,
            lineHeight: 1.05,
          }}
        >
          {prof.name}
        </h1>
        <div
          className="detail-title-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingTop: "8px",
          }}
        >
          {cat && <TypeBadge label={CAT_LABEL[cat]} category={catType} />}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={ghostBtn}>
              ☆<span className="btn-label"> Favorite</span>
            </button>
            <button style={ghostBtn}>
              ＋<span className="btn-label"> Add to Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Meta chips */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {prof.starting_vitality && (
          <span style={chipStyle}>
            <span
              style={{
                color: "var(--text-tertiary)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              Vitality
            </span>
            <span style={{ color: catColor }}>{prof.starting_vitality}</span>
          </span>
        )}
        {prof.favored_attributes_raw && (
          <span style={chipStyle}>
            <span
              style={{
                color: "var(--text-tertiary)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              Favored
            </span>
            <span style={{ color: catColor }}>
              {prof.favored_attributes_raw}
            </span>
          </span>
        )}
        {prof.path_options.length > 0 && (
          <span style={chipStyle}>
            <span
              style={{
                color: "var(--text-tertiary)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              Paths
            </span>
            <span style={{ color: "var(--text-primary)" }}>
              {prof.path_options.join(" · ")}
            </span>
          </span>
        )}
      </div>

      {/* Category fading divider */}
      <div
        style={{
          height: "1px",
          background: `linear-gradient(90deg, ${catColor} 0%, var(--border) 55%, transparent 100%)`,
          marginBottom: "28px",
        }}
      />

      {/* Two-column body */}
      <div className="detail-two-col">
        {/* Left: StatTile stack + proficiency tags */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {statTiles.map((t) => (
            <StatTile
              key={t.label}
              label={t.label}
              value={t.value}
              icon={t.icon}
              category={catType}
            />
          ))}

          {/* Proficiency pill groups */}
          {(prof.proficiencies.vitals_skills.length > 0 ||
            prof.proficiencies.armaments.length > 0 ||
            prof.proficiencies.protection.length > 0) && (
            <div style={{ paddingTop: "4px" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9.5px",
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "10px",
                }}
              >
                Proficiencies
              </div>
              {prof.proficiencies.vitals_skills.length > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "8.5px",
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                      marginBottom: "5px",
                    }}
                  >
                    Skills
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {prof.proficiencies.vitals_skills.map((s) => (
                      <CategoryTag key={s} label={s} category={catType} />
                    ))}
                  </div>
                </div>
              )}
              {prof.proficiencies.armaments.length > 0 &&
                !(
                  prof.proficiencies.armaments.length === 1 &&
                  prof.proficiencies.armaments[0] === "-"
                ) && (
                  <div style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "8.5px",
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        color: "var(--text-tertiary)",
                        marginBottom: "5px",
                      }}
                    >
                      Armaments
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                    >
                      {prof.proficiencies.armaments.map((a) => (
                        <CategoryTag key={a} label={a} category={catType} />
                      ))}
                    </div>
                  </div>
                )}
              {prof.proficiencies.protection.length > 0 &&
                !(
                  prof.proficiencies.protection.length === 1 &&
                  prof.proficiencies.protection[0] === "-"
                ) && (
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "8.5px",
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        color: "var(--text-tertiary)",
                        marginBottom: "5px",
                      }}
                    >
                      Protection
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                    >
                      {prof.proficiencies.protection.map((p) => (
                        <CategoryTag key={p} label={p} category={catType} />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Right: Overview card + class features + path sub-cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            minWidth: 0,
          }}
        >
          {/* Leading overview card */}
          <div
            style={{
              background: `linear-gradient(90deg, rgb(var(${catRgb}) / 0.06) 0%, transparent 75%)`,
              border: "1px solid var(--border)",
              borderLeft: `2px solid ${catColor}`,
              borderRadius: "12px",
              padding: "20px 22px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                color: catColor,
                marginBottom: "10px",
              }}
            >
              Overview
            </div>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: "17px",
                fontWeight: 500,
                color: "var(--text-primary)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {prof.flavor || prof.role}
            </p>
          </div>

          {/* Base class features */}
          {prof.features.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9.5px",
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "8px",
                }}
              >
                Class Features
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {prof.features.map((feat) => (
                  <div
                    key={feat.id}
                    style={{
                      padding: "13px 16px",
                      backgroundColor: `rgb(var(${catRgb}) / 0.05)`,
                      border: `1px solid rgb(var(${catRgb}) / 0.22)`,
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: feat.description_markdown ? "8px" : 0,
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: catColor,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontStyle: "italic",
                          fontWeight: 600,
                          fontSize: "15px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {feat.name}
                      </span>
                      {feat.trait_label && feat.trait_label !== "-" && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "var(--text-tertiary)",
                            marginLeft: "auto",
                          }}
                        >
                          {feat.trait_label}
                        </span>
                      )}
                    </div>
                    {feat.description_markdown && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                          paddingLeft: "14px",
                        }}
                      >
                        <MarkdownContent content={feat.description_markdown} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Path sub-cards */}
          {pathOrder.map((pathName) => {
            const featsForPath = pathFeatGroups[pathName];
            if (!featsForPath || featsForPath.length === 0) return null;
            return (
              <div
                key={pathName}
                style={{
                  backgroundColor: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      width: "3px",
                      height: "18px",
                      borderRadius: "2px",
                      backgroundColor: catColor,
                      flexShrink: 0,
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontStyle: "italic",
                      fontWeight: 500,
                      fontSize: "1.2rem",
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {pathName}
                  </h2>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9.5px",
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                      marginLeft: "auto",
                    }}
                  >
                    {featsForPath.length} feats
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {featsForPath.map((feat) => (
                    <div
                      key={feat.id}
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "10px 14px",
                        backgroundColor: "var(--bg-2)",
                        borderRadius: "8px",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: catColor,
                          flexShrink: 0,
                          marginTop: "7px",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "8px",
                            marginBottom: feat.description_markdown ? "4px" : 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-heading)",
                              fontStyle: "italic",
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "var(--text-primary)",
                            }}
                          >
                            {feat.name}
                          </span>
                          {feat.tier != null && (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "9px",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                color: "var(--text-tertiary)",
                                flexShrink: 0,
                              }}
                            >
                              T{feat.tier}
                            </span>
                          )}
                          {feat.cost && (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "9px",
                                letterSpacing: "0.5px",
                                color: catColor,
                                flexShrink: 0,
                                marginLeft: "auto",
                              }}
                            >
                              {feat.cost}
                            </span>
                          )}
                        </div>
                        {feat.required && (
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "9px",
                              color: "var(--text-tertiary)",
                              marginBottom: "4px",
                            }}
                          >
                            Requires: {feat.required}
                          </div>
                        )}
                        {feat.description_markdown && (
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-secondary)",
                              lineHeight: 1.55,
                            }}
                          >
                            <MarkdownContent
                              content={feat.description_markdown}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Related professions rail */}
      {related.length > 0 && (
        <div
          style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9.5px",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              marginBottom: "12px",
            }}
          >
            Related · {cat ? CAT_LABEL[cat] : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/professions/${p.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  backgroundColor: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderLeft: `2px solid ${catColor}`,
                  borderRadius: "8px",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontStyle: "italic",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    flex: 1,
                  }}
                >
                  {p.name}
                </span>
                {p.path_options.length > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9.5px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {p.path_options.join(" · ")}
                  </span>
                )}
                <span
                  style={{ color: catColor, fontSize: "14px", opacity: 0.8 }}
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
