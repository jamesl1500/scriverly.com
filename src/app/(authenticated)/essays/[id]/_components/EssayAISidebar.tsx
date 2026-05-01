'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { AxiosError } from 'axios';

import type { Essay } from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
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

// ── Apply grammar fix via ProseMirror find-and-replace ────────────────────────

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
    if (!node.isText || !node.text) return;
    const idx = node.text.indexOf(original);
    if (idx === -1) return;
    const start = pos + idx;
    const end   = start + original.length;
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
  const [analysis,       setAnalysis]       = useState<AnalysisResult | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [appliedGrammar, setAppliedGrammar] = useState<Set<number>>(new Set());
  const [appliedStyle,   setAppliedStyle]   = useState<Set<number>>(new Set());
  // Track whether this is the very first mount so we don't double-call on open
  const isFirstMount = useRef(true);

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

  // ── Load cached analysis on mount ──────────────────────────────────────────

  const loadCached = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{
        success: true;
        data: { analysis: AnalysisResult | null };
      }>(`/essays/${essay.id}/analyze`);
      setAnalysis(res.data.data.analysis);
    } catch {
      // Non-critical — just means no cached analysis
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [essay.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCached();
  }, [loadCached]);


  // ── Run analysis ────────────────────────────────────────────────────────────

  const runAnalysis = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<{
        success: true;
        data: { analysis: AnalysisResult };
      }>(`/essays/${essay.id}/analyze`, { force });
      setAnalysis(res.data.data.analysis);
    } catch (err) {
      const msg =
        (err as AxiosError<{ error: string }>)?.response?.data?.error ??
        'Analysis failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [essay.id]);

  // ── React to auto-analyze trigger from editor ────────────────────────────

  useEffect(() => {
    // Skip the initial render; loadCached already handles that
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (autoAnalyzeTrigger === 0) return;
    // force: false — the server uses content_hash; Claude is skipped if unchanged
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runAnalysis(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyzeTrigger]);

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

  const highRecs = analysis?.style_recommendations.filter(r => r.severity === 'high')   ?? [];
  const otherRecs = analysis?.style_recommendations.filter(r => r.severity !== 'high') ?? [];

  return (
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

        {/* Error */}
        {!loading && error && (
          <div className={styles.errorState} role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <p>{error}</p>
            <button
              type="button"
              className={styles.analyzeBtn}
              onClick={() => runAnalysis(false)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !analysis && (
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
              onClick={() => runAnalysis(false)}
            >
              <Sparkles size={13} aria-hidden="true" />
              Analyze Essay
            </button>
          </div>
        )}

        {/* Analysis results */}
        {!loading && !error && analysis && (
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
              onClick={() => runAnalysis(true)}
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
  );
}
