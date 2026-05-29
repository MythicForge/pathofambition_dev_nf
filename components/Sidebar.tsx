"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import SearchField from "./SearchField";

const NAV_ITEMS = [
  {
    label: "Reference",
    items: [
      { href: "/professions", label: "Professions", icon: "sword" },
      { href: "/origins", label: "Origins", icon: "origin" },
      { href: "/spells", label: "Spells", icon: "spell" },
      { href: "/feats", label: "Feats", icon: "feat" },
      { href: "/actions", label: "Actions", icon: "action" },
      { href: "/equipment", label: "Equipment", icon: "equipment" },
    ],
  },
  {
    label: "Rules",
    items: [{ href: "/rules", label: "Rules Reference", icon: "rules" }],
  },
  {
    label: "Characters",
    items: [
      { href: "/characters", label: "My Characters", icon: "character" },
      { href: "/characters/new", label: "New Character", icon: "new-character" },
    ],
  },
  {
    label: "Site",
    items: [{ href: "/search", label: "Search", icon: "search" }],
  },
];

function CategoryIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 shrink-0";
  switch (type) {
    case "sword":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path d="M14.5 10.5L4 21M20 4l-5.5 5.5M9 9l6 6M15 4h5v5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "origin":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" /></svg>;
    case "spell":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" strokeLinejoin="round" /></svg>;
    case "feat":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" /></svg>;
    case "action":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><polygon points="5,3 19,12 5,21" strokeLinejoin="round" /></svg>;
    case "equipment":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" /></svg>;
    case "rules":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinejoin="round" /><path d="M8 7h8M8 11h6" strokeLinecap="round" /></svg>;
    case "search":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>;
    case "character":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" /><path d="M16 3.5c1.5.5 2.5 2 2 3.5" strokeLinecap="round" /></svg>;
    case "new-character":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true"><circle cx="10" cy="8" r="4" /><path d="M2 20c0-4 3.6-7 8-7" strokeLinecap="round" /><path d="M17 13v6M14 16h6" strokeLinecap="round" /></svg>;
    default:
      return null;
  }
}

function ExpandIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {collapsed
        ? <path d="M9 18l6-6-6-6" />
        : <path d="M15 18l-6-6 6-6" />}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function CollapsedTooltipItem({
  item,
  active,
  onClick,
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
  onClick?: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Link
        href={item.href}
        onClick={onClick}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        aria-label={item.label}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "38px",
          height: "38px",
          borderRadius: "8px",
          background: active
            ? "linear-gradient(180deg, var(--panel-hi) 0%, var(--panel) 100%)"
            : "transparent",
          border: active
            ? "1px solid var(--border-hi)"
            : "1px solid transparent",
          boxShadow: active ? "inset 2px 0 0 var(--gold)" : "none",
          color: active ? "var(--gold)" : "var(--text-secondary)",
          textDecoration: "none",
          transition: "color 0.15s, background 0.15s, border-color 0.15s",
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <CategoryIcon type={item.icon} />
      </Link>
      {show && (
        <div
          style={{
            position: "absolute",
            left: "calc(100% + 10px)",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "4px 10px",
            backgroundColor: "var(--panel-hi)",
            border: "1px solid var(--border-hi)",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--text-primary)",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {item.label}
        </div>
      )}
    </div>
  );
}

function ThemePillToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "38px",
          height: "38px",
          borderRadius: "8px",
          backgroundColor: "transparent",
          border: "1px solid var(--border)",
          cursor: "pointer",
          color: "var(--text-secondary)",
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "8px 12px",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "var(--text-primary)",
          letterSpacing: "0.02em",
        }}
      >
        {isDark ? "Dark" : "Light"}
      </span>
      {/* Pill toggle */}
      <button
        onClick={toggle}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        style={{
          position: "relative",
          width: "36px",
          height: "20px",
          borderRadius: "10px",
          backgroundColor: "var(--border-hi)",
          border: "none",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: isDark ? "2px" : "18px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "var(--gold)",
            transition: "left 0.18s ease",
          }}
        />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const allItems = NAV_ITEMS.flatMap((s) => s.items);

  /* ── Collapsed 72px rail ── */
  const collapsedContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        padding: "16px 0",
        gap: "4px",
      }}
    >
      {/* Logo glyph */}
      <Link
        href="/"
        aria-label="Path of Ambition"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          border: "1px solid var(--gold)",
          fontFamily: "var(--font-heading)",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: "1.25rem",
          color: "var(--gold)",
          textDecoration: "none",
          marginBottom: "12px",
        }}
      >
        P
      </Link>

      <div style={{ width: "40px", height: "1px", backgroundColor: "var(--border)", marginBottom: "12px" }} />

      {/* Icon nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {allItems.map((item) => (
          <CollapsedTooltipItem key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>

      {/* Expand + theme */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
        <ThemePillToggle compact />
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            transition: "border-color 0.15s, color 0.15s",
          }}
        >
          <ExpandIcon collapsed={true} />
        </button>
      </div>
    </div>
  );

  /* ── Expanded 240px sidebar ── */
  const expandedContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <nav aria-label="Site navigation" style={{ flex: 1, overflow: "hidden auto" }}>
        {/* Brand block */}
        <div style={{ padding: "16px 14px 14px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/"
              aria-label="Path of Ambition"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                flexShrink: 0,
                borderRadius: "8px",
                border: "1px solid var(--gold)",
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "1.25rem",
                color: "var(--gold)",
                textDecoration: "none",
              }}
            >
              P
            </Link>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: "1.05rem",
                  color: "var(--gold)",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.2,
                }}
              >
                Path of Ambition
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "1.6px",
                  color: "var(--text-tertiary)",
                  marginTop: "1px",
                }}
              >
                Player Reference
              </div>
            </div>
          </div>
        </div>

        {/* SearchField */}
        <div style={{ padding: "10px 12px 4px" }}>
          <SearchField
            placeholder="Search compendium…"
            style={{ fontSize: "0.75rem", cursor: "pointer" }}
            onFocus={() => window.dispatchEvent(new CustomEvent("palette:open"))}
          />
        </div>

        {/* Nav sections */}
        <div style={{ padding: "12px 12px 16px" }}>
          {NAV_ITEMS.map((section) => (
            <div key={section.label} style={{ marginBottom: "18px" }}>
              <p
                style={{
                  fontSize: "0.6rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  paddingLeft: "10px",
                  marginBottom: "5px",
                }}
              >
                {section.label}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: active ? 500 : 400,
                          fontSize: "0.8rem",
                          padding: "7px 10px",
                          letterSpacing: "0.01em",
                          color: active ? "var(--gold)" : "var(--text-primary)",
                          backgroundColor: active ? "var(--panel)" : "transparent",
                          borderRadius: "7px",
                          border: active ? "1px solid var(--border-hi)" : "1px solid transparent",
                          boxShadow: active ? "inset 2px 0 0 var(--gold)" : "inset 2px 0 0 transparent",
                          textDecoration: "none",
                          transition: "background-color 0.15s, border-color 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "var(--panel)";
                            e.currentTarget.style.borderColor = "var(--border)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                          }
                        }}
                      >
                        <span style={{ color: active ? "var(--gold)" : "var(--text-secondary)", flexShrink: 0 }}>
                          <CategoryIcon type={item.icon} />
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Theme footer — pinned bottom */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ flex: 1 }}>
          <ThemePillToggle />
        </div>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "7px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            flexShrink: 0,
            transition: "border-color 0.15s, color 0.15s",
          }}
        >
          <ExpandIcon collapsed={false} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-3 left-3 z-50 p-2 rounded-lg shadow-md lg:hidden cursor-pointer"
        style={{
          backgroundColor: "var(--panel)",
          border: "1px solid var(--border)",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /> : <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="fixed top-0 left-0 h-full z-40 w-60 overflow-y-auto lg:hidden transition-transform duration-200"
        style={{
          backgroundColor: "var(--bg-2)",
          borderRight: "1px solid var(--border)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {expandedContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden"
        style={{
          width: collapsed ? "72px" : "240px",
          minWidth: collapsed ? "72px" : "240px",
          transition: "width 0.2s ease, min-width 0.2s ease",
          backgroundColor: "var(--bg-2)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {collapsed ? collapsedContent : expandedContent}
      </aside>
    </>
  );
}
