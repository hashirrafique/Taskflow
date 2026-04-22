'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { api } from '@/lib/api';
import Topbar from '@/components/Topbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListChecks, Loader2, Filter, ChevronDown, Calendar,
  AlertCircle, CheckCircle2, Clock, Circle, ArrowRight, Sparkles
} from 'lucide-react';
import { relativeTime, isOverdue, formatDate } from '@/lib/time';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];
const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];
const DUE_OPTIONS = [
  { value: '', label: 'Any due date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  todo: { label: 'To Do', icon: Circle, color: 'text-ink-400', bg: 'bg-ink-800' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  in_review: { label: 'In Review', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-400' },
  high: { label: 'High', color: 'text-orange-400' },
  medium: { label: 'Medium', color: 'text-amber-400' },
  low: { label: 'Low', color: 'text-green-400' },
};

export default function MyTasksPage() {
  const { loading: authLoading, user } = useRequireAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueRange, setDueRange] = useState('');
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'workspace'>('status');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listMyTasks({ status: status || undefined, priority: priority || undefined, dueRange: dueRange || undefined });
      setTasks(res.tasks || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); }, [user, status, priority, dueRange]);

  const grouped = useMemo(() => {
    if (groupBy === 'status') {
      const order = ['todo', 'in_progress', 'in_review', 'done'];
      const map: Record<string, any[]> = {};
      order.forEach((s) => { map[s] = []; });
      tasks.forEach((t) => { (map[t.status] || (map[t.status] = [])).push(t); });
      return order.filter((s) => map[s].length > 0).map((s) => ({ key: s, label: STATUS_CONFIG[s]?.label || s, tasks: map[s] }));
    }
    if (groupBy === 'priority') {
      const order = ['urgent', 'high', 'medium', 'low', 'none'];
      const map: Record<string, any[]> = {};
      tasks.forEach((t) => { const p = t.priority || 'none'; (map[p] || (map[p] = [])).push(t); });
      return order.filter((p) => map[p]?.length > 0).map((p) => ({ key: p, label: PRIORITY_CONFIG[p]?.label || 'No priority', tasks: map[p] }));
    }
    // workspace
    const map: Record<string, { name: string; tasks: any[] }> = {};
    tasks.forEach((t) => {
      const id = t.workspace || 'unknown';
      if (!map[id]) map[id] = { name: t.workspaceName || 'Unknown', tasks: [] };
      map[id].tasks.push(t);
    });
    return Object.entries(map).map(([k, v]) => ({ key: k, label: v.name, tasks: v.tasks }));
  }, [tasks, groupBy]);

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Breadcrumbs items={[{ label: 'My Tasks', icon: <ListChecks className="w-3.5 h-3.5" /> }]} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">My Tasks</h1>
            <p className="text-ink-400 text-sm mt-1">
              {loading ? 'Loading…' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} across all workspaces`}
            </p>
          </div>
          {/* Group by selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500 text-xs">Group by:</span>
            {(['status', 'priority', 'workspace'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-3 py-1.5 rounded-lg capitalize text-xs font-medium transition-all ${groupBy === g ? 'bg-accent/15 text-accent border border-accent/25' : 'text-ink-400 hover:text-white bg-white/4 border border-white/8'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterSelect icon={<Filter className="w-3.5 h-3.5" />} options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          <FilterSelect icon={<AlertCircle className="w-3.5 h-3.5" />} options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
          <FilterSelect icon={<Calendar className="w-3.5 h-3.5" />} options={DUE_OPTIONS} value={dueRange} onChange={setDueRange} />
          {(status || priority || dueRange) && (
            <button
              onClick={() => { setStatus(''); setPriority(''); setDueRange(''); }}
              className="px-3 py-1.5 rounded-lg text-xs text-ink-400 hover:text-white bg-white/4 border border-white/8 hover:border-white/15 transition-all"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="card h-16 skeleton" />)}
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-16 text-center border-dashed border-white/10"
          >
            <Sparkles className="w-10 h-10 text-accent/50 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold mb-2">No tasks found</h3>
            <p className="text-ink-400 text-sm">
              {status || priority || dueRange ? 'Try adjusting your filters.' : "You don't have any tasks assigned yet."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ key, label, tasks: groupTasks }) => (
              <TaskGroup key={key} label={label} tasks={groupTasks} groupBy={groupBy} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterSelect({ icon, options, value, onChange }: { icon: React.ReactNode; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">{icon}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-8 py-1.5 text-xs text-ink-200 focus:outline-none focus:border-accent/50 cursor-pointer hover:border-white/15 transition-colors"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-500 pointer-events-none" />
    </div>
  );
}

function TaskGroup({ label, tasks, groupBy }: { label: string; tasks: any[]; groupBy: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-2 group"
      >
        <ChevronDown className={`w-3.5 h-3.5 text-ink-500 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        <span className="text-sm font-semibold text-ink-200 group-hover:text-white transition-colors">{label}</span>
        <span className="text-xs text-ink-600 bg-white/5 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5">
              {tasks.map((t, i) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <TaskRow task={t} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const p = PRIORITY_CONFIG[task.priority];
  const overdue = task.dueDate && !['done'].includes(task.status) && isOverdue(task.dueDate);
  const StatusIcon = s.icon;

  return (
    <Link
      href={`/workspaces/${task.workspace}`}
      className="flex items-center gap-3 px-4 py-3 card hover:border-white/12 hover:bg-white/[0.02] transition-all group"
    >
      <StatusIcon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${task.status === 'done' ? 'line-through text-ink-400' : 'text-white'}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-ink-500">{task.workspaceName}</span>
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-ink-500'}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {p && <span className={`text-xs font-medium ${p.color}`}>{p.label}</span>}
        <ArrowRight className="w-3.5 h-3.5 text-ink-600 group-hover:text-ink-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
