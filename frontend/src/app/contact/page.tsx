'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import TaskFlowLogo from '@/components/TaskFlowLogo';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission (no backend email endpoint)
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  const contacts = [
    { icon: Mail, label: 'Email support', value: 'support@taskflow.app', desc: 'We reply within 24 hours on business days.' },
    { icon: MessageSquare, label: 'Live chat', value: 'Available in-app', desc: 'Chat with us directly inside TaskFlow.' },
    { icon: Zap, label: 'Enterprise sales', value: 'sales@taskflow.app', desc: 'Custom plans and dedicated support.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-white/[0.05] backdrop-blur-md sticky top-0 z-30 bg-ink-950/85">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center">
              <TaskFlowLogo size={16} />
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

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">Get in touch</h1>
          <p className="text-ink-400 text-xl max-w-xl mx-auto">We'd love to hear from you. Whether it's a question, feature request, or just a hello.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="card-elevated p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Message sent!</h3>
                  <p className="text-ink-400 text-sm">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-2xl font-bold mb-6">Send us a message</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Your name</label>
                      <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Johnson" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Email address</label>
                      <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Subject</label>
                    <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" required />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-400 mb-1.5 uppercase tracking-wide">Message</label>
                    <textarea className="input resize-none" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more…" required />
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
                    {loading ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {contacts.map(({ icon: Icon, label, value, desc }) => (
              <div key={label} className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-accent text-sm mt-0.5">{value}</p>
                  <p className="text-ink-500 text-xs mt-1">{desc}</p>
                </div>
              </div>
            ))}

            <div className="card p-5">
              <h4 className="font-semibold text-sm mb-2">Business hours</h4>
              <div className="space-y-1.5 text-sm text-ink-400">
                <div className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="text-white">9am – 6pm EST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-white">10am – 2pm EST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-ink-500">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.05] py-8 px-6 text-center text-ink-500 text-sm">
        <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
