'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Kanban, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await register(name, email, password);
    } catch (e: any) {
      setErr(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/6 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold">TaskFlow</span>
        </Link>

        <div className="card-elevated p-8">
          <div className="mb-7">
            <h1 className="font-display text-3xl font-bold mb-1">Create account</h1>
            <p className="text-ink-400 text-sm">Start organizing your work in seconds — free forever</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5 font-medium">Full name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="Jane Smith"
                autoComplete="name"
              />
            </div>
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
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < strength
                          ? ['bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'][strength - 1]
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              )}
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
              {loading ? 'Creating account…' : (
                <>Create account <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {['No credit card required', 'Free forever on the basic plan', 'Cancel anytime'].map((t) => (
              <p key={t} className="flex items-center gap-2 text-xs text-ink-500">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {t}
              </p>
            ))}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs text-ink-500">
              <span className="bg-[#12121a] px-3">Already have an account?</span>
            </div>
          </div>

          <Link href="/login" className="btn btn-ghost w-full border-white/10 justify-center">
            Sign in instead
          </Link>
        </div>

        <p className="text-xs text-ink-600 text-center mt-5">
          By creating an account you agree to our{' '}
          <a href="#" className="text-ink-400 hover:underline">Terms of Service</a>{' '}and{' '}
          <a href="#" className="text-ink-400 hover:underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </main>
  );
}
