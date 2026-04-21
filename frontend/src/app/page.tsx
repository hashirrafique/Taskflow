import Link from 'next/link';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white">
            T
          </div>
          <span className="font-display text-2xl">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/register" className="btn btn-primary">
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-white/10 text-xs text-ink-300 bg-white/5">
          Real-time · Role-based · Built on MERN + Next.js
        </div>
        <h1 className="font-display text-6xl md:text-7xl leading-[1.05] tracking-tight mb-6">
          A task board that <em className="text-accent not-italic">actually</em><br />
          stays in sync.
        </h1>
        <p className="text-lg text-ink-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          TaskFlow is a full-stack project management platform with workspaces,
          role-based access control, and WebSocket-powered real-time updates.
          No more refreshing to see what your team did.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="btn btn-ghost px-6 py-3 text-base">Sign in</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4">
        {[
          {
            icon: <Zap className="w-5 h-5" />,
            title: 'Real-time sync',
            body: 'Socket.io keeps every member on the same page. Move a card, everyone sees it instantly.',
          },
          {
            icon: <Shield className="w-5 h-5" />,
            title: 'Role-based access',
            body: 'Four roles — owner, admin, member, viewer — enforced on the server, not just the UI.',
          },
          {
            icon: <Users className="w-5 h-5" />,
            title: 'Multi-workspace',
            body: 'Spin up as many team boards as you need, each with its own members and invite code.',
          },
        ].map((f, i) => (
          <div key={i} className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="font-display text-2xl mb-2">{f.title}</h3>
            <p className="text-sm text-ink-400 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-ink-500">
        Built with Next.js, Node.js, Express, MongoDB, Tailwind & JWT.
      </footer>
    </main>
  );
}
