import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import ProfileForm from './_components/ProfileForm';
import type { ProfileFormValues } from '@/libs/validations/user';
import styles from '@/styles/components/Profile.module.scss';

export const metadata = { title: 'Profile — Scriverly' };

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, bio, institution, department, academic_level, role, created_at')
    .eq('user_id', user.id)
    .single();

  const initialValues: ProfileFormValues = {
    full_name: profile?.full_name ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
    institution: profile?.institution ?? '',
    department: profile?.department ?? '',
    academic_level: profile?.academic_level ?? undefined,
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageHeading}>Profile</h1>
        <p className={styles.pageSubheading}>
          Manage your public profile and academic information.
        </p>
      </header>

      <ProfileForm
        initialValues={initialValues}
        email={user.email ?? ''}
        role={profile?.role ?? 'student'}
        createdAt={profile?.created_at ?? user.created_at ?? new Date().toISOString()}
      />
    </div>
  );
}
