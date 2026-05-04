import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import Logo from '@/components/ui/Logo/Logo';
import QueryProvider from '@/components/QueryProvider';
import AppNav from './_components/AppNav';
import styles from '@/styles/layouts/app-layout.module.scss';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('user_id', user.id)
    .single();

  const fullName = profile?.full_name ?? user.email ?? 'User';
  const avatarUrl = profile?.avatar_url ?? '';

  return (
    <QueryProvider>
    <div className={styles.shell}>
      <AppNav user={{ fullName, avatarUrl }} />

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            {/* Brand */}
            <div className={styles.footerBrand}>
              <Logo size="md" />
              <p className={styles.footerTagline}>
                Scriverly helps you write, refine, and publish essays that
                matter — from first draft to final word.
              </p>
            </div>

            {/* Product */}
            <div className={styles.footerCol}>
              <p className={styles.footerColHeading}>Product</p>
              <Link href="/dashboard" className={styles.footerColLink}>Dashboard</Link>
              <Link href="/essays" className={styles.footerColLink}>My essays</Link>
              <Link href="/essays/new" className={styles.footerColLink}>New essay</Link>
              <Link href="/profile" className={styles.footerColLink}>Profile</Link>
              <Link href="/settings" className={styles.footerColLink}>Settings</Link>
            </div>

            {/* Support */}
            <div className={styles.footerCol}>
              <p className={styles.footerColHeading}>Support</p>
              <Link href="/help" className={styles.footerColLink}>Help center</Link>
              <Link href="/feedback" className={styles.footerColLink}>Give feedback</Link>
              <Link href="/changelog" className={styles.footerColLink}>Changelog</Link>
              <Link href="/status" className={styles.footerColLink}>System status</Link>
            </div>

            {/* Company */}
            <div className={styles.footerCol}>
              <p className={styles.footerColHeading}>Company</p>
              <Link href="/about" className={styles.footerColLink}>About</Link>
              <Link href="/blog" className={styles.footerColLink}>Blog</Link>
              <a
                href="mailto:hello@scriverly.com"
                className={styles.footerColLink}
              >
                Contact
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={styles.footerBottom}>
            <p className={styles.footerCopy}>
              &copy; {new Date().getFullYear()} Scriverly, Inc. All rights reserved. Created by <Link href="https://lattentechnologies.com" className={styles.footerLegalLink}>Latten Technologies</Link>.
            </p>
            <div className={styles.footerLegal}>
              <Link href="/privacy" className={styles.footerLegalLink}>Privacy policy</Link>
              <Link href="/terms" className={styles.footerLegalLink}>Terms of service</Link>
              <Link href="/cookies" className={styles.footerLegalLink}>Cookie policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </QueryProvider>
  );
}
