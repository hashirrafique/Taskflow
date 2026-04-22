import Link from 'next/link';
import { Kanban, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Link href="/" className="flex items-center gap-2.5 mb-12 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/30">
          <Kanban className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl font-bold">TaskFlow</span>
      </Link>

      <div className="font-display text-[120px] md:text-[180px] font-bold leading-none gradient-text mb-4">
        404
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Page not found</h1>
      <p className="text-ink-400 text-lg max-w-md mb-10">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn btn-ghost border-white/10">
          <ArrowLeft className="w-4 h-4" /> Go back
        </Link>
        <Link href="/dashboard" className="btn btn-primary">
          <Home className="w-4 h-4" /> Dashboard
        </Link>
      </div>
    </div>
  );
}
