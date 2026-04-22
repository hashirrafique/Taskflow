import Link from 'next/link';
import { Kanban } from 'lucide-react';

export default function TermsPage() {
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
        <h1 className="font-display text-5xl font-bold mb-3">Terms of Service</h1>
        <p className="text-ink-400 text-sm mb-12">Last updated: January 1, 2025</p>

        {[
          {
            title: '1. Acceptance of terms',
            content: `By accessing or using TaskFlow, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.\n\nWe may update these terms from time to time. We will notify you of any material changes by email or through the service. Your continued use of TaskFlow after changes are made constitutes your acceptance of the new terms.`,
          },
          {
            title: '2. Account registration',
            content: `To use TaskFlow, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.\n\nYou must be at least 16 years old to use TaskFlow. By creating an account, you represent and warrant that you meet this requirement.`,
          },
          {
            title: '3. Acceptable use',
            content: `You agree to use TaskFlow only for lawful purposes and in accordance with these terms. You may not use TaskFlow to transmit any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.\n\nYou may not attempt to gain unauthorized access to any portion of the service, other accounts, or computer systems connected to TaskFlow. You may not use automated means to access or scrape the service without our prior written consent.`,
          },
          {
            title: '4. Intellectual property',
            content: `TaskFlow and its original content, features, and functionality are and will remain the exclusive property of TaskFlow, Inc. and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of TaskFlow, Inc.\n\nYou retain all rights to the content you create and upload to TaskFlow. By using our service, you grant us a limited license to store, display, and share your content as necessary to provide the service.`,
          },
          {
            title: '5. Subscription and payment',
            content: `Some features of TaskFlow are available only with a paid subscription. By subscribing, you agree to pay the applicable fees. Subscription fees are billed in advance on a monthly or annual basis.\n\nYou may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period. We do not provide refunds for partial periods.`,
          },
          {
            title: '6. Service availability',
            content: `We strive to maintain high availability of the service, but we do not guarantee that TaskFlow will be available at all times. We reserve the right to modify or discontinue the service at any time with reasonable notice.\n\nWe will not be liable to you or any third party for any modification, suspension, or discontinuation of the service.`,
          },
          {
            title: '7. Limitation of liability',
            content: `To the maximum extent permitted by law, TaskFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.\n\nIn no event shall our total liability to you exceed the greater of the amount you paid us in the twelve months preceding the claim or $100.`,
          },
          {
            title: '8. Governing law',
            content: `These terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.\n\nAny dispute arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Delaware.`,
          },
          {
            title: '9. Contact',
            content: `If you have any questions about these Terms of Service, please contact us at legal@taskflow.app.`,
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
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
