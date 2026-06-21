"use client";

/**
 * RightRail — character portrait, quick stats, conditions, and favorites.
 *
 * Extracted from CharacterSheet.renderRightRail() (REFACTOR_PLAN R7).
 * Portrait-collapse and favorites-collapse toggles are rail-local; the
 * favorites popout and portrait image are shared with overlays in the main
 * shell, so they arrive as props.
 */
import { useState, type RefObject } from "react";
import type {
  Character,
  BuilderProfession,
  BuilderVocation,
  BuilderFeat,
  BuilderSpell,
  InventoryItem,
} from "@/lib/characterTypes";

type FavRef = { type: "item" | "feat" | "spell"; id: string } | null;

interface RightRailProps {
  c: Character;
  persist: (patch: Partial<Character>) => void;
  prof: BuilderProfession | null;
  vocation: BuilderVocation | null;
  effectiveTier: number;
  allFeats: BuilderFeat[];
  spells: BuilderSpell[];
  inventory: InventoryItem[];
  toggleFavorite: (type: "item" | "feat" | "spell", id: string) => void;
  setFavPopout: (v: FavRef) => void;
  portraitUrl: string | null;
  setPortraitUrl: (v: string | null) => void;
  portraitInputRef: RefObject<HTMLInputElement | null>;
}

