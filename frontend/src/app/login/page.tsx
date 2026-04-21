'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white">T</div>
          <span className="font-display text-2xl">TaskFlow</span>
        </Link>
        <div className="card p-8 animate-slide-up">
          <h1 className="font-display text-3xl mb-1">Welcome back</h1>
          <p className="text-ink-400 text-sm mb-6">Sign in to your workspace</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
            </div>
            {err && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-ink-400 mt-6 text-center">
            No account? <Link href="/register" className="text-accent hover:underline">Create one</Link>
          </p>
        </div>
        <p className="text-xs text-ink-500 text-center mt-6">
          Demo: <code className="text-ink-300">hashir@taskflow.dev</code> / <code className="text-ink-300">password123</code>
        </p>
      </div>
    </main>
  );
}
