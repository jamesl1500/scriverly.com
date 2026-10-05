import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import styles from '@/styles/layouts/marketing-layout.module.scss';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you were looking for does not exist or has moved.',
  robots: { index: false, follow: true },
};

const suggestions = [
  { href: '/features', label: 'Features', desc: 'See what Scriverly does for your essays.' },
  { href: '/guides', label: 'Writing guides', desc: 'Practical guides to academic essay writing.' },
  { href: '/contact', label: 'Contact', desc: 'Tell us about a broken link.' },
];

export default function NotFound() {
  return (
    <div className={styles.shell}>
      <MarketingNav />

      <main className={styles.main}>
        <section className={page.notFound}>
          <div className={page.container}>
            <p className={page.notFoundCode}>404</p>
            <h1 className={page.notFoundTitle}>We couldn&apos;t find that page</h1>
            <p className={page.notFoundText}>
              The link may be out of date, or the address may have been mistyped.
            </p>
            <div className={page.notFoundActions}>
              <Link href="/" className={page.heroPrimary}>
                Back to home
              </Link>
              <Link href="/dashboard" className={page.heroSecondary}>
                Go to your dashboard
              </Link>
            </div>

            <ul className={page.notFoundLinks}>
              {suggestions.map(s => (
                <li key={s.href}>
                  <Link href={s.href} className={page.notFoundLink}>
                    <span className={page.notFoundLinkLabel}>{s.label}</span>
                    <span className={page.notFoundLinkDesc}>{s.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
