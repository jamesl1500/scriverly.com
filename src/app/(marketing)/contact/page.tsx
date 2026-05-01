import type { Metadata } from 'next';
import page from '@/styles/pages/marketing.module.scss';
import ContactForm from './_components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us — Scriverly',
  description: 'Get in touch with the Scriverly team. We read every message.',
};

export default function ContactPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Contact</p>
          <h1 className={page.proseTitle}>Get in touch</h1>
          <p className={page.proseSubtitle}>
            Have a question, bug report, or just want to say hello? We read every message and
            typically respond within one business day.
          </p>
        </header>

        <div className={page.contactGrid}>

          {/* Left: contact details */}
          <aside className={page.contactInfo}>
            <div className={page.contactInfoBlock}>
              <span className={page.contactInfoLabel}>General inquiries</span>
              <p className={page.contactInfoValue}>
                <a href="mailto:hello@scriverly.com">hello@scriverly.com</a>
              </p>
            </div>

            <div className={page.contactInfoBlock}>
              <span className={page.contactInfoLabel}>Privacy &amp; data</span>
              <p className={page.contactInfoValue}>
                <a href="mailto:privacy@scriverly.com">privacy@scriverly.com</a>
              </p>
            </div>

            <div className={page.contactInfoBlock}>
              <span className={page.contactInfoLabel}>Security</span>
              <p className={page.contactInfoValue}>
                <a href="mailto:security@scriverly.com">security@scriverly.com</a>
              </p>
            </div>

            <div className={page.contactInfoBlock}>
              <span className={page.contactInfoLabel}>Response time</span>
              <p className={page.contactInfoValue}>
                We aim to respond to all messages within 1–2 business days.
              </p>
            </div>
          </aside>

          {/* Right: form */}
          <ContactForm />

        </div>
      </div>
    </section>
  );
}
