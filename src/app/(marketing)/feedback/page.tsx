import type { Metadata } from 'next';
import { pageMetadata } from '@/libs/seo';
import page from '@/styles/pages/marketing.module.scss';
import FeedbackForm from './_components/FeedbackForm';

export const metadata: Metadata = pageMetadata({
  title: 'Give Feedback',
  description:
    'Share a bug report, feature request, or general suggestion with the Scriverly team.',
  path: '/feedback',
});

export default function FeedbackPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Feedback</p>
          <h1 className={page.proseTitle}>Share your feedback</h1>
          <p className={page.proseSubtitle}>
            Found a bug, have a feature idea, or want to tell us what&apos;s working well? Every
            submission is read by the team and helps shape the direction of Scriverly.
          </p>
        </header>

        <div className={page.contactGrid}>

          <aside className={page.contactInfo}>
            <div className={page.contactInfoBlock}>
              <span className={page.contactInfoLabel}>Bug reports</span>
              <p className={page.contactInfoValue}>
                Include steps to reproduce and the browser or device you&apos;re using. Screenshots
                help too.
              </p>
            </div>

            <div className={page.contactInfoBlock}>
              <span className={page.contactInfoLabel}>Feature requests</span>
              <p className={page.contactInfoValue}>
                Describe the problem you are trying to solve, not just the solution. That context
                helps us build the right thing.
              </p>
            </div>

            <div className={page.contactInfoBlock}>
              <span className={page.contactInfoLabel}>Response</span>
              <p className={page.contactInfoValue}>
                We review all submissions but may not be able to respond to each one individually.
                Leave your email if you&apos;d like a reply.
              </p>
            </div>
          </aside>

          <FeedbackForm />

        </div>
      </div>
    </section>
  );
}
