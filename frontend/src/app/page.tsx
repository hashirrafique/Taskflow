'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Zap, Shield, ArrowRight, Users, BarChart3, MessageSquare,
  Layers, Bell, Lock, Star, ChevronRight, Github, Twitter, Globe,
  Kanban, Clock, Tag, Sparkles, ChevronDown
} from 'lucide-react';

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06 }}
      className="card overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-semibold text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-ink-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-ink-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } }
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };

export default function Home() {
  return (
    <div className="min-h-screen bg-ink-950 text-white overflow-hidden selection:bg-accent/30 selection:text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-accent/15 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-pink-500/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-cyan-500/6 blur-[100px] rounded-full" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/[0.04]">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/30">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold tracking-wide">TaskFlow</span>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="hidden md:flex items-center gap-7 text-sm text-ink-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 items-center">
          <Link href="/login" className="text-ink-300 hover:text-white font-medium transition-colors text-sm px-3 py-1.5">Sign in</Link>
          <Link href="/register" className="btn btn-primary shadow-lg shadow-accent/25 px-5 py-2 text-sm">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            New — Real-time collaboration is live
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-display font-bold leading-[1.05] mb-7">
            <span className="bg-gradient-to-br from-white via-white to-ink-400 bg-clip-text text-transparent">Ship faster,</span>
            <br />
            <span className="bg-gradient-to-r from-accent via-violet-400 to-pink-500 bg-clip-text text-transparent">stay in flow.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-ink-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            The ultra-fast, beautifully designed project management workspace. Organize tasks, collaborate with your team, and ship on time — every time.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/register" className="btn btn-primary h-13 px-8 text-base w-full sm:w-auto shadow-xl shadow-accent/25 gap-2.5 group hover:scale-[1.02] transition-transform">
              Start for free <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login" className="btn btn-ghost border border-white/10 h-13 px-8 text-base w-full sm:w-auto backdrop-blur-md hover:bg-white/5">
              Sign in to your workspace
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-10 text-sm text-ink-400">
            {[['10k+', 'Active users'], ['50k+', 'Tasks completed'], ['99.9%', 'Uptime'], ['4.9★', 'Average rating']].map(([n, l]) => (
              <div key={l} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold text-white font-display">{n}</span>
                <span>{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating board preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 100, damping: 20 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="card p-1.5 border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
            <div className="bg-ink-900/80 rounded-xl p-6 min-h-[280px] flex gap-4">
              {[
                { col: 'To Do', color: 'bg-ink-700', tasks: ['Design system audit', 'API rate limiting'], count: 4 },
                { col: 'In Progress', color: 'bg-accent/20', tasks: ['Auth refactor', 'Dashboard UI'], count: 3 },
                { col: 'Done', color: 'bg-emerald-500/20', tasks: ['User model update', 'Socket integration'], count: 7 },
              ].map((c) => (
                <div key={c.col} className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-ink-300 uppercase tracking-wider">{c.col}</span>
                    <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-ink-400">{c.count}</span>
                  </div>
                  <div className="space-y-2.5">
                    {c.tasks.map((t) => (
                      <div key={t} className={`rounded-lg p-3 border border-white/5 ${c.color} backdrop-blur-sm`}>
                        <p className="text-sm font-medium text-ink-100 mb-2">{t}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-accent/60 text-xs flex items-center justify-center font-bold">H</div>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-xs text-ink-400">Due tomorrow</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Logos strip */}
      <section className="relative z-10 border-y border-white/[0.04] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10 text-ink-500 text-sm font-semibold tracking-wider">
          {['NOTION', 'JIRA', 'ASANA', 'LINEAR', 'TRELLO'].map((l) => (
            <span key={l} className="opacity-30 hover:opacity-60 transition-opacity">{l}</span>
          ))}
          <span className="text-xs text-ink-600">Trusted alternative to all of the above</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">Features</span>
          <h2 className="font-display text-5xl font-bold mb-4">Everything you need to <span className="text-accent">ship faster</span></h2>
          <p className="text-ink-400 text-lg max-w-2xl mx-auto">Powerful features packed into a clean, intuitive interface. No bloat, just what matters.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <Zap className="w-5 h-5 text-yellow-400" />, color: 'bg-yellow-400/10', title: 'Real-Time Sync', desc: 'Watch tasks move across the board instantly. WebSocket-powered live updates — no refresh needed, ever.' },
            { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, color: 'bg-emerald-400/10', title: 'Subtask Tracking', desc: 'Break work into granular pieces. Subtask checklists with progress indicators keep you on track.' },
            { icon: <Shield className="w-5 h-5 text-accent" />, color: 'bg-accent/10', title: 'Role-Based Access', desc: 'Strict owner, admin, member, and viewer roles enforced at the server level. Security by default.' },
            { icon: <Users className="w-5 h-5 text-pink-400" />, color: 'bg-pink-400/10', title: 'Team Workspaces', desc: 'Create unlimited workspaces, invite teammates with a code, and collaborate on shared boards.' },
            { icon: <MessageSquare className="w-5 h-5 text-cyan-400" />, color: 'bg-cyan-400/10', title: 'Task Comments', desc: 'Discuss, review, and resolve tasks right in context. Comment threads keep conversations organized.' },
            { icon: <Bell className="w-5 h-5 text-orange-400" />, color: 'bg-orange-400/10', title: 'Priority & Due Dates', desc: 'Set high/medium/low priorities and track deadlines with color-coded warnings when tasks near their due date.' },
            { icon: <Layers className="w-5 h-5 text-violet-400" />, color: 'bg-violet-400/10', title: 'Drag & Drop Board', desc: 'Fluid Kanban experience. Drag tasks between columns with optimistic UI — feels instant, stays accurate.' },
            { icon: <Lock className="w-5 h-5 text-rose-400" />, color: 'bg-rose-400/10', title: 'JWT Authentication', desc: 'Secure login and registration with bcrypt hashing and JWT tokens. Your data stays safe.' },
            { icon: <BarChart3 className="w-5 h-5 text-teal-400" />, color: 'bg-teal-400/10', title: 'Progress Visibility', desc: 'See task counts per column, subtask progress bars, and member counts at a glance across all workspaces.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="card p-7 hover:border-white/15 transition-all group hover:-translate-y-0.5 cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2.5">{f.title}</h3>
              <p className="text-ink-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 bg-ink-900/30 border-y border-white/[0.04] py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">How it works</span>
            <h2 className="font-display text-5xl font-bold mb-4">Up and running in <span className="text-accent">3 minutes</span></h2>
            <p className="text-ink-400 text-lg">No onboarding calls, no complicated setup — just create an account and start building.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up in seconds. No credit card required. Just an email and a password to get started.', icon: <Sparkles className="w-6 h-6 text-accent" /> },
              { step: '02', title: 'Set up a workspace', desc: 'Create a workspace for your project or team. Customize it with a name, color, and description.', icon: <Layers className="w-6 h-6 text-violet-400" /> },
              { step: '03', title: 'Invite & collaborate', desc: 'Share your invite code and start adding tasks. Everything syncs in real-time for your whole team.', icon: <Users className="w-6 h-6 text-pink-400" /> },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="card p-8 h-full hover:border-white/15 transition-all">
                  <div className="flex items-start gap-4 mb-5">
                    <span className="font-display text-5xl font-bold text-white/5 leading-none select-none">{s.step}</span>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mt-1 flex-shrink-0">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-ink-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight className="w-5 h-5 text-ink-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">Testimonials</span>
          <h2 className="font-display text-5xl font-bold mb-4">Loved by <span className="text-accent">teams worldwide</span></h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: 'Sarah Chen', role: 'Product Manager @ Stripe', avatar: 'SC', color: '#ec4899', text: "TaskFlow replaced three tools for us. The real-time sync is genuinely impressive — it feels like magic when tasks update across the team instantly.", stars: 5 },
            { name: 'Marcus Webb', role: 'CTO @ BuilderAI', avatar: 'MW', color: '#6366f1', text: "The RBAC system is exactly what we needed for client projects. Viewers can track progress without accidentally breaking anything. Clean, secure, perfect.", stars: 5 },
            { name: 'Priya Nair', role: 'Engineering Lead @ Vercel', avatar: 'PN', color: '#10b981', text: "I've tried every Kanban tool out there. TaskFlow is the first one that actually stays out of the way. Beautiful UI, zero learning curve, ships fast.", stars: 5 },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-7 hover:border-white/15 transition-all"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-ink-200 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-ink-400 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 bg-ink-900/30 border-y border-white/[0.04] py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">Pricing</span>
            <h2 className="font-display text-5xl font-bold mb-4">Simple, <span className="text-accent">honest pricing</span></h2>
            <p className="text-ink-400 text-lg">No hidden fees, no surprise charges. Start free, upgrade when you need to.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: 'forever', desc: 'Perfect for individuals and small projects', features: ['3 workspaces', 'Up to 5 members', 'Unlimited tasks', 'Real-time sync', 'Basic subtasks'], cta: 'Get started free', primary: false },
              { name: 'Pro', price: '$12', period: '/mo per seat', desc: 'For growing teams that need more power', features: ['Unlimited workspaces', 'Unlimited members', 'Advanced RBAC', 'Priority support', 'Custom workspace colors', 'API access'], cta: 'Start Pro trial', primary: true },
              { name: 'Team', price: '$49', period: '/mo flat', desc: 'For organizations that need full control', features: ['Everything in Pro', 'Up to 50 members', 'SSO integration', 'Audit logs', 'Dedicated support', 'Custom domain'], cta: 'Contact sales', primary: false },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card p-8 relative ${p.primary ? 'border-accent/50 bg-accent/5 shadow-xl shadow-accent/10' : 'hover:border-white/15'} transition-all`}
              >
                {p.primary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-accent to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-ink-400 text-sm">{p.period}</span>
                  </div>
                  <p className="text-ink-400 text-sm">{p.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-ink-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`btn w-full justify-center text-sm ${p.primary ? 'btn-primary shadow-lg shadow-accent/20' : 'btn-ghost border-white/10'}`}
                >
                  {p.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest mb-3 block">FAQ</span>
          <h2 className="font-display text-5xl font-bold mb-4">Questions? <span className="text-accent">Answered.</span></h2>
        </motion.div>
        <div className="space-y-3">
          {[
            { q: 'Is TaskFlow really free to start?', a: "Yes. No credit card required. Our free plan includes 3 workspaces, 5 members each, and unlimited tasks to get you started." },
            { q: 'How does real-time collaboration work?', a: "TaskFlow uses WebSockets to push changes instantly across all connected clients. When a teammate moves a task, you see it move in real-time — no page refresh needed." },
            { q: 'Can I import my data from Trello or Jira?', a: "CSV import is available on all plans. We're working on native Trello and Jira importers for the Pro plan. You can also use our API for custom migrations." },
            { q: 'How secure is my data?', a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Passwords are hashed with bcrypt. We run penetration tests quarterly and operate with zero-trust networking." },
            { q: 'What happens to my data if I cancel?', a: "You have 30 days to export everything after cancellation. We provide full data exports in JSON and CSV format. Your data is never held hostage." },
            { q: 'Do you offer discounts for startups or nonprofits?', a: "Yes — 50% off Pro for qualifying nonprofits and early-stage startups. Contact us at support@taskflow.app with proof of status." },
          ].map(({ q, a }, i) => (
            <FaqItem key={i} q={q} a={a} i={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-28 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="card p-16 border-accent/20 bg-accent/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-violet-600/10 pointer-events-none" />
            <h2 className="font-display text-5xl font-bold mb-4 relative z-10">Ready to flow?</h2>
            <p className="text-ink-300 text-lg mb-8 relative z-10">Join thousands of teams already using TaskFlow to ship faster and stay aligned.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/register" className="btn btn-primary h-12 px-8 text-base gap-2.5 shadow-xl shadow-accent/25 hover:scale-105 transition-transform">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="btn btn-ghost border-white/15 h-12 px-8 text-base">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center">
                  <Kanban className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-xl font-bold">TaskFlow</span>
              </div>
              <p className="text-ink-400 text-sm leading-relaxed">The ultra-fast, radically beautiful project management workspace.</p>
            </div>
            {[
              { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '/pricing' }, { label: 'FAQ', href: '#faq' }, { label: 'Changelog', href: '#' }] },
              { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }, { label: 'Careers', href: '#' }, { label: 'Blog', href: '#' }] },
              { title: 'Legal', links: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }, { label: 'Status', href: '#' }, { label: 'Security', href: '#' }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}><Link href={l.href} className="text-ink-400 text-sm hover:text-white transition-colors">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.04]">
            <p className="text-ink-500 text-sm">© 2026 TaskFlow. Built with care.</p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/hashirrafique" target="_blank" rel="noreferrer" className="text-ink-500 hover:text-white transition-colors"><Github className="w-4.5 h-4.5" /></a>
              <a href="#" className="text-ink-500 hover:text-white transition-colors"><Twitter className="w-4.5 h-4.5" /></a>
              <a href="#" className="text-ink-500 hover:text-white transition-colors"><Globe className="w-4.5 h-4.5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
