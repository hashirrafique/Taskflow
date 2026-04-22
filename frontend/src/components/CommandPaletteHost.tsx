'use client';
import { useKeyboardShortcut } from '@/lib/useKeyboardShortcut';
import CommandPalette from './CommandPalette';
import { useCommandPalette } from '@/context/CommandPaletteContext';

export default function CommandPaletteHost() {
  const { open, openPalette, closePalette } = useCommandPalette();

  useKeyboardShortcut('k', openPalette, { ctrlOrMeta: true });

  return <CommandPalette open={open} onClose={closePalette} />;
}
