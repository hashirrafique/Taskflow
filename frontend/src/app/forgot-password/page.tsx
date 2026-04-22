'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Kanban, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.forgotPassword({ email });
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/30">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold">TaskFlow</span>
        </Link>

        <div className="card-elevated p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-ink-400 text-sm mb-6">
                If <strong className="text-white">{email}</strong> is associated with an account, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-ink-500 mb-6">Didn't receive it? Check your spam folder or wait a few minutes.</p>
              <Link href="/login" className="btn btn-ghost border-white/10 w-full justify-center">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold mb-1.5">Forgot password?</h2>
                <p className="text-ink-400 text-sm">Enter your email and we'll send a reset link.</p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send reset link
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
