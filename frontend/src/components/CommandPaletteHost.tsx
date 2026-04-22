'use client';
import { useState } from 'react';
import { useKeyboardShortcut } from '@/lib/useKeyboardShortcut';
import CommandPalette from './CommandPalette';

export default function CommandPaletteHost() {
  const [open, setOpen] = useState(false);

  useKeyboardShortcut('k', () => setOpen(true), { ctrlOrMeta: true });

  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}
