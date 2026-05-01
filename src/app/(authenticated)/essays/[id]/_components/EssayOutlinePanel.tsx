'use client';

import { useCallback, useEffect, useState } from 'react';
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
  const [items,      setItems]      = useState<OutlineItem[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Group items by section ───────────────────────────────────────────────

  const grouped = SECTION_ORDER.reduce<Record<OutlineSection, OutlineItem[]>>(
    (acc, s) => {
      acc[s] = items.filter(i => i.section === s).sort((a, b) => a.position - b.position);
      return acc;
    },
    { introduction: [], body: [], conclusion: [] },
  );

  const hasOutline = items.length > 0;

  // ── Fetch existing outline on mount ─────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiClient
      .get<{ success: true; data: { items: OutlineItem[] } }>(`/essays/${essay.id}/outline`)
      .then(res => {
        if (!cancelled) setItems(res.data.data.items);
      })
      .catch(() => {
        // Non-critical — no outline yet
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [essay.id]);

  // ── Generate outline ─────────────────────────────────────────────────────

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await apiClient.post<{
        success: true;
        data: { items: OutlineItem[] };
      }>(`/essays/${essay.id}/outline`);
      setItems(res.data.data.items);
    } catch {
      setError('Failed to generate outline. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [essay.id]);

  // ── Toggle completion ────────────────────────────────────────────────────

  const handleToggle = useCallback(async (itemId: string, current: boolean) => {
    // Optimistic update
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, is_complete: !current } : i)),
    );
    try {
      await apiClient.patch(`/essays/${essay.id}/outline`, {
        itemId,
        is_complete: !current,
      });
    } catch {
      // Revert on failure
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, is_complete: current } : i)),
      );
    }
  }, [essay.id]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
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
              onClick={generate}
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

        {/* Loading */}
        {loading && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <p className={styles.errorMsg} role="alert">{error}</p>
        )}

        {/* Empty state — no outline yet */}
        {!loading && !hasOutline && !generating && (
          <div className={styles.emptyState}>
            <Sparkles size={20} className={styles.emptyIcon} aria-hidden="true" />
            <p className={styles.emptyTitle}>No outline yet</p>
            <p className={styles.emptyText}>
              Generate a structured outline based on your essay&apos;s title, subject, and type.
            </p>
            <button
              type="button"
              className={styles.generateBtn}
              onClick={generate}
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
        {!loading && !generating && hasOutline && (
          <div className={styles.sections}>
            {SECTION_ORDER.map(section => (
              <SectionBlock
                key={section}
                section={section}
                items={grouped[section]}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
