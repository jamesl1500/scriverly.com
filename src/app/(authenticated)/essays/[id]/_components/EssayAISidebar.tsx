'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Check,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { parsePartialJson } from 'ai';

import type { Essay } from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
import UpgradeModal from '@/components/UpgradeModal';
import styles from '@/styles/components/EssayAISidebar.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScoreBreakdown {
  clarity:         number;
  structure:       number;
  style_alignment: number;
  grammar:         number;
  vocabulary:      number;
}

interface StyleRecommendation {
  type:       string;
  severity:   'high' | 'medium' | 'low';
  message:    string;
  suggestion: string;
  original?:  string;
  example?:   string;
}

interface SpellingGrammarIssue {
  original:   string;
  suggestion: string;
  reason:     string;
}

interface AnalysisResult {
  id:                    string;
  score:                 number;
  score_breakdown:       ScoreBreakdown;
  style_recommendations: StyleRecommendation[];
  spelling_grammar:      SpellingGrammarIssue[];
  overall_feedback:      string;
  content_hash:          string;
  updated_at:            string;
}

interface EssayAISidebarProps {
  essay:                Essay;
  editor:               Editor | null;
  onClose:              () => void;
  /** Incremented by EssayEditor after the user stops typing (debounced 5 s). */
  autoAnalyzeTrigger?:  number;
}

type AnalysisFields = Omit<AnalysisResult, 'id' | 'content_hash' | 'updated_at'>;
type PartialAnalysis = Partial<AnalysisFields>;

class AnalyzeRequestError extends Error {
  status: number;
  code?:  string;
  used?:  number;
  limit?: number;

  constructor(message: string, status: number, extra?: { code?: string; used?: number; limit?: number }) {
    super(message);
    this.status = status;
    this.code   = extra?.code;
    this.used   = extra?.used;
    this.limit  = extra?.limit;
  }
}

// ── Stream the POST /analyze response, reporting partial progress ─────────────
//
// The route streams raw JSON text as the model generates it. A cache hit (or
// an error) instead comes back as a normal application/json response, so the
// content-type distinguishes the two cases.

async function streamAnalysis(
  essayId:   string,
  force:     boolean,
  onPartial: (partial: PartialAnalysis) => void,
  signal:    AbortSignal,
): Promise<{ cached: true; analysis: AnalysisResult } | { cached: false; fields: AnalysisFields }> {
  const res = await fetch(`/api/essays/${essayId}/analyze`, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',
    body:        JSON.stringify({ force }),
    signal,
  });

  const isJson = (res.headers.get('content-type') ?? '').includes('application/json');

  if (!res.ok || isJson) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new AnalyzeRequestError(
        data.error ?? 'Analysis failed. Please try again.',
        res.status,
        { code: data.code, used: data.used, limit: data.limit },
      );
    }
    // 200 + JSON = cache hit, returned as { success, data: { analysis, cached } }
    return { cached: true, analysis: data.data.analysis as AnalysisResult };
  }

  const reader = res.body?.getReader();
  if (!reader) throw new AnalyzeRequestError('Streaming is not supported in this browser.', 500);

  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { value: partial } = await parsePartialJson(buffer);
    if (signal.aborted) break;
    if (partial && typeof partial === 'object') onPartial(partial as PartialAnalysis);
  }

  return { cached: false, fields: JSON.parse(buffer) as AnalysisFields };
}

// ── Apply grammar fix via ProseMirror find-and-replace ────────────────────────
//
// Searches each textblock's full plain text (concatenated across its inline
// children) rather than one text node at a time, so a match spanning a mark
// boundary — e.g. "quick" in "The **quick** brown fox" — is still found.

function applyGrammarFix(
  editor: Editor,
  original: string,
  replacement: string,
): boolean {
  const { state, dispatch } = editor.view;
  const { doc, tr, schema } = state;
  let applied = false;

  doc.descendants((node, pos) => {
    if (applied) return false;
    if (!node.isTextblock) return true; // keep descending until a textblock

    let blockText = '';
    const segments: { start: number; text: string }[] = [];
    node.forEach((child, offset) => {
      if (child.isText && child.text) {
        segments.push({ start: pos + 1 + offset, text: child.text });
        blockText += child.text;
      }
    });

    const idx = blockText.indexOf(original);
    if (idx === -1) return false; // no match here — don't descend further

    let remaining = idx;
    let start = -1;
    for (const seg of segments) {
      if (remaining < seg.text.length) {
        start = seg.start + remaining;
        break;
      }
      remaining -= seg.text.length;
    }
    if (start === -1) return false;

    const end = start + original.length;
    dispatch(tr.replaceWith(start, end, schema.text(replacement)));
    applied = true;
    return false;
  });

  return applied;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 85) return '#3A9A6B'; // success green
  if (score >= 70) return '#C8854A'; // accent orange
  if (score >= 50) return '#D48B27'; // warning
  return '#D44949';                  // error red
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Work';
  return 'Needs Significant Work';
}

