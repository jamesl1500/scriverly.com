'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';

import type { Essay } from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
import UpgradeModal from '@/components/UpgradeModal';
import styles from '@/styles/components/EssayOutlinePanel.module.scss';

// ── Types ──────────────────────────────────────────────────────────────────────

type OutlineSection = 'introduction' | 'body' | 'conclusion';

interface OutlineItem {
  id:            string;
  essay_id:      string;
  section:       OutlineSection;
  position:      number;
  heading:       string;
  talking_point: string | null;
  is_complete:   boolean;
  created_at:    string;
}

interface EssayOutlinePanelProps {
  essay:   Essay;
  onClose: () => void;
}

const SECTION_LABELS: Record<OutlineSection, string> = {
  introduction: 'Introduction',
  body:         'Body',
  conclusion:   'Conclusion',
};

const SECTION_ORDER: OutlineSection[] = ['introduction', 'body', 'conclusion'];

// ── Collapsible section ────────────────────────────────────────────────────────

function SectionBlock({
  section,
  items,
  onToggle,
}: {
  section:  OutlineSection;
  items:    OutlineItem[];
  onToggle: (itemId: string, current: boolean) => void;
}) {
  const [open, setOpen] = useState(true);
  const completed = items.filter(i => i.is_complete).length;

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionToggle}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.sectionLabel}>{SECTION_LABELS[section]}</span>
        <span className={styles.sectionCount}>{completed}/{items.length}</span>
        {open
          ? <ChevronUp size={12} aria-hidden="true" />
          : <ChevronDown size={12} aria-hidden="true" />
        }
      </button>

      {open && (
        <ol className={styles.itemList}>
          {items.map(item => (
            <li key={item.id} className={`${styles.item} ${item.is_complete ? styles.itemDone : ''}`}>
              <button
                type="button"
                className={styles.checkBtn}
                onClick={() => onToggle(item.id, item.is_complete)}
                aria-label={item.is_complete ? 'Mark incomplete' : 'Mark complete'}
                aria-pressed={item.is_complete}
              >
                {item.is_complete
                  ? <CheckCircle2 size={15} aria-hidden="true" className={styles.checkIconDone} />
                  : <Circle size={15} aria-hidden="true" className={styles.checkIcon} />
                }
              </button>
              <div className={styles.itemBody}>
                <p className={styles.itemHeading}>{item.heading}</p>
                {item.talking_point && (
                  <p className={styles.itemTalkingPoint}>{item.talking_point}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function EssayOutlinePanel({ essay, onClose }: EssayOutlinePanelProps) {
  const qc = useQueryClient();
  const queryKey = ['outline', essay.id];
  const [upgradeModal, setUpgradeModal] = useState<{ used: number; limit: number } | null>(null);

  // ── Fetch — cached, won't re-request while data is fresh ────────────────

  const { data: items = [], isLoading, error: fetchError } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await apiClient.get<{ success: true; data: { items: OutlineItem[] } }>(
        `/essays/${essay.id}/outline`,
      );
      return res.data.data.items;
    },
    staleTime: 5 * 60 * 1000, // 5 min — panel open/close won't re-fetch
  });

  // ── Generate / Regenerate ────────────────────────────────────────────────

  const [generateError, setGenerateError] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ success: true; data: { items: OutlineItem[] } }>(
        `/essays/${essay.id}/outline`,
      );
      return res.data.data.items;
    },
    onSuccess: (newItems) => {
      qc.setQueryData(queryKey, newItems);
      setGenerateError(null);
    },
    onError: (err) => {
      const axiosErr = err as import('axios').AxiosError<{ error: string; code?: string; used?: number; limit?: number }>;
      if (axiosErr?.response?.status === 402 && axiosErr.response.data.code === 'quota_exceeded') {
        setUpgradeModal({
          used:  axiosErr.response.data.used  ?? 3,
          limit: axiosErr.response.data.limit ?? 3,
        });
        return;
      }
      setGenerateError('Failed to generate outline. Please try again.');
    },
  });

  // ── Toggle completion (optimistic) ──────────────────────────────────────

  const toggleMutation = useMutation({
    mutationFn: async ({ itemId, is_complete }: { itemId: string; is_complete: boolean }) => {
      await apiClient.patch(`/essays/${essay.id}/outline`, { itemId, is_complete });
    },
    onMutate: async ({ itemId, is_complete }) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<OutlineItem[]>(queryKey);
      qc.setQueryData<OutlineItem[]>(queryKey, (old = []) =>
        old.map(i => (i.id === itemId ? { ...i, is_complete } : i)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKey, context.previous);
    },
  });

  // ── Derived ──────────────────────────────────────────────────────────────

  const hasOutline = items.length > 0;
  const generating = generateMutation.isPending;

  const grouped = (['introduction', 'body', 'conclusion'] as OutlineSection[]).reduce<
    Record<OutlineSection, OutlineItem[]>
  >(
    (acc, s) => {
      acc[s] = items.filter(i => i.section === s).sort((a, b) => a.position - b.position);
      return acc;
    },
    { introduction: [], body: [], conclusion: [] },
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {upgradeModal && (
        <UpgradeModal
          feature="outline"
          used={upgradeModal.used}
          limit={upgradeModal.limit}
          onClose={() => setUpgradeModal(null)}
        />
      )}
      <aside className={styles.panel} aria-label="Essay outline">

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <BookOpen size={14} aria-hidden="true" className={styles.headerIcon} />
          <h2 className={styles.headerTitle}>Outline</h2>
        </div>
        <div className={styles.headerActions}>
          {hasOutline && (
            <button
              type="button"
              className={styles.regenBtn}
              onClick={() => generateMutation.mutate()}
              disabled={generating}
              aria-label="Regenerate outline"
              title="Regenerate outline"
            >
              <RefreshCw size={12} aria-hidden="true" className={generating ? styles.spinning : ''} />
            </button>
          )}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close outline"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>

        {/* Loading (first fetch only) */}
        {isLoading && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading…</p>
          </div>
        )}

        {/* Fetch error */}
        {!isLoading && fetchError && (
          <p className={styles.errorMsg} role="alert">Failed to load outline.</p>
        )}

        {/* Generate error */}
        {!isLoading && generateError && (
          <p className={styles.errorMsg} role="alert">{generateError}</p>
        )}

        {/* Empty state — no outline yet */}
        {!isLoading && !hasOutline && !generating && (
          <div className={styles.emptyState}>
            <Sparkles size={20} className={styles.emptyIcon} aria-hidden="true" />
            <p className={styles.emptyTitle}>No outline yet</p>
            <p className={styles.emptyText}>
              Generate a structured outline based on your essay&apos;s title, subject, and type.
            </p>
            <button
              type="button"
              className={styles.generateBtn}
              onClick={() => generateMutation.mutate()}
              disabled={generating}
            >
              <Sparkles size={12} aria-hidden="true" />
              Generate Outline
            </button>
          </div>
        )}

        {/* Generating skeleton */}
        {generating && (
          <div className={styles.generatingState}>
            <div className={styles.generatingSkeleton} />
            <div className={styles.generatingSkeleton} style={{ width: '80%' }} />
            <div className={styles.generatingSkeleton} style={{ width: '90%' }} />
            <div className={styles.generatingSkeleton} style={{ width: '70%', marginTop: '0.75rem' }} />
            <div className={styles.generatingSkeleton} style={{ width: '85%' }} />
            <div className={styles.generatingSkeleton} style={{ width: '75%' }} />
          </div>
        )}

        {/* Outline sections */}
        {!isLoading && !generating && hasOutline && (
          <div className={styles.sections}>
            {SECTION_ORDER.map(section => (
              <SectionBlock
                key={section}
                section={section}
                items={grouped[section]}
                onToggle={(itemId, current) =>
                  toggleMutation.mutate({ itemId, is_complete: !current })
                }
              />
            ))}
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
