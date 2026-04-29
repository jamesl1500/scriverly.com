import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import type { Essay } from '@/libs/validations/essay';
import EssayEditor from './_components/EssayEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id }  = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { title: 'Essay — Scriverly' };
  }

  const { data: essay } = await supabase
    .from('essays')
    .select('title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  return {
    title: essay?.title ? `${essay.title} — Scriverly` : 'Essay — Scriverly',
  };
}

export default async function EssayEditorPage({ params }: PageProps) {
  const { id }  = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: essay, error } = await supabase
    .from('essays')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !essay) {
    notFound();
  }

  return <EssayEditor essay={essay as Essay} />;
}
