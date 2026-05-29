import { getSpells } from '@/lib/data';
import PageHeader from '@/components/PageHeader';
import SpellsClient from '@/components/SpellsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Spells' };

export default function SpellsPage() {
  const spells = getSpells();
  return (
    <div>
      <PageHeader
        eyebrow="Reference · Spells"
        title="Spells"
        subtitle="All spells organized by tier. Filter by school, source, or tier — or search by name."
        count={spells.length}
        countLabel="spells"
      />
      <SpellsClient spells={spells} />
    </div>
  );
}
