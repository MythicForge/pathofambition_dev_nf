import Link from "next/link";
import {
  getProfessions,
  getSpells,
  getOrigins,
  getProfessionFeats,
  getOriginFeats,
} from "@/lib/data";
import SearchField from "@/components/SearchField";
import HomeResume from "@/components/HomeResume";

type Category = 'prof' | 'origin' | 'spell' | 'feat' | 'action' | 'equip';

const SECTIONS: Array<{
  href: string; label: string; description: string;
  category: Category; count?: string;
  icon: React.ReactNode;
}> = [
  {
    href: "/professions", label: "Professions", category: "prof",
    description: "Classes and paths available to characters, with features and abilities.",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><path d="M14.5 10.5L4 21M20 4l-5.5 5.5M9 9l6 6M15 4h5v5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    href: "/origins", label: "Origins", category: "origin",
    description: "Character backgrounds and vocations that shape who your character is.",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" /></svg>,
  },
  {
    href: "/spells", label: "Spells", category: "spell",
    description: "Magical abilities organized by school, tier, and source tradition.",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" strokeLinejoin="round" /></svg>,
  },
  {
    href: "/feats", label: "Feats", category: "feat",
    description: "Special abilities earned through origins and profession advancement.",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" /></svg>,
  },
  {
    href: "/actions", label: "Actions", category: "action",
    description: "All available actions in combat and narrative scenes, grouped by type.",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><polygon points="5,3 19,12 5,21" strokeLinejoin="round" /></svg>,
  },
  {
    href: "/equipment", label: "Equipment", category: "equip",
    description: "Gear, weapons, armor, and recovery rules for adventurers.",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" /></svg>,
  },
];

const CAT_VAR: Record<Category, string> = {
  prof: '--c-prof', origin: '--c-origin', spell: '--c-spell',
  feat: '--c-feat', action: '--c-action', equip: '--c-equip',
};
const CAT_RGB: Record<Category, string> = {
  prof: '--c-prof-rgb', origin: '--c-origin-rgb', spell: '--c-spell-rgb',
  feat: '--c-feat-rgb', action: '--c-action-rgb', equip: '--c-equip-rgb',
};

export default function HomePage() {
  const professions = getProfessions();
  const spells = getSpells();
  const origins = getOrigins();
  const { feats: profFeats } = getProfessionFeats();
  const { feats: originFeats } = getOriginFeats();

  const stats: Array<{ label: string; value: number; category: Category }> = [
    { label: "Professions", value: professions.length, category: "prof" },
    { label: "Spells",      value: spells.length,      category: "spell" },
    { label: "Origins",     value: origins.length,     category: "origin" },
    { label: "Feats",       value: profFeats.length + originFeats.length, category: "feat" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', padding: '44px 0 56px' }}>

      {/* ── Hero ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
          letterSpacing: '2.4px', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: '12px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ color: 'var(--gold)' }}>◆</span>
          Player Reference · Edition I
        </p>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontWeight: 500, fontSize: 'clamp(48px, 8vw, 76px)',
          lineHeight: 1.05, letterSpacing: '-1.2px',
          color: 'var(--text-primary)', marginBottom: '16px',
        }}>
          Path of <span style={{ color: 'var(--gold-hi)' }}>Ambition</span>
        </h1>
        {/* Fading gold divider */}
        <div style={{
          height: '1px', marginBottom: '20px',
          background: 'linear-gradient(90deg, var(--gold) 0%, var(--border) 55%, transparent 100%)',
          maxWidth: '400px',
        }} />
        <p style={{
          fontSize: '0.9375rem', color: 'var(--text-secondary)',
          lineHeight: 1.65, maxWidth: '620px', marginBottom: '24px',
        }}>
          A player reference for the Path of Ambition tabletop RPG. Browse
          professions, spells, origins, feats, and more — all in one organized place.
        </p>
        {/* Hero actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <SearchField
            placeholder="Search all content"
            showKbd
            style={{ width: '360px', maxWidth: '100%' }}
          />
          <Link href="/characters/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '11px 18px',
            background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-dim) 100%)',
            color: '#1c1409', border: '1px solid var(--gold)',
            borderRadius: '8px', textDecoration: 'none',
            fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.75rem',
            letterSpacing: '0.04em', whiteSpace: 'nowrap',
          }}>
            Start a new character →
          </Link>
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        backgroundColor: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: '12px', overflow: 'hidden',
      }}>
        {stats.map((s, i) => {
          const rgb = CAT_RGB[s.category];
          const color = CAT_VAR[s.category];
          return (
            <div key={s.label} style={{
              padding: '20px 18px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontWeight: 500,
                fontSize: '30px', lineHeight: 1,
                color: `var(${color})`, marginBottom: '4px',
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '9.5px',
                fontWeight: 500, letterSpacing: '1.8px', textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}>
                {s.label}
              </div>
              {/* Category dot */}
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                backgroundColor: `var(${color})`,
                margin: '8px auto 0',
                opacity: 0.7,
              }} />
            </div>
          );
        })}
      </div>

      {/* ── Browse compendium ── */}
      <div>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontWeight: 500, fontSize: '1.5rem', color: 'var(--text-primary)',
            whiteSpace: 'nowrap', letterSpacing: '-0.3px',
          }}>
            Browse the compendium
          </h2>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '9.5px',
            color: 'var(--text-tertiary)', whiteSpace: 'nowrap',
            letterSpacing: '1.4px', textTransform: 'uppercase',
          }}>Six sections</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {SECTIONS.map((s) => {
            const rgb = CAT_RGB[s.category];
            const color = CAT_VAR[s.category];
            return (
              <Link key={s.href} href={s.href}
                className={`card-hover card-hover-${s.category}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  backgroundColor: 'var(--panel)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '18px 20px',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Left category bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
                  backgroundColor: `var(${color})`,
                }} />
                {/* Icon tile + title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    backgroundColor: `rgb(var(${rgb}) / 0.07)`,
                    border: `1px solid rgb(var(${rgb}) / 0.20)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: `var(${color})`, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                    fontWeight: 500, fontSize: '1.05rem', color: 'var(--text-primary)',
                    letterSpacing: '-0.2px',
                  }}>
                    {s.label}
                  </span>
                </div>
                {/* Description */}
                <p style={{
                  fontSize: '0.85rem', color: 'var(--text-secondary)',
                  lineHeight: 1.55, margin: 0, marginBottom: '14px',
                }}>
                  {s.description}
                </p>
                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    color: `var(${color})`, letterSpacing: '0.04em',
                  }}>
                    Open →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Resume / Activity (client, reads localStorage) ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontWeight: 500, fontSize: '1.5rem', color: 'var(--text-primary)',
            whiteSpace: 'nowrap', letterSpacing: '-0.3px',
          }}>
            Your characters
          </h2>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <Link href="/characters" style={{
            fontFamily: 'var(--font-mono)', fontSize: '9.5px',
            color: 'var(--text-tertiary)', textDecoration: 'none',
            letterSpacing: '1.4px', textTransform: 'uppercase',
          }}>
            View all →
          </Link>
        </div>
        <HomeResume />
      </div>

    </div>
  );
}
