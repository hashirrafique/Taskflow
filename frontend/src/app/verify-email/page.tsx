'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Kanban, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Missing verification token.'); return; }
    api.verifyEmail({ token })
      .then(() => setStatus('success'))
      .catch((e: any) => { setStatus('error'); setMessage(e.message || 'Verification failed.'); });
  }, [token]);

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

        <div className="card-elevated p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">Verifying your email…</h2>
              <p className="text-ink-400 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Email verified!</h2>
              <p className="text-ink-400 text-sm mb-6">Your email address has been successfully verified.</p>
              <Link href="/dashboard" className="btn btn-primary w-full justify-center">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Verification failed</h2>
              <p className="text-ink-400 text-sm mb-6">{message || 'This verification link is invalid or has expired.'}</p>
              <div className="flex flex-col gap-2">
                <Link href="/settings" className="btn btn-primary w-full justify-center">Request new link</Link>
                <Link href="/dashboard" className="btn btn-ghost border-white/10 w-full justify-center">Go to Dashboard</Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-ink-400" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
