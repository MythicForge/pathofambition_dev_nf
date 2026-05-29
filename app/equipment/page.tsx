import { getEquipment } from '@/lib/data';
import PageHeader from '@/components/PageHeader';
import TraitBadge from '@/components/TraitBadge';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Equipment' };

interface Weapon {
  id: string; name: string; slug: string;
  groups: string[]; damage: string;
  damage_types: Array<{ code: string; name: string }>;
  range_bands: Array<{ code: string; name: string }>;
  traits: Array<{ name: string }>; cost: number | null;
}

interface Kit {
  id: string; name: string; slug: string; subcategory: string;
  uses: string[]; bonus: string; critical: string;
}

interface Shield {
  id: string; name: string; slug: string;
  shield_type: string | null; armor_type: string | null;
  armor_bonus: { raw: string | null; value: number | null };
  reduction_pool: number; traits: Array<{ name: string }>;
}

interface ArmorType {
  id: string; type: string; bonus_range: string;
  traits: string[]; augment_slots: string;
}

interface ItemTrait {
  id: string; name: string; alias: string | null; effect: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9.5px',
        letterSpacing: '1.8px',
        textTransform: 'uppercase',
        color: 'var(--c-equip)',
        marginBottom: '4px',
      }}>
        {children}
      </div>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, var(--c-equip) 0%, var(--border) 50%, transparent 100%)' }} />
    </div>
  );
}

function RuleCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 16px',
      backgroundColor: 'var(--panel)',
      border: '1px solid var(--border)',
      borderLeft: '2px solid var(--c-equip)',
      borderRadius: '10px',
    }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function EquipmentPage() {
  const eq = getEquipment() as Record<string, unknown>;
  const rules = eq.rules as Record<string, unknown>;
  const catalog = (eq.catalog ?? {}) as Record<string, unknown[]>;
  const weapons = (catalog.weapons as Weapon[]) ?? [];
  const kits = (catalog.kits as Kit[]) ?? [];
  const shields = (catalog.shields as Shield[]) ?? [];
  const armorTypes = (eq.armor_types as ArmorType[]) ?? [];
  const itemTraits = (eq.item_traits as ItemTrait[]) ?? [];

  const recovery = rules?.recovery as Record<string, unknown>;
  const inventory = rules?.inventory as Record<string, unknown>;
  const masterwork = eq.masterwork_quality as Record<string, unknown> | undefined;

  // Canonical group order per redesign/item sort.md
  const GROUP_ORDER = ['Simple', 'Martial', 'Finesse', 'Ranged', 'Catalyst'];
  const GROUP_DESC: Record<string, string> = {
    Simple:   'Basic arms and thrown tools usable by nearly anyone. Some overlap with Finesse or Ranged for lightweight or thrown weapons.',
    Martial:  'Standard arms of trained warriors and soldiers. Includes both one-handed and two-handed battle weapons.',
    Finesse:  'Weapons relying on precision, agility, and dexterity.',
    Ranged:   'Projectile or thrown weapons used from a distance.',
    Catalyst: 'Implements for channeling or storing mystical energy. Required for most spellcasting unless stated otherwise.',
  };

  // Each weapon appears under ALL its groups (not just first)
  const weaponsByGroup: Record<string, Weapon[]> = {};
  GROUP_ORDER.forEach((g) => { weaponsByGroup[g] = []; });

  weapons.forEach((w) => {
    const matched = w.groups.filter((g) => GROUP_ORDER.includes(g));
    if (matched.length > 0) {
      matched.forEach((g) => { weaponsByGroup[g].push(w); });
    } else {
      // Unrecognized group — bucket into first group or Other
      const fallback = w.groups[0] ?? 'Other';
      if (!weaponsByGroup[fallback]) weaponsByGroup[fallback] = [];
      weaponsByGroup[fallback].push(w);
    }
  });

  const orderedGroups = [...GROUP_ORDER, ...Object.keys(weaponsByGroup).filter(g => !GROUP_ORDER.includes(g))]
    .filter((g) => weaponsByGroup[g]?.length > 0);

  return (
    <div>
      <PageHeader
        eyebrow="Reference · Equipment"
        title="Equipment"
        subtitle="Weapons, armor, kits, shields, and the rules that govern them."
      />

      {/* Recovery Rules */}
      {recovery && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Recovery</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.875rem' }}>
            {Object.entries(recovery as Record<string, Record<string, unknown>>).map(([key, val]) => {
              const typed = val as { duration?: string; restore?: Record<string, string> };
              return (
                <RuleCard key={key} title={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}>
                  <dl style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {typed.duration && (
                      <div><dt style={{ fontWeight: 600, color: 'var(--text)' }}>Duration</dt><dd style={{ marginBottom: '0.3rem' }}>{typed.duration}</dd></div>
                    )}
                    {typed.restore && Object.entries(typed.restore).map(([k, v]) => (
                      <div key={k}><dt style={{ fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{k}</dt><dd style={{ marginBottom: '0.25rem' }}>{v}</dd></div>
                    ))}
                  </dl>
                </RuleCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Inventory */}
      {inventory && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Inventory</SectionTitle>
          <div style={{ marginTop: '0.875rem', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.625rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>Carry Weight</span>
                <span style={{ color: 'var(--text-muted)' }}>{eq.carry_weight_formula as string ?? (inventory as Record<string,unknown>).carry_weight_formula as string}</span>
              </div>
              {(inventory as Record<string,Record<string,string>>).item_slots && (
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>Item Slots</span>
                  <span style={{ color: 'var(--text-muted)' }}>{(inventory as Record<string,Record<string,string>>).item_slots.default_rule}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Armor Types */}
      {armorTypes.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Armor</SectionTitle>
          <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
            {armorTypes.map((a) => (
              <div key={a.id} style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '0.625rem',
              }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.3rem' }}>
                  {a.type}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Bonus: <strong style={{ color: 'var(--text)' }}>{a.bonus_range}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Augment Slots: <strong style={{ color: 'var(--text)' }}>{a.augment_slots}</strong>
                </div>
                {a.traits.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {a.traits.map((t) => <TraitBadge key={t} trait={t} variant="muted" />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masterwork Quality */}
      {masterwork && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Masterwork Quality</SectionTitle>
          <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.625rem' }}>
            {(masterwork.tiers as Array<{ name: string; bonus: number }>).map((tier) => (
              <div key={tier.name} style={{
                padding: '0.875rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                  +{tier.bonus}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500 }}>{tier.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weapons */}
      {weapons.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Weapons</SectionTitle>
          {orderedGroups.map((group) => {
            const groupWeapons = weaponsByGroup[group];
            return (
              <div key={group} style={{ marginBottom: '2rem', marginTop: '1.25rem' }}>
                {/* Group header */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                      fontWeight: 600, fontSize: '1.0625rem',
                      color: 'var(--text-primary)', margin: 0,
                    }}>
                      {group} Weapons
                    </h3>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '9.5px',
                      color: 'var(--text-tertiary)', letterSpacing: '0.04em',
                    }}>
                      {groupWeapons.length}
                    </span>
                  </div>
                  {GROUP_DESC[group] && (
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
                      color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55,
                    }}>
                      {GROUP_DESC[group]}
                    </p>
                  )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr>
                        {['Weapon', 'Groups', 'Damage', 'Type', 'Range', 'Traits', 'Cost'].map((h) => (
                          <th key={h} style={{
                            padding: '6px 12px',
                            backgroundColor: 'var(--panel)',
                            borderBottom: '1.5px solid var(--border)',
                            borderTop: '1px solid var(--border)',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 500,
                            fontSize: '9px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--text-tertiary)',
                            textAlign: 'left',
                            whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupWeapons.map((w, i) => (
                        <tr key={w.id} style={{
                          backgroundColor: i % 2 === 0 ? 'var(--panel)' : 'var(--bg-2)',
                          transition: 'background-color 0.1s',
                        }}>
                          <td style={{
                            padding: '7px 12px', fontFamily: 'var(--font-heading)',
                            fontStyle: 'italic', fontWeight: 500,
                            fontSize: '0.875rem', color: 'var(--text-primary)',
                            whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)',
                          }}>
                            {w.name}
                          </td>
                          <td style={{ padding: '7px 12px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                              {w.groups.filter(g => g !== group).map(g => (
                                <span key={g} style={{
                                  fontFamily: 'var(--font-mono)', fontSize: '8px',
                                  fontWeight: 600, letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  color: 'var(--c-equip)',
                                  backgroundColor: 'rgb(var(--c-equip-rgb) / 0.1)',
                                  border: '1px solid rgb(var(--c-equip-rgb) / 0.3)',
                                  padding: '1px 5px', borderRadius: '3px',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {g}
                                </span>
                              ))}
                              {w.groups.length === 1 && (
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>—</span>
                              )}
                            </div>
                          </td>
                          <td style={{
                            padding: '7px 12px', color: 'var(--gold)',
                            fontFamily: 'var(--font-mono)', fontWeight: 600,
                            fontSize: '0.8rem', borderBottom: '1px solid var(--border)',
                            whiteSpace: 'nowrap',
                          }}>
                            {w.damage}
                          </td>
                          <td style={{ padding: '7px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                            {w.damage_types.map(d => d.name).join(', ')}
                          </td>
                          <td style={{ padding: '7px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                            {w.range_bands.map(r => r.name).join(', ')}
                          </td>
                          <td style={{ padding: '7px 12px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {w.traits.map(t => <TraitBadge key={t.name} trait={t.name} variant="muted" />)}
                            </div>
                          </td>
                          <td style={{
                            padding: '7px 12px', color: 'var(--text-tertiary)',
                            borderBottom: '1px solid var(--border)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                          }}>
                            {w.cost != null ? `${w.cost}g` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shields */}
      {shields.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Shields</SectionTitle>
          <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
            {shields.map((s) => (
              <div key={s.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.625rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.35rem' }}>{s.name}</h3>
                {s.shield_type && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Type: <strong style={{ color: 'var(--text)' }}>{s.shield_type}</strong></div>}
                {s.armor_bonus?.raw && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Bonus: <strong style={{ color: 'var(--primary)' }}>{s.armor_bonus.raw}</strong></div>}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Pool: <strong style={{ color: 'var(--text)' }}>{s.reduction_pool}</strong></div>
                {s.traits.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {s.traits.map(t => <TraitBadge key={t.name} trait={t.name} variant="muted" />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kits */}
      {kits.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Kits</SectionTitle>
          <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.625rem' }}>
            {kits.map((k) => (
              <div key={k.id} style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.625rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.35rem' }}>{k.name}</h3>
                {k.subcategory && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '0.4rem' }}>{k.subcategory}</div>}
                {k.bonus && <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.25rem' }}><strong>Bonus:</strong> {k.bonus}</div>}
                {k.critical && <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.25rem' }}><strong>Critical:</strong> {k.critical}</div>}
                {k.uses?.length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Uses: {k.uses.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Traits */}
      {itemTraits.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionTitle>Item Traits</SectionTitle>
          <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.625rem' }}>
            {itemTraits.map((t) => (
              <div key={t.id} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, fontFamily: 'var(--font-heading)', fontWeight: 700,
                  fontSize: '0.75rem', color: 'var(--primary)',
                  backgroundColor: 'var(--primary-light)', padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem', whiteSpace: 'nowrap',
                }}>
                  {t.name}{t.alias ? ` (${t.alias})` : ''}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.effect}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
