import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import OnboardingForm from './_components/OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, avatar_url, bio, onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <OnboardingForm
      initialData={{
        fullName: profile?.full_name ?? '',
        username: profile?.username == null ? '' : profile.username,
        avatarUrl: profile?.avatar_url ?? '',
        bio: profile?.bio ?? '',
      }}
    />
  );
}

