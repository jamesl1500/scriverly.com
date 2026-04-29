'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Calendar,
  FileText,
  Trash2,
  SquarePen,
} from 'lucide-react';
import type { AxiosError } from 'axios';

import type { EssayListItem } from '@/libs/validations/essay';
import { ESSAY_TYPE_LABELS } from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
import styles from '@/styles/components/EssayCard.module.scss';

interface EssayCardProps {
  essay: EssayListItem;
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDueDateMeta(dueDate: string | null): {
  label: string;
  className: string;
} | null {
  if (!dueDate) return null;

  const due  = new Date(dueDate);
  const now  = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);

  if (diff < 0)   return { label: 'Overdue',           className: styles.dueOverdue };
  if (diff === 0) return { label: 'Due today',          className: styles.dueSoon    };
  if (diff <= 3)  return { label: `Due in ${diff}d`,    className: styles.dueSoon    };
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    className: '',
  };
}

const STATUS_CLASS: Record<string, string> = {
  draft:       styles.statusDraft,
  in_progress: styles.statusInProgress,
  complete:    styles.statusComplete,
};

const STATUS_LABEL: Record<string, string> = {
  draft:       'Draft',
  in_progress: 'In Progress',
  complete:    'Complete',
};

export default function EssayCard({ essay }: EssayCardProps) {
  const router   = useRouter();
  const [deleting, setDeleting] = useState(false);

  const progress = essay.word_goal
    ? Math.min(100, Math.round((essay.word_count / essay.word_goal) * 100))
    : null;

  const dueMeta = getDueDateMeta(essay.due_date);
  const typeLabel = essay.essay_type ? ESSAY_TYPE_LABELS[essay.essay_type] : null;

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${essay.title}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/essays/${essay.id}`);
      router.refresh();
    } catch (err) {
      const msg = (err as AxiosError<{ error: string }>)?.response?.data?.error;
      alert(msg ?? 'Failed to delete essay.');
      setDeleting(false);
    }
  }

  return (
    <Link
      href={`/essays/${essay.id}`}
      className={styles.card}
      aria-label={`Open essay: ${essay.title}`}
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardBadges}>
          <span className={`${styles.badge} ${STATUS_CLASS[essay.status] ?? styles.statusDraft}`}>
            {STATUS_LABEL[essay.status] ?? essay.status}
          </span>
          {typeLabel && (
            <span className={`${styles.badge} ${styles.typeBadge}`}>
              {typeLabel}
            </span>
          )}
        </div>

        <div className={styles.cardMenu} onClick={e => e.preventDefault()}>
          <button
            type="button"
            className={styles.cardMenuBtn}
            aria-label="Edit essay"
            onClick={e => {
              e.preventDefault();
              router.push(`/essays/${essay.id}`);
            }}
          >
            <SquarePen size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.cardMenuBtn} ${styles.cardMenuBtnDestructive}`}
            aria-label="Delete essay"
            disabled={deleting}
            onClick={handleDelete}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Body */}
      <h3 className={styles.cardTitle}>{essay.title}</h3>
      {essay.subject && (
        <p className={styles.cardTopic}>{essay.subject}</p>
      )}

      {/* Word count progress */}
      <div className={styles.progressWrap}>
        <div className={styles.progressRow}>
          <span>
            <FileText size={11} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
            {essay.word_count.toLocaleString()} words
          </span>
          {essay.word_goal && (
            <span>Goal: {essay.word_goal.toLocaleString()}</span>
          )}
        </div>
        {progress !== null && (
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`${styles.progressFill} ${progress >= 100 ? styles.progressComplete : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaItem}>
            <Clock size={11} aria-hidden="true" />
            {formatRelativeDate(essay.updated_at)}
          </span>
          {dueMeta && (
            <span className={`${styles.cardMetaItem} ${dueMeta.className}`}>
              <Calendar size={11} aria-hidden="true" />
              {dueMeta.label}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
