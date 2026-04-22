'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { api } from '@/lib/api';
import Topbar from '@/components/Topbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Circle, Clock, CheckCircle2 } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-ink-600',
  in_progress: 'bg-blue-500',
  in_review: 'bg-amber-500',
  done: 'bg-emerald-500',
};

export default function CalendarPage() {
  const { loading: authLoading, user } = useRequireAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.listMyTasks().then((res) => {
      setTasks(res.tasks || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const today = new Date();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const tasksByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(t);
      }
    });
    return map;
  }, [tasks, year, month]);

  const selectedTasks = selectedDay ? (tasksByDay[selectedDay] || []) : [];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()); };

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
    </div>
  );

  // Build calendar grid
  const cells: { day: number | null; tasks: any[] }[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push({ day: null, tasks: [] });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, tasks: tasksByDay[d] || [] });

  const totalWithDue = tasks.filter((t) => t.dueDate).length;

  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Breadcrumbs items={[{ label: 'Calendar', icon: <CalendarIcon className="w-3.5 h-3.5" /> }]} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Calendar</h1>
            <p className="text-ink-400 text-sm mt-1">
              {loading ? 'Loading…' : `${totalWithDue} task${totalWithDue !== 1 ? 's' : ''} with due dates`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="btn btn-ghost border-white/10 text-sm px-3 py-1.5">Today</button>
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-ink-400 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-lg font-display font-semibold min-w-[200px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-ink-400 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-white/[0.06]">
                {DAYS.map((d) => (
                  <div key={d} className="py-3 text-center text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>
              {/* Calendar cells */}
              {loading ? (
                <div className="h-64 skeleton" />
              ) : (
                <div className="grid grid-cols-7">
                  {cells.map((cell, idx) => {
                    const isToday = cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const isSelected = cell.day === selectedDay;
                    const hasOverdue = cell.day && cell.tasks.some((t) => !['done'].includes(t.status) && new Date(t.dueDate) < today);
                    return (
                      <button
                        key={idx}
                        disabled={!cell.day}
                        onClick={() => cell.day && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
                        className={`min-h-[80px] p-2 border-b border-r border-white/[0.04] text-left transition-all relative
                          ${!cell.day ? 'cursor-default bg-white/[0.01]' : 'hover:bg-white/4 cursor-pointer'}
                          ${isSelected ? 'bg-accent/8 border-accent/20' : ''}
                        `}
                      >
                        {cell.day && (
                          <>
                            <span className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full mb-1
                              ${isToday ? 'bg-accent text-white' : isSelected ? 'text-accent' : 'text-ink-300'}`}>
                              {cell.day}
                            </span>
                            <div className="space-y-0.5">
                              {cell.tasks.slice(0, 3).map((t) => (
                                <div key={t._id} className={`w-full h-1.5 rounded-full ${STATUS_COLORS[t.status] || 'bg-ink-600'}`} />
                              ))}
                              {cell.tasks.length > 3 && (
                                <span className="text-[9px] text-ink-500">+{cell.tasks.length - 3} more</span>
                              )}
                            </div>
                            {hasOverdue && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs text-ink-500">
              {Object.entries(STATUS_COLORS).map(([s, c]) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${c}`} />
                  {s.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              {selectedDay ? (
                <>
                  <h3 className="font-display font-semibold text-lg mb-4">
                    {MONTHS[month]} {selectedDay}
                    {selectedTasks.length > 0 && (
                      <span className="ml-2 text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">{selectedTasks.length}</span>
                    )}
                  </h3>
                  {selectedTasks.length === 0 ? (
                    <div className="py-8 text-center text-ink-500 text-sm">
                      <CalendarIcon className="w-6 h-6 mx-auto mb-2 opacity-30" />
                      No tasks due
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTasks.map((t) => {
                        const overdue = !['done'].includes(t.status) && new Date(t.dueDate) < today;
                        return (
                          <Link
                            key={t._id}
                            href={`/workspaces/${t.workspace}`}
                            className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors group"
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_COLORS[t.status] || 'bg-ink-600'}`} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm truncate ${t.status === 'done' ? 'line-through text-ink-400' : 'text-white'}`}>{t.title}</p>
                              <p className="text-xs text-ink-500 mt-0.5">{t.workspaceName}</p>
                              {overdue && <span className="text-[10px] text-red-400 font-semibold">Overdue</span>}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-ink-500 text-sm">
                  <CalendarIcon className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p>Select a day to see tasks</p>
                </div>
              )}
            </div>

            {/* Monthly summary */}
            <div className="card p-4 mt-4">
              <h4 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">This Month</h4>
              {[
                { label: 'Total due', value: Object.values(tasksByDay).flat().length, color: 'text-white' },
                { label: 'Completed', value: Object.values(tasksByDay).flat().filter((t: any) => t.status === 'done').length, color: 'text-emerald-400' },
                { label: 'In progress', value: Object.values(tasksByDay).flat().filter((t: any) => t.status === 'in_progress').length, color: 'text-blue-400' },
                { label: 'Overdue', value: Object.values(tasksByDay).flat().filter((t: any) => !['done'].includes(t.status) && new Date(t.dueDate) < today).length, color: 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-sm text-ink-400">{label}</span>
                  <span className={`text-sm font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
