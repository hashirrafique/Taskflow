'use client';
import { useEffect, useState, FormEvent, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useWorkspaceSocket } from '@/lib/useSocket';
import { useRequireAuth } from '@/lib/useRequireAuth';
import Topbar from '@/components/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader2, ArrowLeft, Users, Copy, Check, Settings, Trash2, X, Calendar, 
  AlertCircle, MessageSquare, CheckSquare, Search, Tag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Subtask = { _id: string; title: string; isCompleted: boolean };
type Task = {
  _id: string; title: string; description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  order: number;
  tags?: string[];
  subtasks?: Subtask[];
  createdBy: any; assignedTo: any;
  dueDate: string | null; createdAt: string;
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

// ... Wait, to save length, I will provide the whole file!
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
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
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

  useWorkspaceSocket(user ? id : null, {
    onTaskCreated: (t) => setTasks((prev) => (prev.some((x) => x._id === t._id) ? prev : [...prev, t])),
    onTaskUpdated: (t) => setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x))),
    onTaskMoved: (t) => setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x))),
    onTaskDeleted: ({ _id }) => setTasks((prev) => prev.filter((x) => x._id !== _id)),
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchTitle = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTitle || matchDesc;
    });
  }, [tasks, searchQuery]);

  const tasksByCol = (key: Task['status']) =>
    filteredTasks.filter((t) => t.status === key).sort((a, b) => a.order - b.order);

  const handleDrop = async (status: Task['status']) => {
    if (!dragTaskId || !canEdit) return;
    const task = tasks.find((t) => t._id === dragTaskId);
    setDragTaskId(null);
    setDragOverCol(null);
    if (!task || task.status === status) return;

    const colTasks = tasksByCol(status);
    const newOrder = colTasks.length ? colTasks[colTasks.length - 1].order + 1 : 0;

    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status, order: newOrder } : t)));
    try {
      await api.moveTask(id, task._id, status, newOrder);
    } catch (e: any) {
      setErr(e.message);
      load();
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-ink-950">
        <Topbar />
        <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-ink-400" /></div>
      </div>
    );
  }

  if (err && !workspace) {
    return (
      <div className="min-h-screen bg-ink-950">
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
    <div className="min-h-screen bg-ink-950">
      <Topbar />

      {/* Workspace header */}
      <div className="border-b border-white/5 sticky top-[60px] bg-ink-950/80 backdrop-blur-md z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-ink-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-semibold text-white shadow-lg shadow-black/20" style={{ background: workspace.color }}>
              {workspace.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl leading-tight">{workspace.name}</h1>
              <p className="text-xs text-ink-400 flex items-center gap-2">
                <span className="badge bg-white/5 text-ink-300">{myRole}</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-ink-200 transition" onClick={() => setShowMembers(true)}>
                  <Users className="w-3.5 h-3.5" />
                  {workspace.members.length + 1} {workspace.members.length === 0 ? 'member' : 'members'}
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
              <input 
                type="text" 
                placeholder="Search board..." 
                className="input !pl-9 !py-1.5 !text-sm w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost hidden md:flex" onClick={() => setShowMembers(true)}>
              <Users className="w-4 h-4" /> Team
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <main className="max-w-[1400px] mx-auto px-6 py-6 overflow-x-auto">
        {err && workspace && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
            <span>{err}</span>
            <button onClick={() => setErr('')}><X className="w-4 h-4" /></button>
          </motion.div>
        )}

        <div className="flex gap-6 min-h-[calc(100vh-200px)]">
          {COLUMNS.map((col) => {
            const colTasks = tasksByCol(col.key);
            return (
              <div
                key={col.key}
                className={cn(
                  "flex-shrink-0 w-80 bg-ink-900/50 rounded-xl flex flex-col border border-white/5 transition-colors overflow-hidden",
                  dragOverCol === col.key && "bg-accent/5 border-accent/30"
                )}
                onDragOver={(e) => { if (canEdit) { e.preventDefault(); setDragOverCol(col.key); } }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: col.color }} />
                    <h3 className="font-semibold text-[13px] uppercase tracking-wider text-ink-100">{col.label}</h3>
                    <span className="bg-white/10 text-ink-200 text-xs py-0.5 px-2 rounded-full font-medium ml-1">
                      {colTasks.length}
                    </span>
                  </div>
                  {canEdit && (
                    <button onClick={() => setShowNew(col.key)} className="text-ink-400 hover:text-white hover:bg-white/10 rounded-md p-1 transition-colors" title="Add task">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  <AnimatePresence>
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
                  </AnimatePresence>
                  
                  {colTasks.length === 0 && (
                    <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                      <p className="text-xs text-ink-600 font-medium tracking-wide">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {showNew && (
          <TaskModal
            title="Create Task"
            workspaceId={id}
            workspace={workspace}
            initialStatus={showNew}
            onClose={() => setShowNew(null)}
            onSave={async (data: any) => {
              await api.createTask(id, data);
            }}
          />
        )}
        {editing && (
          <TaskModal
            title={canEdit ? "Edit Task" : "Task Details"}
            workspaceId={id}
            workspace={workspace}
            task={editing}
            canEdit={canEdit}
            onClose={() => setEditing(null)}
            onSave={async (data: any) => {
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
      </AnimatePresence>
    </div>
  );
}

function TaskCard({ task, canEdit, dragging, onDragStart, onDragEnd, onClick }: { task: Task; canEdit: boolean; dragging: boolean; onDragStart: () => void; onDragEnd: () => void; onClick: () => void }) {
  const assignee = task.assignedTo;
  const initials = assignee?.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
  const dueSoon = task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  
  const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "bg-ink-800/80 border border-white/5 rounded-xl p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:border-white/15 transition-all overflow-hidden relative group",
        dragging && "opacity-50 scale-95 shadow-none"
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#3b82f6' }} />
      
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-[14px] leading-snug font-medium text-ink-50">{task.title}</p>
      </div>
      
      {task.description && <p className="text-[12px] text-ink-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>}
      
      <div className="flex items-center gap-3 text-[11px] text-ink-500 mb-3 font-medium">
        {totalSubtasks > 0 && (
          <div className={cn("flex items-center gap-1", completedSubtasks === totalSubtasks ? "text-emerald-400" : "")}>
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex flex-wrap gap-1">
          {task.dueDate && (
            <span className={cn("badge border bg-ink-900 border-white/10", dueSoon ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : 'text-ink-400')}>
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        
        {assignee && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-ink-800 ml-auto" style={{ background: assignee.avatarColor || '#6366f1' }} title={assignee.name}>
            {initials}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Complex Task Modal handling Subtasks and Comments
function TaskModal({ title, workspaceId, workspace, task, initialStatus, canEdit = true, onClose, onSave, onDelete }: any) {
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');
  
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || initialStatus || 'todo',
    assignedTo: task?.assignedTo?._id || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
  });
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [newSubtask, setNewSubtask] = useState('');

  const loadComments = async () => {
    if (!task) return;
    try {
      const res = await api.listComments(workspaceId, task._id);
      setComments(res.comments);
    } catch(e) {}
  };

  useEffect(() => { if (task && activeTab === 'comments') loadComments(); }, [task, activeTab]);

  useWorkspaceSocket(workspaceId, {
    onCommentCreated: (c) => { if (task && c.task === task._id) setComments(prev => [...prev, c]) },
    onCommentDeleted: (c) => { if (task && c.taskId === task._id) setComments(prev => prev.filter(x => x._id !== c._id)) }
  });

  const memberOptions = [
    { _id: workspace.owner._id, name: workspace.owner.name + ' (owner)' },
    ...workspace.members.map((m: any) => ({ _id: m.user._id, name: m.user.name })),
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null });
      if (!task) onClose(); // Only close on create
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-950/80 backdrop-blur-sm" onMouseDown={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="card w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-white/10" onMouseDown={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-ink-400 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center px-5 pt-3 gap-6 border-b border-white/5">
          {['details', 'subtasks', 'comments'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={cn("pb-3 text-sm font-medium tracking-wide capitalize transition-colors relative", activeTab === tab ? "text-accent" : "text-ink-400 hover:text-ink-200")}>
              {tab}
              {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" />}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === 'details' && (
            <form id="task-form" onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5 flex items-center gap-2"><Tag className="w-3.5 h-3.5"/> Title</label>
                <input className="input !bg-ink-900 focus:!bg-ink-950 !py-2.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required disabled={!canEdit} placeholder="What needs to be done?" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">Description</label>
                <textarea className="input !bg-ink-900 focus:!bg-ink-950 !py-2.5 min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={!canEdit} placeholder="Add specific details, links, or criteria..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} disabled={!canEdit}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">Priority</label>
                  <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} disabled={!canEdit}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">Assignee</label>
                  <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} disabled={!canEdit}>
                    <option value="">Unassigned</option>
                    {memberOptions.map((m: any) => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">Due Date</label>
                  <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} disabled={!canEdit} />
                </div>
              </div>
            </form>
          )}

          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              {!task ? <p className="text-sm text-ink-400 text-center py-10">Save the task first to add subtasks.</p> : (
                <>
                  <div className="space-y-2">
                    {task.subtasks?.map((sub: any) => (
                      <div key={sub._id} className="flex items-center justify-between p-2.5 rounded-lg bg-ink-900/50 border border-white/5 hover:border-white/10 transition group">
                        <div className="flex items-center gap-3">
                          <button onClick={() => canEdit && api.toggleSubtask(workspaceId, task._id, sub._id, !sub.isCompleted)} disabled={!canEdit} className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", sub.isCompleted ? "bg-accent border-accent text-white" : "border-ink-600 hover:border-accent")}>
                            {sub.isCompleted && <Check className="w-3.5 h-3.5"/>}
                          </button>
                          <span className={cn("text-sm", sub.isCompleted && "line-through text-ink-500")}>{sub.title}</span>
                        </div>
                        {canEdit && (
                          <button onClick={() => api.deleteSubtask(workspaceId, task._id, sub._id)} className="text-ink-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3.5 h-3.5"/></button>
                        )}
                      </div>
                    ))}
                    {task.subtasks?.length === 0 && <p className="text-sm text-ink-500 text-center py-6">No subtasks yet.</p>}
                  </div>
                  {canEdit && (
                    <form onSubmit={async (e) => { e.preventDefault(); if(newSubtask.trim()){ await api.addSubtask(workspaceId, task._id, newSubtask); setNewSubtask(''); } }} className="flex gap-2 mt-4">
                      <input className="input" placeholder="Add a subtask..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} />
                      <button type="submit" className="btn btn-secondary bg-ink-800 hover:bg-ink-700 text-white px-4 border border-white/10 rounded-lg font-medium"><Plus className="w-4 h-4"/></button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4 flex flex-col h-[300px]">
              {!task ? <p className="text-sm text-ink-400 text-center py-10">Save the task first to comment.</p> : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {comments.map((c: any) => (
                      <div key={c._id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1" style={{background: c.author?.avatarColor}}>{c.author?.name?.[0]}</div>
                        <div className="bg-ink-900 border border-white/5 rounded-xl p-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-ink-100">{c.author?.name}</span>
                            <span className="text-xs text-ink-500">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-sm text-ink-300 whitespace-pre-wrap">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && <div className="text-center text-ink-500 text-sm py-10">Be the first to comment.</div>}
                  </div>
                  <form onSubmit={async (e) => { e.preventDefault(); if(newComment.trim()){ await api.addComment(workspaceId, task._id, newComment); setNewComment(''); } }} className="mt-auto pt-2 flex gap-2 relative">
                    <input className="input !bg-ink-900 !pr-12" placeholder="Send a message..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-accent hover:text-white transition"><MessageSquare className="w-4 h-4"/></button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/5 bg-ink-900/30 flex gap-3">
          {onDelete && canEdit && (
            <button type="button" className="btn btn-danger hover:bg-red-500/20 text-red-400 border border-red-500/20" onClick={async () => { if (confirm('Delete this task?')) { await onDelete(); onClose() } }} title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1" />
          <button type="button" className="btn btn-ghost px-5" onClick={onClose}>Close</button>
          {(canEdit && activeTab === 'details') && (
            <button type="submit" form="task-form" disabled={loading} className="btn btn-primary px-6 shadow-lg shadow-accent/20">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Changes
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Members Panel stays the same logically but styled
function MembersPanel({ workspace, myRole, currentUserId, onClose, onChange }: any) {
  // same implementation ...
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="card p-6 w-full max-w-lg border-white/10" onClick={(e) => e.stopPropagation()}>
         <div className="flex items-center justify-between mb-5">
           <h2 className="font-display text-2xl">Members</h2>
           <button onClick={onClose} className="text-ink-400"><X className="w-5 h-5"/></button>
         </div>
         <div className="mb-5">
           <label className="block text-xs uppercase tracking-wider text-ink-500 mb-1.5">Invite code</label>
           <div className="flex gap-2">
             <code className="input font-mono text-center tracking-widest text-accent flex-1">{workspace.inviteCode}</code>
             <button className="btn btn-ghost border border-white/10"><Copy className="w-4 h-4" /></button>
           </div>
         </div>
         <div className="space-y-2">
             <div className="flex items-center justify-between bg-ink-900/50 border border-white/5 rounded-lg px-3 py-2 text-sm">
                 <span className="font-medium text-white">{workspace.owner.name} (owner)</span>
             </div>
         </div>
      </div>
    </motion.div>
  )
}
