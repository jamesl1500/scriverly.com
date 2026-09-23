import type { ReactNode } from 'react';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import marketingStyles from '@/styles/layouts/marketing-layout.module.scss';
import styles from '@/styles/layouts/auth-layout.module.scss';

// Title/description for each auth route are defined in their own layout.tsx
// and composed with the root layout's title template (`%s — Scriverly`).

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={marketingStyles.shell}>
      <MarketingNav />
      <main className={styles.page}>{children}</main>
      <MarketingFooter />
    </div>
  );
}