export default function RightRail({
  c,
  persist,
  prof,
  vocation,
  effectiveTier,
  allFeats,
  spells,
  inventory,
  toggleFavorite,
  setFavPopout,
  portraitUrl,
  setPortraitUrl,
  portraitInputRef,
}: RightRailProps) {
  const [portraitCollapsed, setPortraitCollapsed] = useState(false);
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);

  return (
    <>
      {/* Portrait */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "6px 14px",
            backgroundColor: "var(--bg-nav)",
            borderBottom: portraitCollapsed
              ? "none"
              : "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
          }}
          onClick={() => setPortraitCollapsed((v) => !v)}
        >
          <span>Portrait</span>
          <span style={{ fontSize: "10px", opacity: 0.6 }}>
            {portraitCollapsed ? "▶" : "▼"}
          </span>
        </div>
        {!portraitCollapsed && (
          <div
            onClick={() => portraitInputRef.current?.click()}
            title={
              portraitUrl
                ? "Click to change portrait"
                : "Click to upload portrait"
            }
            style={{
              position: "relative",
              overflow: "hidden",
              aspectRatio: "3/4",
              backgroundColor: "var(--bg-nav)",
              cursor: "pointer",
            }}
          >
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={c.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(135deg, transparent 0 12px, var(--border) 12px 13px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "10px",
                    letterSpacing: "0.3em",
                    color: "var(--text-muted)",
                    textTransform: "uppercase" as const,
                    opacity: 0.6,
                  }}
                >
                  PORTRAIT
                </div>
              </div>
            )}
            <div
              style={{
                position: "absolute",
                inset: "auto 0 0 0",
                padding: "14px 14px 12px",
                background:
                  "linear-gradient(180deg, transparent 0%, var(--bg-nav) 100%)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: "var(--text-muted)",
                }}
              >
                Character
              </div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: "19px",
                  color: "var(--text)",
                  lineHeight: 1.1,
                  marginTop: "2px",
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginTop: "3px",
                }}
              >
                {c.vocationName || c.professionName} · Tier {effectiveTier}
              </div>
            </div>
          </div>
        )}
      </div>
      <input
        ref={portraitInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const url = ev.target?.result as string;
            localStorage.setItem(`portrait-${c.id}`, url);
            setPortraitUrl(url);
          };
          reader.readAsDataURL(file);
          e.target.value = "";
        }}
      />

      {/* Favorites Panel */}
      {(() => {
        const favs = c.favorites ?? [];
        const favItems = favs
          .filter((f) => f.type === "item")
          .map((f) => inventory.find((i) => i.id === f.id))
          .filter(Boolean)
          .sort((a, b) => a!.name.localeCompare(b!.name)) as typeof inventory;
        const allFeatEntries = [
          ...allFeats,
          ...(prof?.baseFeatures ?? []),
          ...(vocation?.features ?? []),
        ];
        const favFeats = favs
          .filter((f) => f.type === "feat")
          .map((f) => allFeatEntries.find((e) => e.id === f.id))
          .filter(Boolean)
          .sort((a, b) =>
            a!.name.localeCompare(b!.name),
          ) as typeof allFeatEntries;
        const favSpells = favs
          .filter((f) => f.type === "spell")
          .map((f) => spells.find((s) => s.id === f.id))
          .filter(Boolean)
          .sort((a, b) => a!.name.localeCompare(b!.name)) as typeof spells;
        const isEmpty =
          favItems.length === 0 &&
          favFeats.length === 0 &&
          favSpells.length === 0;
        const pipBtnStyle: React.CSSProperties = {
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "0.8rem",
          color: "var(--primary)",
          padding: "0 4px",
          flexShrink: 0,
          lineHeight: 1,
        };
        const rowStyle: React.CSSProperties = {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 0",
          borderBottom: "1px solid var(--border)",
        };
        const entryBtnStyle: React.CSSProperties = {
          flex: 1,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "var(--font-heading)",
          fontSize: "0.8rem",
          color: "var(--text)",
          padding: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        };
        const sectionLabelStyle: React.CSSProperties = {
          fontSize: "9px",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "4px",
          marginTop: "8px",
        };
        return (
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
                padding: "6px 14px",
                borderBottom: favoritesCollapsed
                  ? "none"
                  : "1px solid var(--border)",
                backgroundColor: "var(--bg-nav)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.16em",
                textTransform: "uppercase" as const,
                color: "var(--text-muted)",
              }}
              onClick={() => setFavoritesCollapsed((v) => !v)}
            >
              <span>Favorites</span>
              <span style={{ fontSize: "10px", opacity: 0.6 }}>
                {favoritesCollapsed ? "▶" : "▼"}
              </span>
            </div>
            {!favoritesCollapsed && (
              <div style={{ padding: "8px 14px 12px" }}>
                {isEmpty && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      padding: "8px 0",
                    }}
                  >
                    Mark items, feats, or spells with ☆ to pin them here.
                  </div>
                )}
                {favItems.length > 0 && (
                  <div>
                    <div style={sectionLabelStyle}>Items</div>
                    {favItems.map((item) => (
                      <div key={item.id} style={rowStyle}>
                        <button
                          style={entryBtnStyle}
                          onClick={() =>
                            setFavPopout({ type: "item", id: item.id })
                          }
                          title={item.name}
                        >
                          {item.name}
                        </button>
                        <button
                          style={pipBtnStyle}
                          onClick={() => toggleFavorite("item", item.id)}
                          title="Remove"
                        >
                          ★
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {favFeats.length > 0 && (
                  <div>
                    <div style={sectionLabelStyle}>Feats</div>
                    {favFeats.map((feat) => (
                      <div key={feat.id} style={rowStyle}>
                        <button
                          style={entryBtnStyle}
                          onClick={() =>
                            setFavPopout({ type: "feat", id: feat.id })
                          }
                          title={feat.name}
                        >
                          {feat.name}
                        </button>
                        <button
                          style={pipBtnStyle}
                          onClick={() => toggleFavorite("feat", feat.id)}
                          title="Remove"
                        >
                          ★
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {favSpells.length > 0 && (
                  <div>
                    <div style={sectionLabelStyle}>Spells</div>
                    {favSpells.map((spell) => (
                      <div key={spell.id} style={rowStyle}>
                        <button
                          style={entryBtnStyle}
                          onClick={() =>
                            setFavPopout({ type: "spell", id: spell.id })
                          }
                          title={spell.name}
                        >
                          {spell.name}
                        </button>
                        <button
                          style={pipBtnStyle}
                          onClick={() => toggleFavorite("spell", spell.id)}
                          title="Remove"
                        >
                          ★
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
}
