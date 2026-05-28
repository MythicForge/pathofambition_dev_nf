import PageHeader from "@/components/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Actions" };

type ActionEntry = { name: string; ap: string; description: string };
type Subsection = { name: string; actions: ActionEntry[] };
type Section = { name: string; subtitle: string; subsections: Subsection[] };

const COMPLEXITY_SCALE = [
  { level: "Simple / Easy", ap: "1 AP", examples: "Flip furniture, draw a weapon, shout a command" },
  { level: "Advanced / Medium", ap: "2 AP", examples: "Cause destruction, disarm a trap, calm an ally" },
  { level: "Complex / Hard", ap: "3 AP", examples: "Manipulate fire, redirect a spell, jury-rig equipment" },
  { level: "Elaborate / Arduous", ap: "4 AP", examples: "Tear out a pillar and swing it, reshape terrain" },
];

const SECTIONS: Section[] = [
  {
    name: "Offensive",
    subtitle: "Actions taken with intent to cause harm, whether lethal or non-lethal.",
    subsections: [
      {
        name: "Weapon",
        actions: [
          { name: "Quick Scrape", ap: "1 AP", description: "On hit, deal half weapon damage only. May also bash with a shield. Critical: full weapon damage, no modifiers." },
          { name: "Strike", ap: "2 AP", description: "On hit, deal weapon damage dice + modifiers. Critical: deal damage equal to half of weapon's max damage (e.g. 2d6 on crit deals an additional 6). Dual wielding: two attack rolls, add modifier once." },
          { name: "Power Strike", ap: "3 AP", description: "Attack at −5 to roll. On hit, deal double damage dice + modifiers. Critical: same as Strike. Dual wielding: one attack roll for both weapons." },
        ],
      },
      {
        name: "Magic",
        actions: [
          { name: "Cast a Spell", ap: "2 AP", description: "Use a Prepared Spell or Cantrip. Attack roll using spellcasting modifier. Critical hit or target critical failure on save: trigger critical spell effects; damage spells deal at minimum half the spell's damage." },
          { name: "Charged Cantrip", ap: "3 AP", description: "Use a damaging Cantrip. On hit, deal double damage dice + modifiers if applicable. Critical: deal damage equal to half of cantrip's max damage." },
        ],
      },
    ],
  },
  {
    name: "Maneuver",
    subtitle: "Requires you not be Restrained (for movement actions).",
    subsections: [
      {
        name: "Movement",
        actions: [
          { name: "Dash", ap: "2 AP", description: "Move to an adjacent zone." },
          { name: "Disengage", ap: "1 AP", description: "Break free from Engagement and regain movement." },
          { name: "Flank", ap: "1 AP", description: "Give an ally Resolve on their next attack roll against any target in the Engagement." },
          { name: "Go Prone / Stand", ap: "1 AP", description: "Toggle between Standing and the Prone condition." },
        ],
      },
      {
        name: "Control",
        actions: [
          { name: "Shove", ap: "1 AP", description: "Push a target out of your Engagement or into a hazard. Attack roll: Body vs. Body Defense." },
          { name: "Trip", ap: "2 AP", description: "Knock a target down, inflicting Prone. Attack roll: Body vs. Body Defense." },
          { name: "Grapple", ap: "2 AP", description: "Inflict the Restrained condition. Attack roll: Body vs. Body Defense." },
        ],
      },
    ],
  },
  {
    name: "Utility",
    subtitle: "Actions that protect yourself or interact with the environment.",
    subsections: [
      {
        name: "Preservation",
        actions: [
          { name: "Dodge", ap: "2 AP", description: "Gain Strain on incoming attacks until your next turn." },
          { name: "Hide", ap: "2 AP", description: "Make a Stealth check. In combat: become Obscured. Outside combat: become Hidden." },
          { name: "Cover", ap: "1 AP", description: "Move behind or hold a large object. Gain +2 to Armor vs. ranged attacks or attacks from outside your Zone." },
          { name: "Distract", ap: "1 AP", description: "The next attack roll against a chosen ally has Strain." },
        ],
      },
      {
        name: "Interact",
        actions: [
          { name: "Assist / Aid", ap: "1 AP", description: "Target within Touch range. Remove Burning or Bleeding condition, or grant bonus dice equal to your Skill pool on a Proficient skill check." },
          { name: "Interact", ap: "0→1 AP", description: "Interact with an object within range. Free on first use; costs 1 AP on subsequent uses per turn." },
          { name: "Scan / Perception", ap: "1 AP", description: "Make a Mind check to reveal Hidden or Obscured targets." },
          { name: "Hold Action", ap: "Action-based", description: "Declare an action and a trigger. When the trigger occurs, you may act. Cannot target a creature using Disengage." },
          { name: "Alchemical Item", ap: "2 AP", description: "Use an alchemical item on yourself or a target within the item's range." },
          { name: "Command", ap: "1→3 AP", description: "Issue commands to a summoned creature or pet, expending your AP instead of theirs for actions of 2 AP or less. Cost increases each use up to 3 AP." },
          { name: "Brace", ap: "1 AP", description: "Use an item with the Brace trait. Gain +2 to attack (weapon) or +2 to Armor Defense (shield or armor)." },
        ],
      },
    ],
  },
];

