'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, PenSquare } from 'lucide-react';

import type { EssayListItem, EssayStatus } from '@/libs/validations/essay';
import EssayCard from './EssayCard';
import styles from '@/styles/components/EssayList.module.scss';

interface EssayListClientProps {
  essays: EssayListItem[];
}

const FILTERS: { label: string; value: EssayStatus | 'all' }[] = [
  { label: 'All',         value: 'all'        },
  { label: 'Draft',       value: 'draft'       },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Complete',    value: 'complete'    },
];

export default function EssayListClient({ essays }: EssayListClientProps) {
  const [activeFilter, setActiveFilter] = useState<EssayStatus | 'all'>('all');

  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? essays
        : essays.filter(e => e.status === activeFilter),
    [essays, activeFilter],
  );

  const totalWords = useMemo(
    () => essays.reduce((sum, e) => sum + (e.word_count ?? 0), 0),
    [essays],
  );

  return (
    <>
      {/* Stats bar */}
      <div className={styles.statsBar}>
        <span className={styles.statChip}>
          <strong>{essays.length}</strong>{' '}
          {essays.length === 1 ? 'essay' : 'essays'}
        </span>
        <span className={styles.statChip}>
          <strong>{totalWords.toLocaleString()}</strong> total words
        </span>
        {essays.filter(e => e.status === 'draft').length > 0 && (
          <span className={styles.statChip}>
            <strong>{essays.filter(e => e.status === 'draft').length}</strong> drafts
          </span>
        )}
      </div>

      {/* Filter toolbar */}
      {essays.length > 0 && (
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {FILTERS.map(f => (
              <button
                key={f.value}
                type="button"
                className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveFilter(f.value)}
                aria-pressed={activeFilter === f.value}
              >
                {f.label}
                {f.value !== 'all' && (
                  <span style={{ fontSize: '0.6875rem', color: 'inherit', opacity: 0.7 }}>
                    {' '}({essays.filter(e => e.status === f.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
        <div className={styles.essayGrid}>
          {filtered.map(essay => (
            <EssayCard key={essay.id} essay={essay} />
          ))}
        </div>
      ) : essays.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <FileText size={24} />
          </div>
          <p className={styles.emptyTitle}>No essays yet</p>
          <p className={styles.emptyDesc}>
            Create your first essay and let Scriverly guide you through the process with AI-powered suggestions.
          </p>
          <Link href="/essays/new" style={{ textDecoration: 'none' }}>
            <span
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
                cursor: 'pointer',
              }}
            >
              <PenSquare size={15} aria-hidden="true" />
              Write your first essay
            </span>
          </Link>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <FileText size={24} />
          </div>
          <p className={styles.emptyTitle}>No {activeFilter.replace('_', ' ')} essays</p>
          <p className={styles.emptyDesc}>
            You don&apos;t have any essays with this status yet.
          </p>
          <button
            type="button"
            className={styles.filterBtn}
            onClick={() => setActiveFilter('all')}
          >
            Show all essays
          </button>
        </div>
      )}
    </>
  );
}
