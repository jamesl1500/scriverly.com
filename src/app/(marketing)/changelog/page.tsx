import type { Metadata } from 'next';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'Changelog — Scriverly',
  description: 'A running log of product updates, improvements, and fixes shipped to Scriverly.',
};

const releases = [
  {
    version: '0.5.0',
    date: 'May 19, 2026',
    tag: 'Release',
    items: [
      { type: 'New', text: 'AI writing sidebar with real-time analysis across five dimensions.' },
      { type: 'New', text: 'Outline generator for structuring essays before drafting.' },
      { type: 'New', text: 'Essay list with creation date, word count, and AI analysis status.' },
      { type: 'Improved', text: 'Faster analysis pipeline — results now appear within seconds of saving.' },
      { type: 'Fixed', text: 'Sidebar feedback occasionally showing stale analysis from a previous draft.' },
    ],
  },
  {
    version: '0.4.0',
    date: 'May 3, 2026',
    tag: 'Release',
    items: [
      { type: 'New', text: 'Premium subscription tier with unlimited AI analyses via Stripe.' },
      { type: 'New', text: 'Upgrade modal shown when free-tier quota is reached.' },
      { type: 'Improved', text: 'Billing portal link in account settings for managing subscriptions.' },
    ],
  },
  {
    version: '0.3.0',
    date: 'April 30, 2026',
    tag: 'Release',
    items: [
      { type: 'New', text: 'Essay AI analyses table for persisting and retrieving past feedback.' },
      { type: 'New', text: 'Per-user AI usage tracking to enforce free-tier quotas.' },
      { type: 'Fixed', text: 'Row-level security policies tightened across all database tables.' },
    ],
  },
  {
    version: '0.2.0',
    date: 'April 28, 2026',
    tag: 'Release',
    items: [
      { type: 'New', text: 'User profiles with username and bio.' },
      { type: 'New', text: 'Onboarding flow for new accounts.' },
      { type: 'Improved', text: 'Settings page with profile and account management sections.' },
    ],
  },
  {
    version: '0.1.0',
    date: 'April 23, 2026',
    tag: 'Initial release',
    items: [
      { type: 'New', text: 'Authentication with Supabase — sign up, log in, forgot password, and email verification.' },
      { type: 'New', text: 'Dashboard layout and navigation scaffolding.' },
      { type: 'New', text: 'Marketing pages: home, about, contact, terms, privacy.' },
    ],
  },
];

const tagColor: Record<string, string> = {
  'Initial release': 'changelogTagInitial',
  'Release': 'changelogTagRelease',
  'Hotfix': 'changelogTagHotfix',
};

const itemBadge: Record<string, string> = {
  New: 'changelogBadgeNew',
  Improved: 'changelogBadgeImproved',
  Fixed: 'changelogBadgeFixed',
};

export default function ChangelogPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Updates</p>
          <h1 className={page.proseTitle}>Changelog</h1>
          <p className={page.proseSubtitle}>
            A running record of every notable update shipped to Scriverly. Most recent changes
            are listed first.
          </p>
        </header>

        <div className={page.changelogList}>
          {releases.map(release => (
            <article key={release.version} className={page.changelogEntry}>
              <div className={page.changelogMeta}>
                <span className={page[tagColor[release.tag] ?? 'changelogTagRelease']}>
                  {release.tag}
                </span>
                <span className={page.changelogVersion}>v{release.version}</span>
                <time className={page.changelogDate} dateTime={release.date}>
                  {release.date}
                </time>
              </div>

              <ul className={page.changelogItems}>
                {release.items.map((item, i) => (
                  <li key={i} className={page.changelogItem}>
                    <span className={page[itemBadge[item.type] ?? 'changelogBadgeNew']}>
                      {item.type}
                    </span>
                    <span className={page.changelogItemText}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
