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
              <Link href="/features/essay-feedback" className={styles.footerLink}>Essay feedback</Link>
              <Link href="/features/essay-outline-generator" className={styles.footerLink}>Outline generator</Link>
              <Link href="/features/grammar-and-style-checker" className={styles.footerLink}>Grammar and style</Link>
              <Link href="/guides" className={styles.footerLink}>Writing guides</Link>
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
            <span className={styles.footerColLabel}>Support</span>
            <div className={styles.footerColLinks}>
              <Link href="/help-center" className={styles.footerLink}>Help center</Link>
              <Link href="/feedback" className={styles.footerLink}>Give feedback</Link>
              <Link href="/changelog" className={styles.footerLink}>Changelog</Link>
              <Link href="/status" className={styles.footerLink}>System status</Link>
            </div>
          </div>

          <div className={styles.footerCol}>
            <span className={styles.footerColLabel}>Legal</span>
            <div className={styles.footerColLinks}>
              <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
              <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
              <Link href="/cookies" className={styles.footerLink}>Cookie Policy</Link>
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
            <Link href="/cookies" className={styles.footerLegalLink}>Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
