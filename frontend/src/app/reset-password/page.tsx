'use client';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import { motion } from 'framer-motion';
import { Kanban, ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Missing or invalid reset token. Please request a new link.');
  }, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.resetPassword({ token, newPassword: password });
      if (res.token) setToken(res.token);
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (e: any) {
      setError(e.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/30">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold">TaskFlow</span>
        </Link>

        <div className="card-elevated p-8">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Password reset!</h2>
              <p className="text-ink-400 text-sm">Your password has been updated. Redirecting you to the dashboard…</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold mb-1.5">Set new password</h2>
                <p className="text-ink-400 text-sm">Choose a strong password for your account.</p>
              </div>

              {!token && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  No reset token found. Please request a new link.
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10 pr-10"
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      autoFocus={!!token}
                      disabled={!token}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className={`text-xs ${strength >= 3 ? 'text-emerald-400' : strength >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input pl-10"
                      placeholder="Repeat password"
                      required
                      disabled={!token}
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                  )}
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || !token || password !== confirm} className="btn btn-primary w-full justify-center">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset password
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="text-sm text-ink-400 hover:text-white transition-colors flex items-center gap-1 justify-center">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-ink-400" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
