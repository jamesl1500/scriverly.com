'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import type { Essay, EssayStatus } from '@/libs/validations/essay';
import {
  ESSAY_TYPES,
  ACADEMIC_LEVELS,
  CITATION_STYLES,
  ESSAY_STATUSES,
} from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
import FormField from '@/components/ui/FormField/FormField';
import Input from '@/components/ui/Input/Input';
import styles from '@/styles/components/EssaySettingsModal.module.scss';

interface EssaySettingsModalProps {
  essay: Essay;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updates: Partial<Essay>) => void;
}

export default function EssaySettingsModal({
  essay,
  isOpen,
  onClose,
  onSaved,
}: EssaySettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // ── Form state ──────────────────────────────────────────
  const [subject,       setSubject]       = useState(essay.subject ?? '');
  const [summary,       setSummary]       = useState(essay.summary ?? '');
  const [essayType,     setEssayType]     = useState(essay.essay_type ?? '');
  const [academicLevel, setAcademicLevel] = useState(essay.academic_level ?? '');
  const [citationStyle, setCitationStyle] = useState(essay.citation_style ?? '');
  const [wordGoal,      setWordGoal]      = useState(essay.word_goal?.toString() ?? '');
  const [dueDate,       setDueDate]       = useState(
    essay.due_date ? essay.due_date.split('T')[0] : '',
  );
  const [status, setStatus] = useState<EssayStatus>(essay.status);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // ── Open / close native dialog ───────────────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // ── Reset form when essay changes ────────────────────────
  useEffect(() => {
    setSubject(essay.subject ?? '');
    setSummary(essay.summary ?? '');
    setEssayType(essay.essay_type ?? '');
    setAcademicLevel(essay.academic_level ?? '');
    setCitationStyle(essay.citation_style ?? '');
    setWordGoal(essay.word_goal?.toString() ?? '');
    setDueDate(essay.due_date ? essay.due_date.split('T')[0] : '');
    setStatus(essay.status);
    setError(null);
  }, [essay]);

  // ── Close on backdrop click ──────────────────────────────
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  // ── Close on Escape (native behavior) ────────────────────
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const wordGoalParsed = wordGoal.trim() ? parseInt(wordGoal, 10) : null;

    const updates: Partial<Essay> = {
      subject:        subject.trim()   || null,
      summary:        summary.trim()   || null,
      essay_type:     essayType        || null,
      academic_level: academicLevel    || null,
      citation_style: citationStyle    || null,
      word_goal:      wordGoalParsed,
      due_date:       dueDate          || null,
      status,
    };

    try {
      await apiClient.put(`/essays/${essay.id}`, updates);
      onSaved(updates);
      onClose();
    } catch {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleDialogClick}
      onCancel={handleCancel}
      aria-labelledby="settings-modal-title"
    >
      <div className={styles.panel}>

        {/* ─── Header ───────────────────────────────── */}
        <header className={styles.header}>
          <h2 id="settings-modal-title" className={styles.title}>Essay Settings</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        {/* ─── Form ─────────────────────────────────── */}
        <form className={styles.form} onSubmit={handleSave} noValidate>

          {/* Details section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Details</h3>
            <div className={styles.fields}>
              <FormField label="Subject" htmlFor="settings-subject">
                <Input
                  id="settings-subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. The causes of World War I"
                  maxLength={300}
                />
              </FormField>

              <FormField label="Summary" htmlFor="settings-summary">
                <textarea
                  id="settings-summary"
                  className={styles.textarea}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Brief description of your essay…"
                  maxLength={1000}
                  rows={3}
                />
              </FormField>
            </div>
          </section>

          {/* Format section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Format</h3>
            <div className={styles.grid}>
              <FormField label="Essay Type" htmlFor="settings-essay-type">
                <select
                  id="settings-essay-type"
                  className={styles.select}
                  value={essayType}
                  onChange={e => setEssayType(e.target.value)}
                >
                  <option value="">— Select —</option>
                  {ESSAY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Academic Level" htmlFor="settings-academic-level">
                <select
                  id="settings-academic-level"
                  className={styles.select}
                  value={academicLevel}
                  onChange={e => setAcademicLevel(e.target.value)}
                >
                  <option value="">— Select —</option>
                  {ACADEMIC_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Citation Style" htmlFor="settings-citation-style">
                <select
                  id="settings-citation-style"
                  className={styles.select}
                  value={citationStyle}
                  onChange={e => setCitationStyle(e.target.value)}
                >
                  <option value="">— Select —</option>
                  {CITATION_STYLES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Status" htmlFor="settings-status">
                <select
                  id="settings-status"
                  className={styles.select}
                  value={status}
                  onChange={e => setStatus(e.target.value as EssayStatus)}
                >
                  {ESSAY_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </section>

          {/* Goals section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Goals &amp; Deadlines</h3>
            <div className={styles.grid}>
              <FormField label="Word Goal" htmlFor="settings-word-goal">
                <Input
                  id="settings-word-goal"
                  type="number"
                  value={wordGoal}
                  onChange={e => setWordGoal(e.target.value)}
                  placeholder="e.g. 1500"
                  min={1}
                  max={100000}
                />
              </FormField>

              <FormField label="Due Date" htmlFor="settings-due-date">
                <Input
                  id="settings-due-date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </FormField>
            </div>
          </section>

          {error && (
            <p className={styles.errorMsg} role="alert">{error}</p>
          )}

          {/* Footer */}
          <footer className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
