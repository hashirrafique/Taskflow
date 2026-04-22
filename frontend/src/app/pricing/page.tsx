import Link from 'next/link';
import { Check, ArrowRight, Zap } from 'lucide-react';
import TaskFlowLogo from '@/components/TaskFlowLogo';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for individuals and small projects.',
    color: 'border-white/10',
    cta: 'Get started free',
    ctaStyle: 'btn-ghost border-white/15',
    features: [
      '3 workspaces',
      'Up to 5 members per workspace',
      '100 tasks per workspace',
      'Basic kanban board',
      'Comments & file attachments',
      'Email notifications',
      '7-day activity history',
    ],
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per user / month',
    description: 'For growing teams that need more power.',
    color: 'border-accent/40',
    badge: 'Most popular',
    cta: 'Start free trial',
    ctaStyle: 'btn-primary',
    features: [
      'Unlimited workspaces',
      'Unlimited members',
      'Unlimited tasks',
      'Advanced views: Calendar, Analytics',
      'Time tracking',
      'Task labels & priorities',
      'Custom fields',
      'Priority email support',
      '90-day activity history',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations with advanced needs.',
    color: 'border-white/10',
    cta: 'Contact sales',
    ctaStyle: 'btn-ghost border-white/15',
    features: [
      'Everything in Pro',
      'SSO / SAML integration',
      'Advanced permissions',
      'Audit logs',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantees',
      'On-premise deployment option',
      'Custom data retention',
    ],
  },
];

const faqs = [
  { q: 'Can I switch plans at any time?', a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the pro-rated difference. When downgrading, you'll receive a credit toward future billing." },
  { q: 'Is there a free trial for Pro?', a: 'Yes, Pro comes with a 14-day free trial — no credit card required. You can explore all Pro features and upgrade only if it fits your needs.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as PayPal. Enterprise customers can also pay by invoice.' },
  { q: 'What happens to my data if I cancel?', a: 'Your data is yours. When you cancel, you have 30 days to export everything before it is permanently deleted. We never hold your data hostage.' },
  { q: 'Is there a limit on file attachments?', a: 'Free plan includes 1 GB storage per workspace. Pro includes 100 GB. Enterprise includes unlimited storage.' },
  { q: 'Do you offer discounts for nonprofits or education?', a: 'Yes! We offer 50% discounts for verified nonprofits and educational institutions. Contact us with proof of status to apply.' },
];

export default function PricingPage() {
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
            <Link href="/about" className="text-sm text-ink-300 hover:text-white transition-colors">About</Link>
            <Link href="/login" className="text-sm text-ink-300 hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="btn btn-primary text-sm py-1.5">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-8">
            <Zap className="w-3.5 h-3.5" /> Simple, transparent pricing
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-5">
            Plans for every<br /><span className="gradient-text">kind of team</span>
          </h1>
          <p className="text-ink-400 text-xl max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees, no surprises.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="max-w-6xl mx-auto px-6 py-8 pb-20">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div key={plan.name} className={`card p-8 relative ${plan.badge ? 'border-accent/40 shadow-lg shadow-accent/10' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent rounded-full text-white text-xs font-semibold shadow-lg">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold mb-1.5">{plan.name}</h3>
                  <p className="text-ink-400 text-sm mb-5">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    <span className="text-ink-400 text-sm mb-1">/{plan.period}</span>
                  </div>
                </div>

                <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'} className={`btn ${plan.ctaStyle} w-full justify-center mb-6`}>
                  {plan.cta} {plan.name !== 'Enterprise' && <ArrowRight className="w-4 h-4" />}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-ink-300">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto px-6 py-16 pb-24">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="card p-6">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-ink-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Still have questions?</h2>
          <p className="text-ink-400 mb-8">Our team is happy to help you pick the right plan.</p>
          <Link href="/contact" className="btn btn-ghost border-white/15 text-base px-8 py-3">
            Contact us
          </Link>
        </section>
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
