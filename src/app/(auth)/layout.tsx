import type { ReactNode } from 'react';
import styles from '@/styles/layouts/auth-layout.module.scss';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
