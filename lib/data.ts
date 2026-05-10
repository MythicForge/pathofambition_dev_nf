import fs from 'fs';
import path from 'path';
import type {
  Profession,
  Spell,
  Origin,
  Feat,
  FeatOwner,
  ActionGroup,
  Action,
  SearchResult,
} from './types';

const contentDir = path.join(process.cwd(), 'content');

function readJSON<T>(filename: string): T {
  const filePath = path.join(contentDir, filename);
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^﻿/, '');
  return JSON.parse(raw) as T;
}

// ─── Professions ──────────────────────────────────────────────────────────────

type SourceFeature = {
  name: string;
  tag?: string;
  raw_markdown?: string;
  trait_label?: string;
  trait_raw?: string;
  cost?: string;
  traits?: string[];
  description_markdown?: string;
};

type SourceProfession = {
  name: string;
  flavor?: string;
  favored_attributes?: string;
  starting_vitality?: string;
  vitality_gained_per_tier?: string;
  body_modifier_bonus?: string;
  proficiencies?: { vitals_skills?: string; armaments?: string; protection?: string; tool_kit?: string; raw?: string };
  starting_pack?: { weapons?: string; armor?: string; kit?: string; inventory?: string; starting_currency?: string; raw?: string };
  features?: SourceFeature[];
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseActivation(cost?: string) {
  const raw = (!cost || cost === '–' || cost === '-') ? '-' : cost;
  const resources: Record<string, number> = {};
  if (raw !== '-') {
    const m = raw.match(/^(\d+)\s+(Ambition|AP|Cadence|Adrenaline)/i);
    if (m) resources[m[2].toLowerCase()] = parseInt(m[1]);
  }
  return { raw, resources, properties: {}, notes: [] };
}

function splitItems(s?: string): string[] {
  return s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [];
}

export function getProfessions(): Profession[] {
  const src = readJSON<Record<string, SourceProfession>>('profession_data2.json');
  return Object.entries(src).map(([key, p]) => {
    const slug = slugify(p.name ?? key);
    const pr = p.proficiencies;
    const sp = p.starting_pack;
    return {
      id: slug,
      name: p.name ?? key,
      slug,
      role: '',
      flavor: p.flavor ?? '',
      favored_attributes_raw: p.favored_attributes ?? '',
      starting_vitality: p.starting_vitality ?? '',
      vitality_gained_per_tier: p.vitality_gained_per_tier ?? '',
      body_modifier_bonus: p.body_modifier_bonus ?? '',
      proficiencies: {
        vitals_skills: splitItems(pr?.vitals_skills),
        armaments: splitItems(pr?.armaments),
        protection: splitItems(pr?.protection),
        tool_kits: splitItems(pr?.tool_kit),
        raw: pr?.raw ?? '',
      },
      starting_pack: {
        weapons: { raw: sp?.weapons ?? '', items: splitItems(sp?.weapons) },
        armor: { raw: sp?.armor ?? '', items: splitItems(sp?.armor) },
        kit: { raw: sp?.kit ?? '', items: splitItems(sp?.kit) },
        inventory: { raw: sp?.inventory ?? '', items: splitItems(sp?.inventory) },
        starting_currency: sp?.starting_currency ?? null,
        raw: sp?.raw ?? '',
      },
      path_options: [],
      features: (p.features ?? []).map((f) => ({
        id: `professions-${slug}-base-${slugify(f.name)}`,
        name: f.name,
        slug: slugify(f.name),
        owner_type: 'profession',
        owner_id: slug,
        owner_name: p.name ?? key,
        tag: f.tag ?? '',
        trait_label: f.trait_label ?? 'Trait',
        trait_raw: f.trait_raw ?? '',
        traits: f.traits ?? [],
        activation: parseActivation(f.cost),
        description_markdown: f.description_markdown ?? '',
        raw_markdown: f.raw_markdown ?? '',
      })),
    };
  });
}

export function getProfession(slug: string): Profession | undefined {
  return getProfessions().find((p) => p.slug === slug);
}

// ─── Spells ───────────────────────────────────────────────────────────────────

type SourceSpell = {
  name: string;
  tier: string;
  raw_markdown?: string;
  description_markdown?: string;
  school?: string;
  spheres?: string[];
  range?: string;
  duration?: string;
  amps?: { cost: string; effect: string }[];
};

const SPELL_TIER_MAP: Record<string, number> = {
  Cantrips: 0, 'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3,
  'Tier 4': 4, 'Tier 5': 5, 'Tier 6': 6,
};

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, '').trim();
}

export function getSpells(): Spell[] {
  const src = readJSON<Record<string, SourceSpell[]>>('spell_data2.json');
  const spells: Spell[] = [];
  for (const [tierLabel, entries] of Object.entries(src)) {
    const tierNum = SPELL_TIER_MAP[tierLabel] ?? 1;
    const isCantrip = tierLabel === 'Cantrips';
    for (const s of entries) {
      const id = slugify(s.name);
      if (!id) continue;
      const school = stripHtml(s.school ?? '');
      spells.push({
        id,
        name: s.name,
        slug: id,
        tier: tierNum,
        tier_label: tierLabel,
        is_cantrip: isCantrip,
        reference_only: false,
        school,
        school_display: school,
        sources: s.spheres ?? [],
        range: s.range ?? '',
        duration: s.duration ?? '',
        description_markdown: s.description_markdown ?? '',
        raw_markdown: s.raw_markdown ?? '',
        amps: s.amps ?? [],
      });
    }
  }
  return spells;
}

export function getSpell(slug: string): Spell | undefined {
  return getSpells().find((s) => s.slug === slug);
}

