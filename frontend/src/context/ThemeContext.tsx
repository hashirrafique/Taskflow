'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

type Theme = 'dark' | 'light' | 'system';

interface ThemeCtx {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (t: Theme, persist?: boolean) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

function resolveSystem(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolved] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('taskflow_theme')) as Theme | null;
    if (saved) setThemeState(saved);
  }, []);

  useEffect(() => {
    const resolve = theme === 'system' ? resolveSystem() : theme;
    setResolved(resolve);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-dark', 'theme-light');
      document.documentElement.classList.add(`theme-${resolve}`);
    }
    if (theme === 'system' && typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const handler = () => setResolved(mq.matches ? 'light' : 'dark');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (t: Theme, persist = true) => {
    setThemeState(t);
    if (typeof window !== 'undefined') localStorage.setItem('taskflow_theme', t);
    if (persist) {
      api.updateTheme({ theme: t }).catch(() => {});
    }
  };

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
