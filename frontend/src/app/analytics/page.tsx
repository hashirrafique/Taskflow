'use client';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { api } from '@/lib/api';
import Topbar from '@/components/Topbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { motion } from 'framer-motion';
import { BarChart3, Loader2, TrendingUp, CheckCircle2, Clock, AlertCircle, Target } from 'lucide-react';

import type { Variants } from 'framer-motion';
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } } };

const STATUS_COLORS: Record<string, string> = {
  todo: '#64748b',
  in_progress: '#3b82f6',
  in_review: '#f59e0b',
  done: '#10b981',
};
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};
const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
  none: '#475569',
};

export default function AnalyticsPage() {
  const { loading: authLoading, user } = useRequireAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.analyticsOverview().then((res) => setData(res)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
    </div>
  );

  if (loading) return (
    <div className="min-h-screen">
      <Topbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Breadcrumbs items={[{ label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> }]} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card h-28 skeleton" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => <div key={i} className="card h-64 skeleton" />)}
        </div>
      </main>
    </div>
  );

  const totals = data?.totals || {};
  const byStatus: Record<string, number> = data?.byStatus || {};
  const byPriority: Record<string, number> = data?.byPriority || {};
  const weekly: { date: string; label: string; count: number }[] = data?.weeklyActivity || [];
  const completionRate = data?.completionRate ?? 0;
  const overdue = data?.overdue ?? 0;
  const upcoming = data?.upcoming ?? 0;

  const totalTasks = Object.values(byStatus).reduce((a: number, b) => a + (b as number), 0);
  const maxWeekly = Math.max(...weekly.map((w) => w.count), 1);
  const maxStatus = Math.max(...Object.values(byStatus), 1);
  const maxPriority = Math.max(...Object.values(byPriority), 1);

  const statCards = [
    { label: 'Total Tasks', value: totalTasks, icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Upcoming (7d)', value: upcoming, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Breadcrumbs items={[{ label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> }]} />

        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Analytics</h1>
            <p className="text-ink-400 text-sm mt-1">Your productivity overview across all workspaces</p>
          </div>
        </div>

        {/* Stat cards */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} variants={fadeUp} className="card p-5">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold font-display">{s.value}</p>
                <p className="text-xs text-ink-400 mt-0.5">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Weekly activity bar chart */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-sm">Weekly Activity</h3>
              <span className="text-xs text-ink-500 ml-auto">Last 7 days</span>
            </div>
            {weekly.length === 0 ? (
              <div className="flex items-end justify-center h-32 text-ink-500 text-sm">No activity yet</div>
            ) : (
              <div className="flex items-end gap-2 h-36">
                {weekly.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] text-ink-500 group-hover:text-ink-300 transition-colors opacity-0 group-hover:opacity-100">
                      {w.count}
                    </span>
                    <div className="w-full relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((w.count / maxWeekly) * 112, w.count > 0 ? 6 : 0)}px` }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
                        className="w-full rounded-t-sm bg-gradient-to-t from-accent/60 to-accent group-hover:from-accent/80 group-hover:to-violet-400 transition-colors"
                        style={{ minHeight: w.count > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-[9px] text-ink-600">{w.label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* By status donut-style */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm">Tasks by Status</h3>
            </div>
            {totalTasks === 0 ? (
              <div className="text-center text-ink-500 text-sm py-8">No tasks yet</div>
            ) : (
              <>
                {/* Stacked bar */}
                <div className="flex h-4 rounded-full overflow-hidden mb-4 gap-px">
                  {Object.entries(byStatus).filter(([, v]) => v > 0).map(([s, v]) => (
                    <motion.div
                      key={s}
                      initial={{ flex: 0 }}
                      animate={{ flex: v as number }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="rounded-sm"
                      style={{ background: STATUS_COLORS[s] || '#475569' }}
                      title={`${STATUS_LABELS[s] || s}: ${v}`}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {Object.entries(byStatus).map(([s, v]) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s] || '#475569' }} />
                      <span className="text-sm text-ink-300 flex-1">{STATUS_LABELS[s] || s}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((v as number) / totalTasks) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: STATUS_COLORS[s] || '#475569' }}
                          />
                        </div>
                        <span className="text-xs text-ink-500 w-6 text-right">{v as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* By priority */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">Tasks by Priority</h3>
          </div>
          {Object.keys(byPriority).length === 0 ? (
            <div className="text-center text-ink-500 text-sm py-4">No priority data</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
              {['urgent', 'high', 'medium', 'low', 'none'].filter((p) => byPriority[p] > 0).map((p) => {
                const v = byPriority[p] || 0;
                const pct = Math.round((v / totalTasks) * 100);
                return (
                  <div key={p} className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                        <motion.circle
                          cx="24" cy="24" r="20"
                          fill="none"
                          stroke={PRIORITY_COLORS[p] || '#475569'}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - pct / 100) }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold" style={{ color: PRIORITY_COLORS[p] }}>{v}</span>
                      </div>
                    </div>
                    <span className="text-xs text-ink-400 capitalize">{p === 'none' ? 'No priority' : p}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