export function getSpellSchools(): string[] {
  const spells = getSpells();
  return [...new Set(spells.map((s) => s.school).filter(Boolean))].sort();
}

export function getSpellSources(): string[] {
  const spells = getSpells();
  const all = spells.flatMap((s) => s.sources);
  return [...new Set(all)].sort();
}

// ─── Origins ──────────────────────────────────────────────────────────────────

export function getOrigins(): Origin[] {
  const data = readJSON<{ origins: Origin[] }>('origins.normalized.json');
  return data.origins;
}

export function getOrigin(slug: string): Origin | undefined {
  return getOrigins().find((o) => o.slug === slug);
}

// ─── Origin Feats ─────────────────────────────────────────────────────────────

export function getOriginFeats(): { owners: FeatOwner[]; feats: Feat[] } {
  const data = readJSON<{ owners: FeatOwner[]; feats: Feat[] }>(
    'origin_feats.normalized.json'
  );
  return data;
}

// ─── Profession Feats ─────────────────────────────────────────────────────────

type SourceFeat = {
  name: string;
  tag?: string;
  raw_markdown?: string;
  trait_raw?: string;
  cost?: string;
  traits?: string[];
  description_markdown?: string;
  required?: string;
  path_investment?: string;
};

const TIER_MAP: Record<string, number> = { 'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3, 'Capstone': 5 };

export function getProfessionFeats(): { owners: FeatOwner[]; feats: Feat[] } {
  const src = readJSON<Record<string, { name: string; tiers: Array<{ tier: string; feats: SourceFeat[] }> }>>('profession_feats2.json');
  const owners: FeatOwner[] = [];
  const feats: Feat[] = [];
  for (const [key, owner] of Object.entries(src)) {
    const ownerId = slugify(owner.name ?? key);
    owners.push({ id: ownerId, name: owner.name ?? key });
    for (const tierBlock of owner.tiers ?? []) {
      const tierNum = TIER_MAP[tierBlock.tier] ?? 1;
      for (const f of tierBlock.feats ?? []) {
        const featSlug = slugify(f.name);
        feats.push({
          id: `profession-feats-${ownerId}-${tierNum}-${featSlug}`,
          name: f.name,
          slug: featSlug,
          owner_id: ownerId,
          owner_name: owner.name ?? key,
          tag: f.tag,
          tier: tierNum,
          required: f.required && f.required !== '-' ? f.required : undefined,
          path_investment: f.path_investment && f.path_investment !== '-' ? f.path_investment : undefined,
          traits: f.traits ?? [],
          activation: { raw: f.cost && f.cost !== '-' ? f.cost : '-' },
          description_markdown: f.description_markdown ?? '',
          raw_markdown: f.raw_markdown ?? '',
        });
      }
    }
  }
  return { owners, feats };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function getActions(): { groups: ActionGroup[]; actions: Action[] } {
  const data = readJSON<{ action_groups: ActionGroup[]; actions: Action[] }>(
    'actions.normalized.json'
  );
  return { groups: data.action_groups, actions: data.actions };
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export function getEquipment(): Record<string, unknown> {
  return readJSON<Record<string, unknown>>('equipment.normalized.json');
}

// ─── Search Index ─────────────────────────────────────────────────────────────

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  // Professions
  getProfessions().forEach((p) => {
    results.push({
      type: 'profession',
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.role,
      tags: p.path_options,
    });
    // Profession features
    p.features.forEach((f) => {
      results.push({
        type: 'profession',
        id: f.id,
        name: `${p.name}: ${f.name}`,
        slug: p.slug,
        description: f.description_markdown?.replace(/[*_#`>\[\]]/g, '').slice(0, 200) ?? '',
        tags: f.traits,
      });
    });
  });

  // Spells
  getSpells().forEach((s) => {
    results.push({
      type: 'spell',
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: (s.description_markdown ?? '')?.replace(/[*_#`>\[\]]/g, '').slice(0, 200) ?? '',
      tags: [s.school, ...(s.sources ?? []), s.tier_label].filter(Boolean),
    });
  });

  // Origins
  getOrigins().forEach((o) => {
    results.push({
      type: 'origin',
      id: o.id,
      name: o.name,
      slug: o.slug,
      description: o.flavor,
    });
    o.vocations.forEach((v) => {
      results.push({
        type: 'origin',
        id: v.id,
        name: `${o.name}: ${v.name}`,
        slug: o.slug,
        description: v.flavor,
        tags: [v.attribute_bonus.raw],
      });
    });
  });

  // Origin Feats
  const { feats: originFeats } = getOriginFeats();
  originFeats.forEach((f) => {
    results.push({
      type: 'feat',
      id: f.id,
      name: f.name,
      slug: f.owner_id,
      description: f.description_markdown?.replace(/[*_#`>\[\]]/g, '').slice(0, 200) ?? '',
      tags: f.traits,
    });
  });

  // Profession Feats
  const { feats: profFeats } = getProfessionFeats();
  profFeats.forEach((f) => {
    results.push({
      type: 'feat',
      id: f.id,
      name: f.name,
      slug: f.owner_id,
      description: f.description_markdown?.replace(/[*_#`>\[\]]/g, '').slice(0, 200) ?? '',
      tags: f.traits,
    });
  });

  // Actions
  const { actions } = getActions();
  actions.forEach((a) => {
    results.push({
      type: 'action',
      id: a.id,
      name: a.name,
      slug: a.slug,
      description: a.description_markdown?.replace(/[*_#`>\[\]]/g, '').slice(0, 200) ?? '',
      tags: a.traits,
    });
  });

  return results;
}
