'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, ListChecks, Calendar, BarChart3, Settings, User,
  LogOut, Plus, Sparkles, ArrowRight, Command as CommandIcon, Bell, Shield,
  ChevronRight
} from 'lucide-react';

interface Action {
  id: string;
  label: string;
  hint?: string;
  icon: any;
  section: string;
  run: () => void;
  kbd?: string;
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [searchResults, setSearchResults] = useState<{ tasks: any[]; workspaces: any[] }>({ tasks: [], workspaces: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!q || q.length < 2) { setSearchResults({ tasks: [], workspaces: [] }); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await api.globalSearch(q);
        if (!cancelled) setSearchResults(res);
      } catch {}
    }, 180);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const actions: Action[] = useMemo(() => [
    { id: 'nav-dash', label: 'Go to Dashboard', icon: LayoutDashboard, section: 'Navigation', run: () => navigate('/dashboard'), kbd: 'G D' },
    { id: 'nav-my', label: 'My Tasks', icon: ListChecks, section: 'Navigation', run: () => navigate('/my-tasks'), kbd: 'G T' },
    { id: 'nav-cal', label: 'Calendar', icon: Calendar, section: 'Navigation', run: () => navigate('/calendar'), kbd: 'G C' },
    { id: 'nav-analytics', label: 'Analytics', icon: BarChart3, section: 'Navigation', run: () => navigate('/analytics'), kbd: 'G A' },
    { id: 'nav-settings', label: 'Settings', icon: Settings, section: 'Navigation', run: () => navigate('/settings'), kbd: 'G S' },
    { id: 'nav-profile', label: 'Profile settings', icon: User, section: 'Navigation', run: () => navigate('/settings') },
    { id: 'nav-security', label: 'Security settings', icon: Shield, section: 'Navigation', run: () => navigate('/settings') },
    { id: 'nav-notifications', label: 'Notification preferences', icon: Bell, section: 'Navigation', run: () => navigate('/settings') },
    { id: 'act-new-ws', label: 'Create new workspace', icon: Plus, section: 'Actions', run: () => navigate('/dashboard?new=1'), hint: 'Opens the creation modal' },
    { id: 'act-logout', label: 'Sign out', icon: LogOut, section: 'Actions', run: () => { logout(); onClose(); } },
  ], [router, logout]);

  const filteredActions = useMemo(() => {
    if (!q.trim()) return actions;
    const needle = q.toLowerCase();
    return actions.filter((a) =>
      a.label.toLowerCase().includes(needle) ||
      a.section.toLowerCase().includes(needle)
    );
  }, [q, actions]);

  // Build a flat result list: actions + tasks + workspaces
  const flat = useMemo(() => {
    const items: { type: 'action' | 'task' | 'workspace'; data: any }[] = [];
    filteredActions.forEach((a) => items.push({ type: 'action', data: a }));
    searchResults.workspaces.forEach((w) => items.push({ type: 'workspace', data: w }));
    searchResults.tasks.forEach((t) => items.push({ type: 'task', data: t }));
    return items;
  }, [filteredActions, searchResults]);

  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, flat.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        const it = flat[active];
        if (!it) return;
        if (it.type === 'action') it.data.run();
        else if (it.type === 'task') navigate(`/workspaces/${it.data.workspace}`);
        else if (it.type === 'workspace') navigate(`/workspaces/${it.data._id}`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flat, active, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: -12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -12, transition: { duration: 0.1 } }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full max-w-xl card-elevated overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06]">
              <Search className="w-4.5 h-4.5 text-ink-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-ink-500 text-sm"
                placeholder="Search tasks, workspaces, or jump to a page…"
              />
              <kbd className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-ink-400">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
              {flat.length === 0 ? (
                <div className="px-4 py-10 text-center text-ink-500 text-sm">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  No results for "{q}"
                </div>
              ) : (
                <>
                  <Section title="Navigation & Actions" items={flat.filter((f) => f.type === 'action')} startIdx={0} active={active} onPick={(i: number) => { flat[i].data.run(); }} flat={flat} />
                  {searchResults.workspaces.length > 0 && (
                    <Section
                      title="Workspaces"
                      items={flat.filter((f) => f.type === 'workspace')}
                      startIdx={flat.findIndex((f) => f.type === 'workspace')}
                      active={active}
                      onPick={(i: number) => navigate(`/workspaces/${flat[i].data._id}`)}
                      flat={flat}
                    />
                  )}
                  {searchResults.tasks.length > 0 && (
                    <Section
                      title="Tasks"
                      items={flat.filter((f) => f.type === 'task')}
                      startIdx={flat.findIndex((f) => f.type === 'task')}
                      active={active}
                      onPick={(i: number) => navigate(`/workspaces/${flat[i].data.workspace}`)}
                      flat={flat}
                    />
                  )}
                </>
              )}
            </div>

            <div className="px-4 h-10 border-t border-white/[0.06] flex items-center justify-between text-xs text-ink-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5"><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> Navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="kbd">↵</kbd> Select</span>
              </div>
              <span className="flex items-center gap-1.5"><CommandIcon className="w-3 h-3" /> TaskFlow</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, items, startIdx, active, onPick, flat }: any) {
  if (!items.length) return null;
  return (
    <div className="mb-1">
      <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-semibold">{title}</div>
      {items.map((it: any, j: number) => {
        const idx = flat.indexOf(it);
        const isActive = idx === active;
        return (
          <button
            key={it.data._id || it.data.id || j}
            data-idx={idx}
            onMouseEnter={() => {}}
            onClick={() => onPick(idx)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
              isActive ? 'bg-accent/15 text-white' : 'text-ink-200 hover:bg-white/4'
            }`}
          >
            {it.type === 'action' && (
              <>
                <it.data.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : 'text-ink-400'}`} />
                <span className="flex-1 truncate">{it.data.label}</span>
                {it.data.kbd && <kbd className="kbd text-[10px]">{it.data.kbd}</kbd>}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent" />}
              </>
            )}
            {it.type === 'workspace' && (
              <>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: it.data.color || '#6366f1' }}>
                  {it.data.name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate">{it.data.name}</div>
                  <div className="text-xs text-ink-500">Workspace</div>
                </div>
                {isActive && <ArrowRight className="w-3.5 h-3.5 text-accent" />}
              </>
            )}
            {it.type === 'task' && (
              <>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: it.data.workspaceColor || '#6366f1' }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{it.data.title}</div>
                  <div className="text-xs text-ink-500 truncate">
                    <span className="badge bg-white/5 mr-1 text-[9px]">{it.data.status?.replace('_', ' ')}</span>
                    in {it.data.workspaceName}
                  </div>
                </div>
                {isActive && <ArrowRight className="w-3.5 h-3.5 text-accent" />}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
