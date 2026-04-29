import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import EssayCreationWizard from './_components/EssayCreationWizard';

export const metadata: Metadata = {
  title: 'New Essay — Scriverly',
};

export default async function NewEssayPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <EssayCreationWizard />;
}