function severityClass(severity: string): string {
  switch (severity) {
    case 'high':   return styles.severityHigh;
    case 'medium': return styles.severityMedium;
    default:       return styles.severityLow;
  }
}

// ── Score Ring (SVG) ──────────────────────────────────────────────────────────

const RADIUS      = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  const progress = (score / 100) * CIRCUMFERENCE;
  const color    = scoreColor(score);

  return (
    <svg
      viewBox="0 0 100 100"
      className={styles.scoreRing}
      aria-label={`Essay score: ${score} out of 100`}
      role="img"
    >
      {/* Track */}
      <circle
        cx="50" cy="50" r={RADIUS}
        fill="none"
        stroke="#E4DDD2"
        strokeWidth="8"
      />
      {/* Progress */}
      <circle
        cx="50" cy="50" r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${CIRCUMFERENCE - progress}`}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Score text */}
      <text
        x="50" y="46"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="22"
        fontWeight="700"
        fontFamily="inherit"
      >
        {score}
      </text>
      <text
        x="50" y="63"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#9C9087"
        fontSize="8"
        fontWeight="500"
        fontFamily="inherit"
        letterSpacing="0.5"
      >
        / 100
      </text>
    </svg>
  );
}

// ── Breakdown Bar ─────────────────────────────────────────────────────────────

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div className={styles.breakdownItem}>
      <div className={styles.breakdownLabel}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className={styles.breakdownTrack}>
        <div
          className={styles.breakdownFill}
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title:        string;
  count:        number;
  children:     React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.sectionToggle}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionCount}>{count}</span>
        {open
          ? <ChevronUp size={13} aria-hidden="true" />
          : <ChevronDown size={13} aria-hidden="true" />
        }
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EssayAISidebar({ essay, editor, onClose, autoAnalyzeTrigger = 0 }: EssayAISidebarProps) {
  const queryClient = useQueryClient();

  // ── Local UI state only ────────────────────────────────────────────────────
  const [appliedGrammar, setAppliedGrammar] = useState<Set<number>>(new Set());
  const [appliedStyle,   setAppliedStyle]   = useState<Set<number>>(new Set());
  const [upgradeModal,   setUpgradeModal]   = useState<{ used: number; limit: number } | null>(null);
  const [streaming,      setStreaming]      = useState<PartialAnalysis | null>(null);
  const isFirstMount = useRef(true);

  // ── Apply handlers ─────────────────────────────────────────────────────────

  const handleApplyGrammar = useCallback((index: number, original: string, suggestion: string) => {
    if (!editor) return;
    const ok = applyGrammarFix(editor, original, suggestion);
    if (ok) {
      setAppliedGrammar(prev => new Set(prev).add(index));
    }
  }, [editor]);

  const handleApplyStyle = useCallback((index: number, original: string, example: string) => {
    if (!editor) return;
    const ok = applyGrammarFix(editor, original, example);
    if (ok) {
      setAppliedStyle(prev => new Set(prev).add(index));
    }
  }, [editor]);

  // ── Fetch cached analysis (GET) ────────────────────────────────────────────

  const analysisQueryKey = ['essay-analysis', essay.id];

  const { data: analysis, isLoading: loadingCached, refetch: refetchAnalysis } = useQuery({
    queryKey: analysisQueryKey,
    queryFn: async () => {
      const res = await apiClient.get<{
        success: true;
        data: { analysis: AnalysisResult | null };
      }>(`/essays/${essay.id}/analyze`);
      return res.data.data.analysis ?? null;
    },
    retry: false,
    refetchOnWindowFocus: false,
    // Silently treat a fetch error as "no cached analysis"
    throwOnError: false,
  });

  // ── Run / re-run analysis (POST, streamed) ─────────────────────────────────

  // A newer run supersedes the in-flight one: aborting it stops the server-side
  // generation instead of paying for an analysis nobody will see.
  const analyzeAbort = useRef<AbortController | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: (force: boolean) => {
      analyzeAbort.current?.abort();
      const controller = new AbortController();
      analyzeAbort.current = controller;
      return streamAnalysis(essay.id, force, setStreaming, controller.signal);
    },
    onMutate: () => {
      setStreaming(null);
    },
    onSuccess: (outcome) => {
      if (outcome.cached) {
        queryClient.setQueryData(analysisQueryKey, outcome.analysis);
        return;
      }
      // Render the freshly-streamed result immediately with placeholder
      // metadata, then reconcile with the persisted row (id/content_hash)
      // once the server's onFinish upsert has had time to land.
      const existing = queryClient.getQueryData<AnalysisResult | null>(analysisQueryKey);
      queryClient.setQueryData<AnalysisResult>(analysisQueryKey, {
        id:           existing?.id ?? 'pending',
        content_hash: existing?.content_hash ?? '',
        updated_at:   new Date().toISOString(),
        ...outcome.fields,
      });
      setTimeout(() => { void refetchAnalysis(); }, 1500);
    },
    onSettled: () => {
      setStreaming(null);
    },
    onError: (err) => {
      const analyzeErr = err instanceof AnalyzeRequestError ? err : null;
      if (analyzeErr?.status === 402 && analyzeErr.code === 'quota_exceeded') {
        setUpgradeModal({
          used:  analyzeErr.used  ?? 5,
          limit: analyzeErr.limit ?? 5,
        });
      }
    },
  });

  // ── Auto-analyze trigger from editor (debounced) ───────────────────────────

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (autoAnalyzeTrigger === 0) return;
    analyzeMutation.mutate(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyzeTrigger]);

  // ── Derived state ──────────────────────────────────────────────────────────

  // While streaming, show a live preview (score ring + breakdown + feedback)
  // as soon as the model has produced a score — the full result (with
  // recommendations) still renders from `analysis` once the mutation settles.
  const streamingPreview = analyzeMutation.isPending && streaming?.score !== undefined
    ? streaming
    : null;

  const loading = loadingCached || (analyzeMutation.isPending && !streamingPreview);

  const analyzeErr = analyzeMutation.error instanceof AnalyzeRequestError ? analyzeMutation.error : null;
  // Don't surface quota errors here — they're handled by the upgrade modal
  const displayError = analyzeErr && analyzeErr.status !== 402
    ? analyzeErr.message
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  const breakdown = analysis?.score_breakdown;
  const breakdownEntries: [string, number][] = breakdown
    ? [
        ['Clarity',         breakdown.clarity         ?? 0],
        ['Structure',       breakdown.structure        ?? 0],
        ['Style Alignment', breakdown.style_alignment  ?? 0],
        ['Grammar',         breakdown.grammar          ?? 0],
        ['Vocabulary',      breakdown.vocabulary       ?? 0],
      ]
    : [];

  const streamingBreakdown = streamingPreview?.score_breakdown;
  const streamingBreakdownEntries: [string, number][] = streamingBreakdown
    ? [
        ['Clarity',         streamingBreakdown.clarity         ?? 0],
        ['Structure',       streamingBreakdown.structure       ?? 0],
        ['Style Alignment', streamingBreakdown.style_alignment ?? 0],
        ['Grammar',         streamingBreakdown.grammar         ?? 0],
        ['Vocabulary',      streamingBreakdown.vocabulary      ?? 0],
      ]
    : [];

  const highRecs = analysis?.style_recommendations.filter(r => r.severity === 'high')   ?? [];
  const otherRecs = analysis?.style_recommendations.filter(r => r.severity !== 'high') ?? [];

  return (
    <>
      {upgradeModal && (
        <UpgradeModal
          feature="analysis"
          used={upgradeModal.used}
          limit={upgradeModal.limit}
          onClose={() => setUpgradeModal(null)}
        />
      )}
      <aside className={styles.sidebar} aria-label="Analysis">

      {/* ─── Header ────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Sparkles size={14} aria-hidden="true" className={styles.headerIcon} />
          <span>Analysis</span>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close Analysis sidebar"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </header>

      {/* ─── Content ───────────────────────────────────────────── */}
      <div className={styles.content}>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} aria-hidden="true" />
            <p>{analysis ? 'Re-analyzing…' : 'Analyzing your essay…'}</p>
          </div>
        )}

        {/* Streaming preview — score/breakdown/feedback fill in as they arrive */}
        {streamingPreview && (
          <>
            <div className={styles.scoreSection}>
              <ScoreRing score={streamingPreview.score ?? 0} />
              <div className={styles.scoreMeta}>
                <p className={styles.scoreGrade} style={{ color: scoreColor(streamingPreview.score ?? 0) }}>
                  Analyzing…
                </p>
              </div>
            </div>
            {streamingBreakdownEntries.length > 0 && (
              <div className={styles.breakdownSection}>
                {streamingBreakdownEntries.map(([label, value]) => (
                  <BreakdownBar key={label} label={label} value={value} />
                ))}
              </div>
            )}
            {streamingPreview.overall_feedback && (
              <div className={styles.feedbackSection}>
                <h3 className={styles.feedbackTitle}>Overall Feedback</h3>
                <p className={styles.feedbackText}>{streamingPreview.overall_feedback}</p>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {!loading && displayError && (
          <div className={styles.errorState} role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <p>{displayError}</p>
            <button
              type="button"
              className={styles.analyzeBtn}
              onClick={() => analyzeMutation.mutate(false)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !displayError && !analysis && !streamingPreview && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <Sparkles size={28} />
            </div>
            <p className={styles.emptyTitle}>Analyze your essay</p>
            <p className={styles.emptyDesc}>
              Get an overall score, style recommendations aligned with your{' '}
              {essay.essay_type ?? 'essay'} type, spelling &amp; grammar
              suggestions, and actionable feedback.
            </p>
            <button
              type="button"
              className={styles.analyzeBtn}
              onClick={() => analyzeMutation.mutate(false)}
            >
              <Sparkles size={13} aria-hidden="true" />
              Analyze Essay
            </button>
          </div>
        )}

        {/* Analysis results */}
        {!loading && !displayError && analysis && !streamingPreview && (
          <>
            {/* ── Score ──────────────────────────────────────────── */}
            <div className={styles.scoreSection}>
              <ScoreRing score={analysis.score} />
              <div className={styles.scoreMeta}>
                <p className={styles.scoreGrade} style={{ color: scoreColor(analysis.score) }}>
                  {scoreLabel(analysis.score)}
                </p>
                <p className={styles.scoreDate}>
                  Last analyzed{' '}
                  {new Date(analysis.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* ── Breakdown bars ─────────────────────────────────── */}
            <div className={styles.breakdownSection}>
              {breakdownEntries.map(([label, value]) => (
                <BreakdownBar key={label} label={label} value={value} />
              ))}
            </div>

            {/* ── Re-analyze ─────────────────────────────────────── */}
            <button
              type="button"
              className={styles.reanalyzeBtn}
              onClick={() => analyzeMutation.mutate(true)}
              disabled={loading}
            >
              <RefreshCw size={12} aria-hidden="true" />
              Re-analyze
            </button>

            {/* ── Overall Feedback ───────────────────────────────── */}
            {analysis.overall_feedback && (
              <div className={styles.feedbackSection}>
                <h3 className={styles.feedbackTitle}>Overall Feedback</h3>
                <p className={styles.feedbackText}>{analysis.overall_feedback}</p>
              </div>
            )}

            {/* ── Style Recommendations ──────────────────────────── */}
            {analysis.style_recommendations.length > 0 && (
              <CollapsibleSection
                title="Style Recommendations"
                count={analysis.style_recommendations.length}
                defaultOpen={true}
              >
                {highRecs.length > 0 && (
                  <div className={styles.recGroup}>
                    {highRecs.map((rec, i) => {
                      const globalIdx = i;
                      const applied   = appliedStyle.has(globalIdx);
                      const canApply  = !!(editor && rec.original && rec.example);
                      return (
                        <div key={i} className={`${styles.recCard} ${applied ? styles.recCardApplied : ''}`}>
                          <div className={styles.recHeader}>
                            <span className={`${styles.severityBadge} ${severityClass(rec.severity)}`}>
                              {rec.severity}
                            </span>
                            <span className={styles.recType}>{rec.type}</span>
                          </div>
                          <p className={styles.recMessage}>{rec.message}</p>
                          <p className={styles.recStrategy}>{rec.suggestion}</p>
                          {rec.original && rec.example && (
                            <div className={styles.recExample}>
                              <div className={styles.recExampleBefore}>
                                <span className={styles.recExampleLabel}>Before</span>
                                <p>{rec.original}</p>
                              </div>
                              <div className={styles.recExampleAfter}>
                                <span className={styles.recExampleLabel}>After</span>
                                <p>{rec.example}</p>
                              </div>
                            </div>
                          )}
                          {canApply && (
                            <button
                              type="button"
                              className={`${styles.implementBtn} ${applied ? styles.implementBtnDone : styles.implementBtnApply}`}
                              onClick={() => handleApplyStyle(globalIdx, rec.original!, rec.example!)}
                              disabled={applied}
                              aria-label={applied ? 'Change applied' : 'Apply this rewrite in the editor'}
                            >
                              <Check size={11} aria-hidden="true" />
                              {applied ? 'Applied' : 'Apply rewrite'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {otherRecs.length > 0 && (
                  <div className={styles.recGroup}>
                    {otherRecs.map((rec, i) => {
                      const globalIdx = highRecs.length + i;
                      const applied   = appliedStyle.has(globalIdx);
                      const canApply  = !!(editor && rec.original && rec.example);
                      return (
                        <div key={i} className={`${styles.recCard} ${applied ? styles.recCardApplied : ''}`}>
                          <div className={styles.recHeader}>
                            <span className={`${styles.severityBadge} ${severityClass(rec.severity)}`}>
                              {rec.severity}
                            </span>
                            <span className={styles.recType}>{rec.type}</span>
                          </div>
                          <p className={styles.recMessage}>{rec.message}</p>
                          <p className={styles.recStrategy}>{rec.suggestion}</p>
                          {rec.original && rec.example && (
                            <div className={styles.recExample}>
                              <div className={styles.recExampleBefore}>
                                <span className={styles.recExampleLabel}>Before</span>
                                <p>{rec.original}</p>
                              </div>
                              <div className={styles.recExampleAfter}>
                                <span className={styles.recExampleLabel}>After</span>
                                <p>{rec.example}</p>
                              </div>
                            </div>
                          )}
                          {canApply && (
                            <button
                              type="button"
                              className={`${styles.implementBtn} ${applied ? styles.implementBtnDone : styles.implementBtnApply}`}
                              onClick={() => handleApplyStyle(globalIdx, rec.original!, rec.example!)}
                              disabled={applied}
                              aria-label={applied ? 'Change applied' : 'Apply this rewrite in the editor'}
                            >
                              <Check size={11} aria-hidden="true" />
                              {applied ? 'Applied' : 'Apply rewrite'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CollapsibleSection>
            )}

            {/* ── Spelling & Grammar ─────────────────────────────── */}
            {analysis.spelling_grammar.length > 0 ? (
              <CollapsibleSection
                title="Spelling & Grammar"
                count={analysis.spelling_grammar.length}
                defaultOpen={true}
              >
                {analysis.spelling_grammar.map((issue, i) => {
                  const applied = appliedGrammar.has(i);
                  return (
                    <div key={i} className={`${styles.grammarCard} ${applied ? styles.grammarCardApplied : ''}`}>
                      <div className={styles.grammarDiff}>
                        <span className={styles.grammarOriginal}>{issue.original}</span>
                        <ArrowRight size={11} aria-hidden="true" className={styles.grammarArrow} />
                        <span className={styles.grammarSuggestion}>{issue.suggestion}</span>
                      </div>
                      <p className={styles.grammarReason}>{issue.reason}</p>
                      <button
                        type="button"
                        className={`${styles.implementBtn} ${applied ? styles.implementBtnDone : styles.implementBtnApply}`}
                        onClick={() => handleApplyGrammar(i, issue.original, issue.suggestion)}
                        disabled={applied || !editor}
                        aria-label={applied ? 'Fix applied' : 'Apply this fix in the editor'}
                      >
                        {applied
                          ? <><Check size={11} aria-hidden="true" /> Applied</>
                          : <><Check size={11} aria-hidden="true" /> Apply fix</>
                        }
                      </button>
                    </div>
                  );
                })}
              </CollapsibleSection>
            ) : (
              <div className={styles.allClearSection}>
                <CheckCircle2 size={14} aria-hidden="true" className={styles.allClearIcon} />
                <span>No spelling or grammar issues found</span>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
    </>
  );
}
