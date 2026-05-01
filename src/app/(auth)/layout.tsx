import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import marketingStyles from '@/styles/layouts/marketing-layout.module.scss';
import styles from '@/styles/layouts/auth-layout.module.scss';

export const metadata: Metadata = {
  title: {
    default: 'Scriverly',
    template: '%s - Scriverly',
  },
  description: 'Sign in or create your Scriverly account to start writing better essays.',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={marketingStyles.shell}>
      <MarketingNav />
      <main className={styles.page}>{children}</main>
      <MarketingFooter />
    </div>
  );
}
