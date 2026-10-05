import type { Metadata } from 'next';
import { pageMetadata } from '@/libs/seo';
import Link from 'next/link';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Help Center',
    description:
      'Find answers to common questions about using Scriverly, managing your account, and getting the most out of your subscription.',
    path: '/help-center',
  }),
  // Every article is still a "Coming soon" placeholder — keep the page out of
  // search results until there is real content, then remove this and add the
  // route back to sitemap.ts.
  robots: { index: false, follow: true },
};

const categories = [
  {
    title: 'Getting started',
    articles: [
      'Creating your first essay',
      'How the AI sidebar works',
      'Using the outline generator',
      'Importing existing writing',
    ],
  },
  {
    title: 'Account and billing',
    articles: [
      'Upgrading to Premium',
      'Cancelling your subscription',
      'Updating payment details',
      'Requesting a refund',
    ],
  },
  {
    title: 'Writing and feedback',
    articles: [
      'Understanding your AI analysis score',
      'Choosing your academic level',
      'Citation style support',
      'Vocabulary and style suggestions',
    ],
  },
  {
    title: 'Privacy and data',
    articles: [
      'How your essays are stored',
      'Deleting your account and data',
      'AI training and your content',
      'Data export',
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Support</p>
          <h1 className={page.proseTitle}>Help center</h1>
          <p className={page.proseSubtitle}>
            Browse common questions and guides below. If you can&apos;t find what you&apos;re
            looking for, reach out via our{' '}
            <Link href="/contact">contact page</Link> and we&apos;ll get back to you promptly.
          </p>
        </header>

        <div className={page.helpGrid}>
          {categories.map(cat => (
            <div key={cat.title} className={page.helpCategory}>
              <h2 className={page.helpCategoryTitle}>{cat.title}</h2>
              <ul className={page.helpArticleList}>
                {cat.articles.map(label => (
                  <li key={label} className={page.helpArticleItem}>
                    <span className={page.helpArticleLabel}>{label}</span>
                    <span className={page.helpArticleSoon}>Coming soon</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={page.helpCta}>
          <p className={page.helpCtaText}>
            Still need help? Our support team typically responds within one business day.
          </p>
          <Link href="/contact" className={page.heroPrimary}>
            Contact support
          </Link>
        </div>

      </div>
    </section>
  );
}
