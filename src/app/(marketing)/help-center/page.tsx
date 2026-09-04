import type { Metadata } from 'next';
import Link from 'next/link';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'Help Center — Scriverly',
  description:
    'Find answers to common questions about using Scriverly, managing your account, and getting the most out of your subscription.',
};

const categories = [
  {
    title: 'Getting started',
    articles: [
      { label: 'Creating your first essay', href: '#' },
      { label: 'How the AI sidebar works', href: '#' },
      { label: 'Using the outline generator', href: '#' },
      { label: 'Importing existing writing', href: '#' },
    ],
  },
  {
    title: 'Account and billing',
    articles: [
      { label: 'Upgrading to Premium', href: '#' },
      { label: 'Cancelling your subscription', href: '#' },
      { label: 'Updating payment details', href: '#' },
      { label: 'Requesting a refund', href: '#' },
    ],
  },
  {
    title: 'Writing and feedback',
    articles: [
      { label: 'Understanding your AI analysis score', href: '#' },
      { label: 'Choosing your academic level', href: '#' },
      { label: 'Citation style support', href: '#' },
      { label: 'Vocabulary and style suggestions', href: '#' },
    ],
  },
  {
    title: 'Privacy and data',
    articles: [
      { label: 'How your essays are stored', href: '#' },
      { label: 'Deleting your account and data', href: '#' },
      { label: 'AI training and your content', href: '#' },
      { label: 'Data export', href: '#' },
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
                {cat.articles.map(article => (
                  <li key={article.label}>
                    <Link href={article.href} className={page.helpArticleLink}>
                      {article.label}
                    </Link>
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
