import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import SettingsContent from './_components/SettingsContent';
import type { SettingsFormValues } from '@/libs/validations/user';
import styles from '@/styles/components/Settings.module.scss';

export const metadata = { title: 'Settings — Scriverly' };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_citation_style, default_essay_type')
    .eq('user_id', user.id)
    .single();

  const initialValues: SettingsFormValues = {
    default_citation_style: profile?.default_citation_style ?? 'APA',
    default_essay_type: profile?.default_essay_type ?? 'argumentative',
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageHeading}>Settings</h1>
        <p className={styles.pageSubheading}>
          Manage your writing preferences, account, and security.
        </p>
      </header>

      <SettingsContent
        email={user.email ?? ''}
        emailVerified={!!user.email_confirmed_at}
        initialValues={initialValues}
      />
    </div>
  );
}
