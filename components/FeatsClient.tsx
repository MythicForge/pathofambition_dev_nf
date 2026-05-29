"use client";

import { useState, useMemo } from "react";
import MarkdownContent from "./MarkdownContent";
import type { Feat, FeatOwner } from "@/lib/types";

interface Props {
  profOwners: FeatOwner[];
  profFeats: Feat[];
  originOwners: FeatOwner[];
  originFeats: Feat[];
}

type Source = "all" | "profession" | "origin";

function stripMd(md: string, maxLen = 90): string {
  const plain = md
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/#+\s/g, "")
    .split("\n")[0]
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "0.72rem",
        fontFamily: "var(--font-mono)",
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.03em",
        border: "1px solid",
        borderColor: active ? "transparent" : "var(--border)",
        backgroundColor: active ? "var(--gold)" : "transparent",
        color: active ? "var(--bg)" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{ fontSize: "0.65rem", opacity: active ? 0.75 : 0.6, fontWeight: 500 }}>
          {count}
        </span>
      )}
    </button>
  );
}

function OwnerPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "0.68rem",
        fontFamily: "var(--font-mono)",
        fontWeight: active ? 600 : 400,
        border: "1px solid",
        borderColor: active ? "rgb(var(--c-feat-rgb) / 0.53)" : "var(--border)",
        backgroundColor: active ? "rgb(var(--c-feat-rgb) / 0.14)" : "transparent",
        color: active ? "var(--c-feat)" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <span style={{ opacity: 0.7, fontWeight: 500, fontSize: "0.6rem" }}>{count}</span>
    </button>
  );
}

export default function FeatsClient({ profOwners, profFeats, originOwners, originFeats }: Props) {
  const [source, setSource] = useState<Source>("all");
  const [activeOwner, setActiveOwner] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const allFeats = useMemo<Feat[]>(
    () => [...profFeats, ...originFeats],
    [profFeats, originFeats],
  );

  // Owner counts map
  const ownerCounts = useMemo(() => {
    const m: Record<string, number> = {};
    allFeats.forEach((f) => {
      m[f.owner_name] = (m[f.owner_name] ?? 0) + 1;
    });
    return m;
  }, [allFeats]);

  const profTotal = profFeats.length;
  const originTotal = originFeats.length;

  const currentOwners: FeatOwner[] =
    source === "profession"
      ? profOwners
      : source === "origin"
        ? originOwners
        : [];

  const filtered = useMemo(() => {
    let pool: Feat[];
    if (source === "profession") pool = profFeats;
    else if (source === "origin") pool = originFeats;
    else pool = allFeats;

    return pool.filter((f) => {
      if (activeOwner && f.owner_name !== activeOwner) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !f.name.toLowerCase().includes(q) &&
          !(f.owner_name ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [source, activeOwner, search, profFeats, originFeats, allFeats]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSourceChange(s: Source) {
    setSource(s);
    setActiveOwner(null);
  }

  const hasFilters = source !== "all" || activeOwner || search.trim();

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          marginBottom: "20px",
          padding: "16px 18px",
          backgroundColor: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Source tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <FilterPill
            label="All"
            count={allFeats.length}
            active={source === "all"}
            onClick={() => handleSourceChange("all")}
          />
          <FilterPill
            label="Profession"
            count={profTotal}
            active={source === "profession"}
            onClick={() => handleSourceChange("profession")}
          />
          <FilterPill
            label="Origin"
            count={originTotal}
            active={source === "origin"}
            onClick={() => handleSourceChange("origin")}
          />

          {/* Inline search */}
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg
              style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feats…"
              aria-label="Filter feats by name"
              style={{
                padding: "5px 10px 5px 28px",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                backgroundColor: "var(--bg-2)",
                color: "var(--text-primary)",
                outline: "none",
                width: "180px",
              }}
            />
          </div>
        </div>

        {/* Owner pills when source selected */}
        {currentOwners.length > 0 && (
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--text-tertiary)", marginRight: "2px" }}>
              {source === "profession" ? "Profession" : "Origin"}
            </span>
            {currentOwners.map((owner) => (
              <OwnerPill
                key={owner.id}
                label={owner.name}
                count={ownerCounts[owner.name] ?? 0}
                active={activeOwner === owner.name}
                onClick={() => setActiveOwner(activeOwner === owner.name ? null : owner.name)}
              />
            ))}
          </div>
        )}

        {/* Summary row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
            {filtered.length} of {allFeats.length} feats
          </span>
          {hasFilters && (
            <button
              onClick={() => { setSource("all"); setActiveOwner(null); setSearch(""); }}
              style={{ fontSize: "0.72rem", color: "var(--c-feat)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", padding: "2px 6px" }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Compact row list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
          No feats match the selected filters.
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 100px 28px",
              gap: "12px",
              padding: "8px 16px 8px 20px",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            <span>Feat</span>
            <span>Source</span>
            <span>Tier</span>
            <span />
          </div>

          {filtered.map((feat, i) => {
            const expanded = expandedIds.has(feat.id);
            const summary = stripMd(feat.description_markdown);

            return (
              <div
                key={feat.id}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  borderLeft: "2px solid var(--c-feat)",
                }}
              >
                <button
                  onClick={() => toggleExpand(feat.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 90px 100px 28px",
                    gap: "12px",
                    padding: "11px 16px 11px 18px",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    alignItems: "center",
                    transition: "background-color 0.12s",
                    backgroundColor: expanded ? "var(--panel-hi)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.backgroundColor = "var(--bg-2)"; }}
                  onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {/* Name + summary */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontStyle: "italic",
                        fontWeight: 500,
                        fontSize: "15px",
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {feat.name}
                    </div>
                    {!expanded && summary && (
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "11.5px",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "2px",
                          lineHeight: 1.4,
                        }}
                      >
                        {summary}
                      </div>
                    )}
                  </div>

                  {/* Source (owner) */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9.5px",
                      letterSpacing: "0.5px",
                      color: "var(--c-feat)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {feat.owner_name}
                    {feat.tag && feat.tag !== feat.owner_name && (
                      <span style={{ color: "var(--text-tertiary)", marginLeft: "4px" }}>· {feat.tag}</span>
                    )}
                  </span>

                  {/* Tier */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9.5px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {feat.tier != null ? `Tier ${feat.tier}` : "—"}
                  </span>

                  {/* Expand indicator */}
                  <span
                    style={{
                      color: "var(--c-feat)",
                      fontSize: "14px",
                      opacity: 0.6,
                      textAlign: "right",
                      transition: "transform 0.15s",
                      display: "inline-block",
                      transform: expanded ? "rotate(90deg)" : "none",
                    }}
                  >
                    →
                  </span>
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div
                    style={{
                      padding: "0 18px 16px 20px",
                      backgroundColor: "var(--panel-hi)",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ paddingTop: "14px" }}>
                      {(feat.required || feat.path_investment || feat.cost) && (
                        <div style={{ display: "flex", gap: "14px", marginBottom: "10px", flexWrap: "wrap" }}>
                          {feat.required && (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>
                              Requires: <span style={{ color: "var(--text-secondary)" }}>{feat.required}</span>
                            </span>
                          )}
                          {feat.path_investment && (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-tertiary)" }}>
                              Investment: <span style={{ color: "var(--text-secondary)" }}>{feat.path_investment}</span>
                            </span>
                          )}
                          {feat.cost && (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--c-feat)" }}>
                              {feat.cost}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        <MarkdownContent content={feat.description_markdown} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
