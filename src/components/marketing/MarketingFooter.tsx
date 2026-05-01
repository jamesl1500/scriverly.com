import Link from 'next/link';
import Logo from '@/components/ui/Logo/Logo';
import styles from '@/styles/layouts/marketing-layout.module.scss';

export default function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Logo size="sm" href="/" />
            <p className={styles.footerTagline}>
              AI-powered academic writing assistant. Write better essays with real-time feedback, smart outlines, and style guidance.
            </p>
          </div>

          <div className={styles.footerCol}>
            <span className={styles.footerColLabel}>Product</span>
            <div className={styles.footerColLinks}>
              <Link href="/signup" className={styles.footerLink}>Get started</Link>
              <Link href="/login" className={styles.footerLink}>Log in</Link>
            </div>
          </div>

          <div className={styles.footerCol}>
            <span className={styles.footerColLabel}>Company</span>
            <div className={styles.footerColLinks}>
              <Link href="/about" className={styles.footerLink}>About</Link>
              <Link href="/contact" className={styles.footerLink}>Contact</Link>
            </div>
          </div>

          <div className={styles.footerCol}>
            <span className={styles.footerColLabel}>Legal</span>
            <div className={styles.footerColLinks}>
              <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
              <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>
            &copy; {year} Scriverly. All rights reserved. Created by <Link href="https://lattentechnologies.com" className={styles.footerLegalLink}>Latten Technologies</Link>.
          </span>
          <div className={styles.footerLegal}>
            <Link href="/terms" className={styles.footerLegalLink}>Terms</Link>
            <Link href="/privacy" className={styles.footerLegalLink}>Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
