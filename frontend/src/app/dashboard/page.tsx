'use client';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/useRequireAuth';
import Topbar from '@/components/Topbar';
import { Plus, Users, ListChecks, LogIn, Loader2, X } from 'lucide-react';

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

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl mb-1">Workspaces</h1>
            <p className="text-ink-400 text-sm">
              {workspaces.length === 0 ? 'Create your first workspace to get started' : `${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setShowJoin(true)}>
              <LogIn className="w-4 h-4" /> Join
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> New workspace
            </button>
          </div>
        </div>

        {err && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">{err}</div>}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="card p-6 h-36 animate-pulse" />)}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-6xl mb-4 opacity-30">◯</div>
            <h3 className="font-display text-2xl mb-2">No workspaces yet</h3>
            <p className="text-ink-400 text-sm mb-6">Create one or join with an invite code</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Create workspace
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((w) => (
              <Link key={w._id} href={`/workspaces/${w._id}`} className="card p-6 hover:border-white/20 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-semibold text-white" style={{ background: w.color || '#6366f1' }}>
                    {w.name[0].toUpperCase()}
                  </div>
                  <span className="badge bg-white/5 text-ink-300">{w.myRole}</span>
                </div>
                <h3 className="font-display text-xl mb-1 group-hover:text-accent transition-colors">{w.name}</h3>
                {w.description && <p className="text-sm text-ink-400 mb-4 line-clamp-2">{w.description}</p>}
                <div className="flex gap-4 text-xs text-ink-500 mt-auto pt-3">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {w.memberCount}</span>
                  <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {w.taskCount}</span>
                </div>
              </Link>
            ))}
          </div>
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
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444'];

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
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="e.g. Product Launch Q2" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Description (optional)</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this workspace for?" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">Color</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-900' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </div>
        {err && <div className="text-sm text-red-400">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create
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
          <input className="input font-mono text-center tracking-widest uppercase" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="XXXXXXXXXX" maxLength={12} />
          <p className="text-xs text-ink-500 mt-2">Ask the workspace owner for the invite code.</p>
        </div>
        {err && <div className="text-sm text-red-400">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Join
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
