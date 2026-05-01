import type { ReactNode } from 'react';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import styles from '@/styles/layouts/marketing-layout.module.scss';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <MarketingNav />
      <main className={styles.main}>{children}</main>
      <MarketingFooter />
    </div>
  );
}
