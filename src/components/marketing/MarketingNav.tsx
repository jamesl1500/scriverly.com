'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/ui/Logo/Logo';
import styles from '@/styles/layouts/marketing-layout.module.scss';

export default function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <Logo size="sm" href="/" />

        <div className={styles.navLinks}>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
        </div>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLoginLink}>Log in</Link>
          <Link href="/signup" className={styles.navCta}>Get started</Link>
          <button
            type="button"
            className={styles.mobileMenuBtn}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/about" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contact</Link>
          <div className={styles.mobileDivider} />
          <Link href="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Log in</Link>
          <Link href="/signup" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Sign up free</Link>
        </div>
      )}
    </nav>
  );
}
