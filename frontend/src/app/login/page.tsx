'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import TaskFlowLogo from '@/components/TaskFlowLogo';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
            <TaskFlowLogo size={20} />
          </div>
          <span className="font-display text-2xl font-bold">TaskFlow</span>
        </Link>

        <div className="card-elevated p-8">
          <div className="mb-7">
            <h1 className="font-display text-3xl font-bold mb-1">Welcome back</h1>
            <p className="text-ink-400 text-sm">Sign in to your workspace to continue</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5 font-medium">Email address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider text-ink-400 font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {err && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5"
              >
                {err}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-2 gap-2 group">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : (
                <>Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs text-ink-500">
              <span className="bg-[#12121a] px-3">or</span>
            </div>
          </div>

          <p className="text-sm text-ink-400 text-center">
            No account yet?{' '}
            <Link href="/register" className="text-accent font-medium hover:underline">Create one for free</Link>
          </p>
        </div>

        <p className="text-xs text-ink-600 text-center mt-5">
          Demo: <code className="text-ink-400">hashir@taskflow.dev</code> / <code className="text-ink-400">password123</code>
        </p>
      </motion.div>
    </main>
  );
}
