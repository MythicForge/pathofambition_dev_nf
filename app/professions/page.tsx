import { getProfessions } from '@/lib/data';
import PageHeader from '@/components/PageHeader';
import ProfessionsClient from '@/components/ProfessionsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Professions' };

export default function ProfessionsPage() {
  const professions = getProfessions();

  return (
    <div>
      <PageHeader
        eyebrow="Reference · Professions"
        title="Professions"
        subtitle="Choose your path — each profession defines your character's role, abilities, and available paths."
        count={professions.length}
        countLabel="professions"
      />
      <ProfessionsClient professions={professions} />
    </div>
  );
}
