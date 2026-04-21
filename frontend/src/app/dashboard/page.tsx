'use client';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import Topbar from '@/components/Topbar';
import { motion } from 'framer-motion';
import {
  Plus, Users, ListChecks, LogIn, Loader2, X, Sparkles,
  LayoutGrid, Clock, TrendingUp, ArrowRight
} from 'lucide-react';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } };

export default function Dashboard() {
  const { loading: authLoading, user } = useRequireAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const load = async () => {
    try {
      const { workspaces } = await api.listWorkspaces();
      setWorkspaces(workspaces);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  if (authLoading || !user) return <FullScreenLoader />;

  const totalTasks = workspaces.reduce((a, w) => a + (w.taskCount || 0), 0);
  const totalMembers = workspaces.reduce((a, w) => a + (w.memberCount || 0), 0);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-ink-400 text-sm mb-1">{greeting},</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">{user.name?.split(' ')[0]} 👋</h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="btn btn-ghost border-white/10" onClick={() => setShowJoin(true)}>
              <LogIn className="w-4 h-4" /> Join workspace
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> New workspace
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        {workspaces.length > 0 && (
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {[
              { label: 'Workspaces', value: workspaces.length, icon: LayoutGrid, color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'Total tasks', value: totalTasks, icon: ListChecks, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Members', value: totalMembers, icon: Users, color: 'text-pink-400', bg: 'bg-pink-400/10' },
              { label: 'Active today', value: Math.min(workspaces.length, 3), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} variants={item} className="card p-5">
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {err && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">{err}</div>}

        {/* Workspaces section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold">Your Workspaces</h2>
          {workspaces.length > 0 && (
            <span className="text-xs text-ink-500 bg-white/5 px-2.5 py-1 rounded-full">
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="card p-6 h-40 skeleton" />)}
          </div>
        ) : workspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-16 text-center border-dashed border-white/10"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">No workspaces yet</h3>
            <p className="text-ink-400 text-sm mb-7 max-w-xs mx-auto">Create your first workspace to start organizing tasks and collaborating with your team.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="btn btn-primary gap-2" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Create workspace
              </button>
              <button className="btn btn-ghost border-white/10 gap-2" onClick={() => setShowJoin(true)}>
                <LogIn className="w-4 h-4" /> Join with invite code
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {workspaces.map((w) => (
              <motion.div key={w._id} variants={item}>
                <Link href={`/workspaces/${w._id}`} className="card p-6 hover:border-white/15 hover:-translate-y-0.5 transition-all group block">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-display text-xl font-bold text-white shadow-lg"
                      style={{ background: w.color || '#6366f1', boxShadow: `0 4px 14px ${w.color || '#6366f1'}40` }}
                    >
                      {w.name[0].toUpperCase()}
                    </div>
                    <span className="badge bg-white/5 text-ink-400 border border-white/8 capitalize">{w.myRole}</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-1.5 group-hover:text-accent transition-colors">{w.name}</h3>
                  {w.description && (
                    <p className="text-sm text-ink-400 mb-4 line-clamp-2 leading-relaxed">{w.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
                    <div className="flex gap-4 text-xs text-ink-500">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {w.memberCount} member{w.memberCount !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" /> {w.taskCount} task{w.taskCount !== 1 ? 's' : ''}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Create new card */}
            <motion.div variants={item}>
              <button
                onClick={() => setShowCreate(true)}
                className="card p-6 w-full h-full min-h-[160px] border-dashed border-white/10 hover:border-accent/30 hover:bg-accent/3 transition-all group flex flex-col items-center justify-center gap-3 text-ink-500 hover:text-accent"
              >
                <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">New workspace</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </main>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onDone={load} />}
      {showJoin && <JoinModal onClose={() => setShowJoin(false)} onDone={load} />}
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
    </div>
  );
}

function CreateModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#f97316', '#14b8a6'];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await api.createWorkspace({ name, description, color });
      await onDone();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New workspace" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Workspace name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="e.g. Product Launch Q2" autoFocus />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Description <span className="text-ink-600 normal-case">(optional)</span></label>
          <textarea className="input resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this workspace for?" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2.5">Color</label>
          <div className="flex gap-2.5 flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-900 scale-110' : ''}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        {err && <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" className="btn btn-ghost flex-1 border-white/10" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create workspace
          </button>
        </div>
      </form>
    </Modal>
  );
}

function JoinModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await api.joinWorkspace(code.toUpperCase());
      await onDone();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Join workspace" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Invite code</label>
          <input
            className="input font-mono text-center tracking-widest uppercase text-lg"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="XXXXXXXXXX"
            maxLength={12}
            autoFocus
          />
          <p className="text-xs text-ink-500 mt-2">Ask the workspace owner for the 10-character invite code.</p>
        </div>
        {err && <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" className="btn btn-ghost flex-1 border-white/10" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Join workspace
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="card-elevated p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
