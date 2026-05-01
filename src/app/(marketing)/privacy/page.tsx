import type { Metadata } from 'next';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Policy — Scriverly',
  description: 'Read the Scriverly Privacy Policy to understand how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Legal</p>
          <h1 className={page.proseTitle}>Privacy Policy</h1>
          <p className={page.proseSubtitle}>
            We take your privacy seriously. Here&apos;s exactly what data we collect, why, and how
            we protect it.
          </p>
          <p className={page.proseMeta}>Last updated: May 1, 2026</p>
        </header>

        <div className={page.proseBody}>

          <h2>1. Who We Are</h2>
          <p>
            Scriverly (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the Scriverly
            academic writing platform accessible at scriverly.com. This Privacy Policy explains how
            we collect, use, disclose, and safeguard information about you when you use our Service.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>Information you provide directly</h3>
          <ul>
            <li><strong>Account information:</strong> Name, email address, username, academic institution, department, and academic level when you create an account.</li>
            <li><strong>Profile information:</strong> Biography and profile photo if you choose to provide them.</li>
            <li><strong>Essay content:</strong> The text, titles, settings, and metadata of essays you create in the Service.</li>
            <li><strong>Communications:</strong> Messages you send us through the contact form or email.</li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> Pages visited, features used, and actions taken within the Service (e.g., essays created, analyses run).</li>
            <li><strong>Device and log data:</strong> IP address, browser type, operating system, and timestamps of requests.</li>
            <li><strong>Cookies and local storage:</strong> Session tokens and authentication cookies required for the Service to function.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain the Service.</li>
            <li>Send your essay content to Anthropic&apos;s API to generate AI analysis and feedback.</li>
            <li>Authenticate your identity and secure your account.</li>
            <li>Send transactional emails (account verification, password reset, email change confirmation).</li>
            <li>Respond to your support requests and communications.</li>
            <li>Monitor and improve the reliability and performance of the Service.</li>
            <li>Comply with legal obligations.</li>
          </ul>
          <p>
            <strong>We do not:</strong> sell your personal data, use your essay content to train AI models, or send marketing emails without your explicit consent.
          </p>

          <h2>4. How We Share Your Information</h2>
          <p>We share your information only in these limited circumstances:</p>
          <ul>
            <li>
              <strong>Anthropic:</strong> Essay text is sent to Anthropic&apos;s Claude API solely to generate writing analysis. Anthropic&apos;s use of data is governed by their{' '}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </li>
            <li>
              <strong>Supabase:</strong> We use Supabase to store user data and files. Data is stored in encrypted, access-controlled databases.
            </li>
            <li>
              <strong>Legal requirements:</strong> We may disclose information if required by law, court order, or to protect the rights and safety of our users.
            </li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            We retain your account and essay data for as long as your account is active. If you delete
            your account, we will delete or anonymize your personal data within 30 days, except where
            retention is required by law or necessary to resolve disputes.
          </p>

          <h2>6. Security</h2>
          <p>
            We use industry-standard safeguards including TLS encryption in transit, encrypted
            database storage, and access controls. However, no method of transmission over the
            internet is 100% secure. We encourage you to use a strong, unique password and enable
            any available account security features.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li><strong>Access</strong> the personal data we hold about you.</li>
            <li><strong>Correct</strong> inaccurate data through your account settings.</li>
            <li><strong>Delete</strong> your account and associated data.</li>
            <li><strong>Export</strong> your essay content at any time.</li>
            <li><strong>Object</strong> to certain processing activities.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:privacy@scriverly.com">privacy@scriverly.com</a>.
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If we learn that we have collected such information,
            we will delete it promptly.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by posting the new policy on this page and updating the &quot;Last updated&quot;
            date. We encourage you to review this policy periodically.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:privacy@scriverly.com">privacy@scriverly.com</a> or via our{' '}
            <a href="/contact">contact page</a>.
          </p>

        </div>
      </div>
    </section>
  );
}
