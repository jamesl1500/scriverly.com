import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import type { Metadata } from 'next';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import type { EssayListItem } from '@/libs/validations/essay';
import EssayListClient from './_components/EssayListClient';
import styles from '@/styles/components/EssayList.module.scss';

export const metadata: Metadata = {
  title: 'My Essays — Scriverly',
};

export default async function EssaysPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: essays, error } = await supabase
    .from('essays')
    .select(
      'id, title, subject, status, word_count, word_goal, due_date, essay_type, academic_level, citation_style, start_with_outline, updated_at, created_at',
    )
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch essays:', error.message);
  }

  const essayList = (essays ?? []) as EssayListItem[];

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeading}>My Essays</h1>
          <p className={styles.pageSubheading}>
            All your writing in one place.
          </p>
        </div>
        <Link
          href="/essays/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 1rem',
            background: '#C8854A',
            color: '#fff',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <PenSquare size={15} aria-hidden="true" />
          New essay
        </Link>
      </div>

      <EssayListClient essays={essayList} />
    </div>
  );
}
