import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import Logo from '@/components/ui/Logo/Logo';
import styles from '@/styles/layouts/onboarding-layout.module.scss';

export default async function OnboardingLayout({
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
    .select('full_name')
    .eq('id', user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? 'User';

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Logo size="md" />
        <span className={styles.userName}>{displayName}</span>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Scriverly. All rights reserved.</p>
      </footer>
    </div>
  );
}
