'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastCtx {
  toast: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/8',
  error: 'text-red-400 border-red-500/25 bg-red-500/8',
  info: 'text-accent border-accent/25 bg-accent/8',
  warning: 'text-amber-400 border-amber-500/25 bg-amber-500/8',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = (id: string) => setToasts((ts) => ts.filter((t) => t.id !== id));

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const full: Toast = { duration: 4000, ...t, id };
    setToasts((ts) => [...ts, full]);
    setTimeout(() => remove(id), full.duration);
  }, []);

  const helpers = {
    toast,
    success: (title: string, message?: string) => toast({ kind: 'success', title, message }),
    error: (title: string, message?: string) => toast({ kind: 'error', title, message }),
    info: (title: string, message?: string) => toast({ kind: 'info', title, message }),
    warning: (title: string, message?: string) => toast({ kind: 'warning', title, message }),
  };

  return (
    <ToastContext.Provider value={helpers}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.15 } }}
                className={`pointer-events-auto card-elevated border ${COLORS[t.kind]} p-3.5 shadow-2xl min-w-[280px] flex items-start gap-3`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                  {t.message && <p className="text-xs text-ink-300 mt-0.5">{t.message}</p>}
                </div>
                <button onClick={() => remove(t.id)} className="text-ink-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
