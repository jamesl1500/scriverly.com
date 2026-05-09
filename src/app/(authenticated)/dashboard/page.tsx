import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText, Clock, Plus, BookOpen, TrendingUp, PenLine, Sparkles, LayoutList } from 'lucide-react';
import type { Metadata } from 'next';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { ESSAY_TYPE_LABELS } from '@/libs/validations/essay';
import styles from '@/styles/components/Dashboard.module.scss';

export const metadata: Metadata = {
  title: 'Dashboard — Scriverly',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatWordCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

/** Map DB status → card label and CSS variant */
function statusMeta(status: string): { label: string; isComplete: boolean } {
  switch (status) {
    case 'complete':    return { label: 'Complete',    isComplete: true  };
    case 'in_progress': return { label: 'In Progress', isComplete: false };
    case 'in_review':   return { label: 'In Review',   isComplete: false };
    case 'submitted':   return { label: 'Submitted',   isComplete: true  };
    case 'archived':    return { label: 'Archived',    isComplete: false };
    default:            return { label: 'Draft',       isComplete: false };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: essays } = await supabase
    .from('essays')
    .select('id, title, subject, summary, status, word_count, essay_type, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const all = essays ?? [];

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalWords   = all.reduce((sum, e) => sum + (e.word_count ?? 0), 0);
  const completeCount = all.filter(e => e.status === 'complete' || e.status === 'submitted').length;
  const activeCount   = all.filter(e => e.status === 'draft' || e.status === 'in_progress').length;

  const stats = [
    { label: 'Total essays',  value: String(all.length),            icon: FileText   },
    { label: 'Complete',      value: String(completeCount),          icon: BookOpen   },
    { label: 'In progress',   value: String(activeCount),            icon: Clock      },
    { label: 'Words written', value: formatWordCount(totalWords),    icon: TrendingUp },
  ];

  // ── Recent (up to 6) ─────────────────────────────────────────────────────
  const recent = all.slice(0, 6);

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeading}>Dashboard</h1>
          <p className={styles.pageSubheading}>Welcome back. Here&apos;s where your writing lives.</p>
        </div>
        <div className={styles.pageActions}>
          <Link href="/essays/new" className={styles.newEssayBtn}>
            <Plus size={15} aria-hidden="true" />
            New essay
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {stats.map(({ label, value }) => (
          <div key={label} className={styles.statCard}>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent essays */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent essays</h2>
        <Link href="/essays" className={styles.sectionLink}>
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <PenLine size={40} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h3 className={styles.emptyTitle}>Your writing journey starts here</h3>
          <p className={styles.emptyText}>
            Scriverly helps you plan, write, and refine essays with AI-powered analysis and smart outlines.
          </p>

          <div className={styles.emptySteps}>
            <div className={styles.emptyStep}>
              <span className={styles.emptyStepIcon}><FileText size={16} aria-hidden="true" /></span>
              <span className={styles.emptyStepLabel}>Create an essay</span>
            </div>
            <span className={styles.emptyStepDivider} aria-hidden="true" />
            <div className={styles.emptyStep}>
              <span className={styles.emptyStepIcon}><LayoutList size={16} aria-hidden="true" /></span>
              <span className={styles.emptyStepLabel}>Generate an outline</span>
            </div>
            <span className={styles.emptyStepDivider} aria-hidden="true" />
            <div className={styles.emptyStep}>
              <span className={styles.emptyStepIcon}><Sparkles size={16} aria-hidden="true" /></span>
              <span className={styles.emptyStepLabel}>Get AI analysis</span>
            </div>
          </div>

          <Link href="/essays/new" className={styles.newEssayBtn}>
            <Plus size={15} aria-hidden="true" />
            Write your first essay
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {recent.map((essay) => {
            const { label: statusLabel, isComplete } = statusMeta(essay.status);
            const tag = essay.essay_type
              ? (ESSAY_TYPE_LABELS[essay.essay_type] ?? essay.essay_type)
              : (essay.subject ?? null);

            return (
              <Link key={essay.id} href={`/essays/${essay.id}`} className={styles.card}>
                <div className={styles.cardTop}>
                  {tag && <span className={styles.cardTag}>{tag}</span>}
                  <span
                    className={[
                      styles.cardStatus,
                      isComplete ? styles.statusPublished : styles.statusDraft,
                    ].join(' ')}
                  >
                    {statusLabel}
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{essay.title}</h3>
                {essay.summary && (
                  <p className={styles.cardExcerpt}>{essay.summary}</p>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardMetaItem}>
                      <FileText size={11} aria-hidden="true" />
                      {formatWordCount(essay.word_count ?? 0)} words
                    </span>
                  </div>
                  <span className={styles.cardDate}>{formatDate(essay.updated_at)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
