import Link from 'next/link';
import { Kanban } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/[0.05] backdrop-blur-md sticky top-0 z-30 bg-ink-950/85">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center">
              <Kanban className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">TaskFlow</span>
          </Link>
          <Link href="/login" className="text-sm text-ink-300 hover:text-white transition-colors">Sign in</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-display text-5xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-ink-400 text-sm mb-12">Last updated: January 1, 2025</p>

        {[
          {
            title: '1. Information we collect',
            content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, profile information, and any content you create using TaskFlow.\n\nWe also automatically collect certain technical information when you use our service, including your IP address, browser type, device information, and usage data through cookies and similar tracking technologies.`,
          },
          {
            title: '2. How we use your information',
            content: `We use the information we collect to provide, maintain, and improve our services; process transactions; send technical notices and support messages; respond to your comments and questions; and send you information about products, services, and events.\n\nWe may also use your information to monitor and analyze trends, usage, and activities in connection with our services.`,
          },
          {
            title: '3. Information sharing',
            content: `We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.\n\nWe may share your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.`,
          },
          {
            title: '4. Data retention',
            content: `We retain your personal data for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are legally required to retain it longer.`,
          },
          {
            title: '5. Security',
            content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing and against accidental loss, destruction, or damage. All data is encrypted in transit using TLS and at rest using AES-256 encryption.\n\nHowever, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security.`,
          },
          {
            title: '6. Your rights',
            content: `You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data or opt out of marketing communications.\n\nIf you are located in the European Economic Area, you have certain rights under GDPR, including the right to data portability, the right to be forgotten, and the right to lodge a complaint with your local data protection authority.`,
          },
          {
            title: '7. Cookies',
            content: `We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.`,
          },
          {
            title: '8. Contact us',
            content: `If you have any questions about this Privacy Policy, please contact us at privacy@taskflow.app or through our contact page.`,
          },
        ].map(({ title, content }) => (
          <section key={title} className="mb-10">
            <h2 className="font-display text-2xl font-bold mb-3">{title}</h2>
            {content.split('\n\n').map((p, i) => (
              <p key={i} className="text-ink-300 text-sm leading-relaxed mb-3">{p}</p>
            ))}
          </section>
        ))}
      </main>

      <footer className="border-t border-white/[0.05] py-8 px-6 text-center text-ink-500 text-sm">
        <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
