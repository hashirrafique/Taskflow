'use client';
import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useWorkspaceSocket } from '@/lib/useSocket';
import { useRequireAuth } from '@/lib/useRequireAuth';
import Topbar from '@/components/Topbar';
import {
  Plus, Loader2, ArrowLeft, Users, Copy, Check, Settings, Trash2, X, Calendar, AlertCircle,
} from 'lucide-react';

type Task = {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  order: number;
  createdBy: any;
  assignedTo: any;
  dueDate: string | null;
  createdAt: string;
};

const COLUMNS: { key: Task['status']; label: string; color: string }[] = [
  { key: 'todo', label: 'To do', color: '#8e8e9e' },
  { key: 'in_progress', label: 'In progress', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

const PRIORITY_STYLE: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

export default function WorkspacePage() {
  const { loading: authLoading, user } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [workspace, setWorkspace] = useState<any>(null);
  const [myRole, setMyRole] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [showNew, setShowNew] = useState<Task['status'] | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null);

  const canEdit = myRole === 'owner' || myRole === 'admin' || myRole === 'member';

  const load = useCallback(async () => {
    try {
      const [wsRes, tasksRes] = await Promise.all([
        api.getWorkspace(id),
        api.listTasks(id),
      ]);
      setWorkspace(wsRes.workspace);
      setMyRole(wsRes.myRole);
      setTasks(tasksRes.tasks);
    } catch (e: any) {
      setErr(e.message);
      if (e.status === 403 || e.status === 404) setTimeout(() => router.push('/dashboard'), 1500);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { if (user) load(); }, [user, load]);

  // Real-time socket sync
  useWorkspaceSocket(user ? id : null, {
    onTaskCreated: (t) => setTasks((prev) => (prev.some((x) => x._id === t._id) ? prev : [...prev, t])),
    onTaskUpdated: (t) => setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x))),
    onTaskMoved: (t) => setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x))),
    onTaskDeleted: ({ _id }) => setTasks((prev) => prev.filter((x) => x._id !== _id)),
  });

  const tasksByCol = (key: Task['status']) =>
    tasks.filter((t) => t.status === key).sort((a, b) => a.order - b.order);

  const handleDrop = async (status: Task['status']) => {
    if (!dragTaskId || !canEdit) return;
    const task = tasks.find((t) => t._id === dragTaskId);
    setDragTaskId(null);
    setDragOverCol(null);
    if (!task || task.status === status) return;

    const colTasks = tasksByCol(status);
    const newOrder = colTasks.length ? colTasks[colTasks.length - 1].order + 1 : 0;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status, order: newOrder } : t)));
    try {
      await api.moveTask(id, task._id, status, newOrder);
    } catch (e: any) {
      setErr(e.message);
      load(); // refetch on error
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen">
        <Topbar />
        <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-ink-400" /></div>
      </div>
    );
  }

  if (err && !workspace) {
    return (
      <div className="min-h-screen">
        <Topbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
          <p className="text-ink-300">{err}</p>
          <Link href="/dashboard" className="btn btn-ghost mt-4 inline-flex">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Topbar />

      {/* Workspace header */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-ink-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-semibold text-white" style={{ background: workspace.color }}>
              {workspace.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl leading-tight">{workspace.name}</h1>
              <p className="text-xs text-ink-400">
                <span className="badge bg-white/5 text-ink-300 mr-2">{myRole}</span>
                {workspace.members.length + 1} {workspace.members.length === 0 ? 'member' : 'members'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost" onClick={() => setShowMembers(true)}>
              <Users className="w-4 h-4" /> Members
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {err && workspace && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
            <span>{err}</span>
            <button onClick={() => setErr('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasksByCol(col.key);
            return (
              <div
                key={col.key}
                className={`card p-3 min-h-[400px] transition-colors ${dragOverCol === col.key ? 'drag-over' : ''}`}
                onDragOver={(e) => { if (canEdit) { e.preventDefault(); setDragOverCol(col.key); } }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="flex items-center justify-between px-2 pt-1 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <h3 className="font-medium text-sm">{col.label}</h3>
                    <span className="text-xs text-ink-500">{colTasks.length}</span>
                  </div>
                  {canEdit && (
                    <button onClick={() => setShowNew(col.key)} className="text-ink-400 hover:text-white rounded p-1 hover:bg-white/5" title="Add task">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {colTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      canEdit={canEdit}
                      dragging={dragTaskId === t._id}
                      onDragStart={() => setDragTaskId(t._id)}
                      onDragEnd={() => { setDragTaskId(null); setDragOverCol(null); }}
                      onClick={() => setEditing(t)}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-xs text-ink-500 text-center py-6">No tasks yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showNew && (
        <TaskModal
          title="New task"
          workspaceId={id}
          workspace={workspace}
          initialStatus={showNew}
          onClose={() => setShowNew(null)}
          onSave={async (data) => {
            await api.createTask(id, data);
            // Socket will update us; also refetch for safety
          }}
        />
      )}
      {editing && (
        <TaskModal
          title="Edit task"
          workspaceId={id}
          workspace={workspace}
          task={editing}
          canEdit={canEdit}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            await api.updateTask(id, editing._id, data);
          }}
          onDelete={async () => {
            await api.deleteTask(id, editing._id);
            setEditing(null);
          }}
        />
      )}
      {showMembers && workspace && (
        <MembersPanel
          workspace={workspace}
          myRole={myRole}
          currentUserId={user._id || user.id || ''}
          onClose={() => setShowMembers(false)}
          onChange={load}
        />
      )}
    </div>
  );
}

function TaskCard({
  task, canEdit, dragging, onDragStart, onDragEnd, onClick,
}: { task: Task; canEdit: boolean; dragging: boolean; onDragStart: () => void; onDragEnd: () => void; onClick: () => void }) {
  const assignee = task.assignedTo;
  const initials = assignee?.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
  const dueSoon = task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  return (
    <div
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-ink-900/80 border border-white/5 rounded-lg p-3 cursor-pointer hover:border-white/15 transition-all ${dragging ? 'dragging' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm leading-snug font-medium">{task.title}</p>
        <span className={`badge border ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
      </div>
      {task.description && <p className="text-xs text-ink-400 line-clamp-2 mb-2">{task.description}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${dueSoon ? 'text-amber-400' : ''}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        {assignee && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white" style={{ background: assignee.avatarColor || '#6366f1' }} title={assignee.name}>
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({
  title, workspaceId, workspace, task, initialStatus, canEdit = true, onClose, onSave, onDelete,
}: {
  title: string;
  workspaceId: string;
  workspace: any;
  task?: Task;
  initialStatus?: Task['status'];
  canEdit?: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || initialStatus || 'todo',
    assignedTo: task?.assignedTo?._id || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const memberOptions = [
    { _id: workspace.owner._id, name: workspace.owner.name + ' (owner)', avatarColor: workspace.owner.avatarColor },
    ...workspace.members.map((m: any) => ({ _id: m.user._id, name: m.user.name, avatarColor: m.user.avatarColor })),
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await onSave({
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      });
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card p-6 w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required disabled={!canEdit} placeholder="Task title" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={!canEdit} placeholder="Details (optional)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} disabled={!canEdit}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} disabled={!canEdit}>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Assignee</label>
              <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} disabled={!canEdit}>
                <option value="">Unassigned</option>
                {memberOptions.map((m: any) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Due date</label>
              <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} disabled={!canEdit} />
            </div>
          </div>
          {err && <div className="text-sm text-red-400">{err}</div>}
          <div className="flex gap-2 pt-2">
            {onDelete && canEdit && (
              <button type="button" className="btn btn-danger" onClick={async () => { if (confirm('Delete this task?')) { await onDelete(); } }}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
            {canEdit && (
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function MembersPanel({ workspace, myRole, currentUserId, onClose, onChange }: any) {
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState('');
  const isAdmin = myRole === 'owner' || myRole === 'admin';

  const copy = () => {
    navigator.clipboard.writeText(workspace.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changeRole = async (memberId: string, role: string) => {
    setErr('');
    try {
      await api.updateMemberRole(workspace._id, memberId, role);
      await onChange();
    } catch (e: any) { setErr(e.message); }
  };

  const remove = async (memberId: string) => {
    if (!confirm('Remove this member?')) return;
    setErr('');
    try {
      await api.removeMember(workspace._id, memberId);
      await onChange();
    } catch (e: any) { setErr(e.message); }
  };

  const initials = (n: string) => n.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card p-6 w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl">Members</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-5">
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Invite code</label>
          <div className="flex gap-2">
            <code className="input font-mono text-center tracking-widest text-accent">{workspace.inviteCode}</code>
            <button type="button" className="btn btn-ghost" onClick={copy}>
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-ink-500 mt-2">Share this code so others can join.</p>
        </div>

        {err && <div className="text-sm text-red-400 mb-3">{err}</div>}

        <div className="space-y-2">
          <MemberRow
            m={{ user: workspace.owner, role: 'owner' }}
            isMe={workspace.owner._id === currentUserId}
            canEdit={false}
            initials={initials}
          />
          {workspace.members.map((m: any) => (
            <MemberRow
              key={m.user._id}
              m={m}
              isMe={m.user._id === currentUserId}
              canEdit={isAdmin}
              canRemoveSelf={true}
              onChangeRole={(role: string) => changeRole(m.user._id, role)}
              onRemove={() => remove(m.user._id)}
              initials={initials}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberRow({ m, isMe, canEdit, canRemoveSelf, onChangeRole, onRemove, initials }: any) {
  return (
    <div className="flex items-center justify-between bg-ink-900/50 border border-white/5 rounded-lg px-3 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0" style={{ background: m.user.avatarColor || '#6366f1' }}>
          {initials(m.user.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm truncate">{m.user.name} {isMe && <span className="text-ink-500 text-xs">(you)</span>}</p>
          <p className="text-xs text-ink-500 truncate">{m.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {canEdit && m.role !== 'owner' ? (
          <select className="input !py-1 !px-2 text-xs" value={m.role} onChange={(e) => onChangeRole(e.target.value)}>
            <option value="admin">admin</option>
            <option value="member">member</option>
            <option value="viewer">viewer</option>
          </select>
        ) : (
          <span className="badge bg-white/5 text-ink-300">{m.role}</span>
        )}
        {m.role !== 'owner' && (canEdit || (isMe && canRemoveSelf)) && (
          <button onClick={onRemove} className="text-ink-400 hover:text-red-400 p-1" title={isMe ? 'Leave workspace' : 'Remove member'}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
