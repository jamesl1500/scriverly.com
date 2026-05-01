'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ChevronDown,
  Menu,
  X,
  Plus,
  UserCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import Logo from '@/components/ui/Logo/Logo';
import styles from '@/styles/layouts/app-layout.module.scss';

interface NavUser {
  fullName: string;
  avatarUrl: string;
}

interface AppNavProps {
  user: NavUser;
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/essays', label: 'Essays', icon: FileText },
];

export default function AppNav({ user }: AppNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close mobile nav on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const initials = user.fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          {/* Left: Logo */}
          <div className={styles.navLeft}>
            <Logo size="md" />
          </div>

          {/* Center: Nav links */}
          <div className={styles.navLinks}>
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    styles.navLink,
                    isActive ? styles.navLinkActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right: New Essay + User */}
          <div className={styles.navRight}>
            <Link href="/essays/new" className={styles.newEssayBtn}>
              <Plus size={15} aria-hidden="true" />
              New essay
            </Link>

            {/* User dropdown */}
            <div
              className={[styles.userMenu, menuOpen ? styles.userMenuOpen : '']
                .filter(Boolean)
                .join(' ')}
              ref={menuRef}
            >
              <button
                type="button"
                className={styles.userButton}
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className={styles.userAvatar}
                  />
                ) : (
                  <span className={styles.userAvatarInitials} aria-hidden="true">
                    {initials}
                  </span>
                )}
                <span className={styles.userName}>{user.fullName}</span>
                <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
              </button>

              {menuOpen && (
                <div className={styles.dropdown} role="menu">
                  <Link
                    href="/profile"
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCircle size={15} aria-hidden="true" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings size={15} aria-hidden="true" />
                    Settings
                  </Link>
                  <div className={styles.dropdownDivider} role="separator" />
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className={[
                        styles.dropdownItem,
                        styles.dropdownItemDestructive,
                      ].join(' ')}
                      role="menuitem"
                    >
                      <LogOut size={15} aria-hidden="true" />
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className={styles.mobileMenuButton}
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <X size={18} aria-hidden="true" />
              ) : (
                <Menu size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className={styles.mobileNav} role="navigation" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={[
                  styles.mobileNavLink,
                  isActive ? styles.mobileNavLinkActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
          <Link href="/essays/new" className={styles.mobileNavLink}>
            <Plus size={16} aria-hidden="true" />
            New essay
          </Link>
        </div>
      )}
    </>
  );
}
