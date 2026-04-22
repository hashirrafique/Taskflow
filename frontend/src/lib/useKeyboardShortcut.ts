'use client';
import { useEffect } from 'react';

type Handler = (e: KeyboardEvent) => void;

export function useKeyboardShortcut(
  keys: string | string[],
  handler: Handler,
  opts: { ctrlOrMeta?: boolean; shift?: boolean; alt?: boolean; preventDefault?: boolean } = {}
) {
  useEffect(() => {
    const list = Array.isArray(keys) ? keys : [keys];
    const handle = (e: KeyboardEvent) => {
      if (opts.ctrlOrMeta && !(e.ctrlKey || e.metaKey)) return;
      if (!opts.ctrlOrMeta && (e.ctrlKey || e.metaKey)) return;
      if (opts.shift && !e.shiftKey) return;
      if (opts.alt && !e.altKey) return;
      const key = e.key.toLowerCase();
      if (list.some((k) => k.toLowerCase() === key)) {
        if (opts.preventDefault !== false) e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keys, handler, opts.ctrlOrMeta, opts.shift, opts.alt]);
}
