import Link from 'next/link';
import { Kanban, ArrowRight, Users, Zap, Shield, Globe } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: Users, title: 'Team-first', desc: 'Built for collaboration from the ground up. Every feature is designed to keep teams aligned and productive.' },
    { icon: Zap, title: 'Speed & simplicity', desc: 'No bloat, no unnecessary clicks. TaskFlow gets out of your way and lets you focus on the work that matters.' },
    { icon: Shield, title: 'Reliable & secure', desc: 'Your data is yours. We use industry-standard encryption and access controls to keep your work safe.' },
    { icon: Globe, title: 'Works everywhere', desc: 'TaskFlow works on any device, anywhere. Start on your laptop and continue on your phone seamlessly.' },
  ];

  const team = [
    { name: 'Alex Rivera', role: 'Co-founder & CEO', avatar: 'AR', color: '#6366f1' },
    { name: 'Sam Chen', role: 'Co-founder & CTO', avatar: 'SC', color: '#ec4899' },
    { name: 'Jordan Lee', role: 'Head of Product', avatar: 'JL', color: '#10b981' },
    { name: 'Taylor Kim', role: 'Head of Design', avatar: 'TK', color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-white/[0.05] backdrop-blur-md sticky top-0 z-30 bg-ink-950/85">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center">
              <Kanban className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-ink-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-ink-300 hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="btn btn-primary text-sm py-1.5">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-8">
            Our story
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Built by people who
            <br />
            <span className="gradient-text">love their work</span>
          </h1>
          <p className="text-ink-400 text-xl max-w-2xl mx-auto leading-relaxed">
            TaskFlow was born out of frustration with tools that were either too simple or too complex.
            We believe great software should feel effortless — and that's what we built.
          </p>
        </section>

        {/* Values */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl font-bold text-center mb-12">What we believe in</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
                <p className="text-ink-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="card-elevated p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '50K+', label: 'Active users' },
                { value: '2M+', label: 'Tasks completed' },
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '4.9★', label: 'Average rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-4xl font-bold gradient-text mb-1">{value}</p>
                  <p className="text-ink-400 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl font-bold text-center mb-3">The team</h2>
          <p className="text-ink-400 text-center mb-12">A small, passionate group working to make work better.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="card p-6 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-3"
                  style={{ background: m.color }}
                >
                  {m.avatar}
                </div>
                <p className="font-semibold text-sm">{m.name}</p>
                <p className="text-xs text-ink-400 mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to join us?</h2>
          <p className="text-ink-400 mb-8">Start your free account today — no credit card required.</p>
          <Link href="/register" className="btn btn-primary text-base px-8 py-3">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 px-6 text-center text-ink-500 text-sm">
        <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
