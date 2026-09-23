import type { Metadata } from 'next';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Read the Scriverly Cookie Policy to understand which cookies we use and why.',
};

export default function CookiesPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Legal</p>
          <h1 className={page.proseTitle}>Cookie Policy</h1>
          <p className={page.proseSubtitle}>
            We keep cookie use to a minimum. Here&apos;s exactly what we set and why.
          </p>
          <p className={page.proseMeta}>Last updated: May 1, 2026</p>
        </header>

        <div className={page.proseBody}>

          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They let a
            site remember information about your visit, such as whether you&apos;re signed in.
          </p>

          <h2>2. Cookies We Use</h2>
          <p>
            Scriverly only uses cookies that are strictly necessary to operate the Service. We do not
            use advertising or cross-site tracking cookies, and we do not sell cookie data to third
            parties.
          </p>
          <ul>
            <li>
              <strong>Authentication cookies:</strong> Set by Supabase to keep you signed in and to
              secure your session. Without these, you would need to log in again on every request.
            </li>
            <li>
              <strong>Preference cookies:</strong> Used to remember basic interface choices you make
              while using the Service.
            </li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>
            If you start a subscription checkout, you&apos;ll be redirected to Stripe&apos;s hosted
            payment page, which sets its own cookies to process your payment securely. Stripe&apos;s
            use of cookies is governed by their{' '}
            <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">
              Cookie Policy
            </a>
            . We do not control cookies set on Stripe&apos;s domain.
          </p>

          <h2>4. Managing Cookies</h2>
          <p>
            Most browsers let you block or delete cookies through their settings. Because the cookies
            we set are essential to signing in and using the Service, blocking them will prevent you
            from using authenticated features such as the dashboard and essay editor.
          </p>

          <h2>5. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will post any changes on this page
            and update the &quot;Last updated&quot; date above.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions about this Cookie Policy, contact us at{' '}
            <a href="mailto:privacy@scriverly.com">privacy@scriverly.com</a> or via our{' '}
            <a href="/contact">contact page</a>.
          </p>

        </div>
      </div>
    </section>
  );
}
