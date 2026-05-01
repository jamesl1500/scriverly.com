import type { Metadata } from 'next';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'Terms of Service — Scriverly',
  description: 'Read the Scriverly Terms of Service.',
};

export default function TermsPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Legal</p>
          <h1 className={page.proseTitle}>Terms of Service</h1>
          <p className={page.proseSubtitle}>
            Please read these terms carefully before using Scriverly.
          </p>
          <p className={page.proseMeta}>Last updated: May 1, 2026</p>
        </header>

        <div className={page.proseBody}>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Scriverly (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the
            Service. We may update these Terms from time to time; continued use of the Service after
            changes constitutes acceptance of the revised Terms.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 13 years old to use Scriverly. By using the Service, you represent
            and warrant that you meet this requirement. If you are under 18, you represent that you
            have obtained parental or guardian consent.
          </p>

          <h2>3. Your Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity that occurs under your account. You agree to notify us immediately at{' '}
            <a href="mailto:security@scriverly.com">security@scriverly.com</a> of any unauthorized
            use of your account. We are not liable for losses arising from unauthorized use of your
            account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Submit content that infringes the intellectual property rights of others.</li>
            <li>Attempt to reverse-engineer, decompile, or disassemble any part of the Service.</li>
            <li>Use automated means (bots, scrapers) to access the Service without our written permission.</li>
            <li>Transmit malware, viruses, or other harmful code.</li>
            <li>Use the Service to engage in academic fraud (e.g., submitting AI-generated text as your own work in violation of your institution&apos;s academic integrity policy).</li>
          </ul>
          <p>
            <strong>Academic Integrity:</strong> Scriverly is designed to assist and improve your
            writing, not to write for you. You are solely responsible for ensuring your use of the
            Service complies with your institution&apos;s academic integrity policies.
          </p>

          <h2>5. Your Content</h2>
          <p>
            You retain full ownership of all text, essays, and other content you create using the
            Service (&quot;Your Content&quot;). By using the Service, you grant Scriverly a limited,
            non-exclusive, worldwide license to process Your Content solely for the purpose of
            providing and improving the Service. We do not use Your Content to train AI models.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The Service, including its software, design, trademarks, and content created by
            Scriverly, is owned by Scriverly and protected by applicable intellectual property laws.
            Nothing in these Terms grants you any right to use Scriverly&apos;s trademarks, logos,
            or other proprietary information without our prior written consent.
          </p>

          <h2>7. Third-Party Services</h2>
          <p>
            Scriverly uses third-party services including Supabase (database and authentication) and
            Anthropic (AI analysis). Your use of the Service is subject to those providers&apos; terms
            and privacy policies. We are not responsible for the practices of third-party providers.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTY
            OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
            WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AI-GENERATED
            FEEDBACK WILL BE ACCURATE OR COMPLETE.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, SCRIVERLY SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA OR
            PROFITS, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE BEEN
            ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          <h2>10. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time, with
            or without notice, for conduct that we believe violates these Terms or is harmful to other
            users, us, or third parties. You may delete your account at any time through your account
            settings.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, United States, without
            regard to its conflict-of-law provisions. Any disputes arising from these Terms shall be
            resolved exclusively in the courts located in Delaware.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:legal@scriverly.com">legal@scriverly.com</a> or visit our{' '}
            <a href="/contact">contact page</a>.
          </p>

        </div>
      </div>
    </section>
  );
}
