import { buildSearchIndex } from '@/lib/data';
import CommandPalette from './CommandPalette';

export default function CommandPaletteServer() {
  const index = buildSearchIndex();
  return <CommandPalette index={index} />;
}