const SECTION_COLOR: Record<string, string> = {
  Offensive: "var(--c-action)",
  Maneuver: "var(--gold)",
  Utility: "var(--c-spell)",
};

const SECTION_RGB: Record<string, string> = {
  Offensive: "--c-action-rgb",
  Maneuver: "--gold-rgb",
  Utility: "--c-spell-rgb",
};

function ApBadge({ ap }: { ap: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontWeight: 700,
      fontSize: "9.5px",
      letterSpacing: "1.2px",
      textTransform: "uppercase",
      padding: "3px 9px",
      borderRadius: "12px",
      backgroundColor: "rgb(var(--c-action-rgb) / 0.14)",
      color: "var(--c-action)",
      border: "1px solid rgb(var(--c-action-rgb) / 0.40)",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {ap}
    </span>
  );
}

export default function ActionsPage() {
  const totalActions = SECTIONS.reduce(
    (n, s) => n + s.subsections.reduce((m, sub) => m + sub.actions.length, 0),
    0,
  );

  return (
    <div style={{ maxWidth: "860px" }}>
      <PageHeader
        eyebrow="Reference · Actions"
        title="Actions"
        subtitle="All combat and narrative actions available to characters, grouped by type."
        count={totalActions}
        countLabel="actions"
      />

      {/* AP info callout */}
      <div style={{
        padding: "14px 18px",
        background: "linear-gradient(90deg, rgb(var(--c-action-rgb) / 0.06) 0%, transparent 80%)",
        border: "1px solid var(--border)",
        borderLeft: "2px solid var(--c-action)",
        borderRadius: "12px",
        marginBottom: "28px",
        fontFamily: "var(--font-heading)",
        fontStyle: "italic",
        fontSize: "15px",
        color: "var(--text-primary)",
        lineHeight: 1.6,
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontStyle: "normal", fontSize: "9.5px", letterSpacing: "1.6px", textTransform: "uppercase", color: "var(--c-action)", display: "block", marginBottom: "6px" }}>
          Action Points
        </span>
        All creatures start with <strong>4 AP</strong> at the beginning of each round, which refreshes at the start of their next turn.
      </div>

      {/* Main sections */}
      {SECTIONS.map((section) => {
        const color = SECTION_COLOR[section.name] ?? "var(--gold)";
        const rgb = SECTION_RGB[section.name] ?? "--gold-rgb";
        return (
          <div key={section.name} style={{ marginBottom: "32px" }}>
            {/* Section header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}>
              <span style={{ width: "3px", height: "20px", borderRadius: "2px", backgroundColor: color, flexShrink: 0 }} />
              <div>
                <div style={{
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: "1.4rem",
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                }}>
                  {section.name}
                </div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                  fontStyle: "italic",
                }}>
                  {section.subtitle}
                </div>
              </div>
            </div>

            {/* Subsections */}
            {section.subsections.map((sub) => (
              <div key={sub.name} style={{ marginBottom: "14px" }}>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "1.8px",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "8px",
                  paddingBottom: "6px",
                  borderBottom: "1px solid var(--border)",
                }}>
                  {sub.name}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {sub.actions.map((action) => (
                    <div
                      key={action.name}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "var(--panel)",
                        border: "1px solid var(--border)",
                        borderLeft: `2px solid ${color}`,
                        borderRadius: "10px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginBottom: "6px",
                        }}>
                          <span style={{
                            fontFamily: "var(--font-heading)",
                            fontStyle: "italic",
                            fontWeight: 600,
                            fontSize: "15px",
                            color: "var(--text-primary)",
                          }}>
                            {action.name}
                          </span>
                          <ApBadge ap={action.ap} />
                        </div>
                        <p style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {action.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Complexity scale */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", letterSpacing: "1.8px", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>
          When in Doubt, Get Creative
        </div>
        <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: "15px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.6 }}>
          Not sure if something costs AP? Use this complexity scale — and when in doubt, ask your GM.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {COMPLEXITY_SCALE.map((row) => (
            <div
              key={row.level}
              style={{
                padding: "12px 14px",
                backgroundColor: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <ApBadge ap={row.ap} />
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontWeight: 500, fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>
                  {row.level}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {row.examples}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
