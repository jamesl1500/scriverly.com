'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import StarterKit from '@tiptap/starter-kit';
import {
  ArrowLeft,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Undo2,
  Redo2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type { AxiosError } from 'axios';

import type { Essay } from '@/libs/validations/essay';
import { ESSAY_TYPE_LABELS } from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
import styles from '@/styles/components/EssayEditor.module.scss';

// ── Page-break decoration extension ────────────────────────

const pageBreakKey = new PluginKey('pageBreak');

const PageBreakExtension = Extension.create({
  name: 'pageBreak',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pageBreakKey,
        props: {
          decorations(state) {
            const { doc } = state;
            const decos: Decoration[] = [];
            let words = 0;
            let nextMark = 500;

            doc.nodesBetween(0, doc.content.size, (node, pos, parent) => {
              if (parent !== doc) return false;

              const text = node.textContent.trim();
              const nodeWords = text === '' ? 0 : text.split(/\s+/).length;

              if (words > 0 && words < nextMark && words + nodeWords >= nextMark) {
                const mark = nextMark;
                decos.push(
                  Decoration.widget(
                    pos,
                    () => {
                      const el = document.createElement('div');
                      el.setAttribute('data-page-break', String(mark));
                      el.setAttribute('contenteditable', 'false');
                      el.setAttribute('aria-hidden', 'true');
                      return el;
                    },
                    { side: -1, key: `pb-${mark}` },
                  ),
                );
              }

              words += nodeWords;
              while (words >= nextMark) nextMark += 500;

              return false; // don't recurse into block children
            });

            return DecorationSet.create(doc, decos);
          },
        },
      }),
    ];
  },
});

// ── Types ──────────────────────────────────────────────────

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface EssayEditorProps {
  essay: Essay;
}

// ── Helpers ────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function getDueDateStatus(dueDate: string | null): {
  label: string;
  className: string;
} | null {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000);
  if (diff < 0)   return { label: 'Overdue',         className: styles.dueOverdue };
  if (diff === 0) return { label: 'Due today',        className: styles.dueSoon    };
  if (diff <= 3)  return { label: `Due in ${diff}d`,  className: styles.dueSoon    };
  return {
    label: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    className: '',
  };
}

// ── Toolbar button ──────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, isDisabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.toolbarBtn} ${isActive ? styles.toolbarBtnActive : ''}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
    >
      {children}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function EssayEditor({ essay }: EssayEditorProps) {
  const [title,      setTitle]      = useState(essay.title);
  const [wordCount,  setWordCount]  = useState(essay.word_count);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const saveTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-save content ──────────────────────────────────

  const scheduleContentSave = useCallback(
    (json: Record<string, unknown>, count: number) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      setSaveStatus('pending');
      saveTimeout.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await apiClient.put(`/essays/${essay.id}`, {
            content:    json,
            word_count: count,
            // Promote to in_progress once the user starts writing
            ...(essay.status === 'draft' && count > 0 ? { status: 'in_progress' } : {}),
          });
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
          console.error('Auto-save failed:', (err as AxiosError).message);
          setSaveStatus('error');
        }
      }, 1500);
    },
    [essay.id, essay.status],
  );

  // ── Auto-save title ────────────────────────────────────

  const scheduleTitleSave = useCallback(
    (newTitle: string) => {
      if (titleTimeout.current) clearTimeout(titleTimeout.current);
      titleTimeout.current = setTimeout(async () => {
        if (!newTitle.trim()) return;
        try {
          await apiClient.put(`/essays/${essay.id}`, { title: newTitle.trim() });
        } catch {
          // Non-critical; user can retry
        }
      }, 1000);
    },
    [essay.id],
  );

  // ── TipTap editor ──────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      PageBreakExtension,
    ],
    content: essay.content as Record<string, unknown> | null || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    autofocus: 'end',
    editorProps: {
      attributes: {
        'data-placeholder': 'Start writing your essay…',
        spellcheck: 'true',
      },
    },
    onUpdate({ editor: e }) {
      const text  = e.getText();
      const count = countWords(text);
      setWordCount(count);
      scheduleContentSave(e.getJSON() as Record<string, unknown>, count);
    },
    immediatelyRender: false,
  });

  // ── Cleanup on unmount ─────────────────────────────────

  useEffect(() => {
    return () => {
      if (saveTimeout.current)  clearTimeout(saveTimeout.current);
      if (titleTimeout.current) clearTimeout(titleTimeout.current);
    };
  }, []);

  // ── Derived state ──────────────────────────────────────

  const progress  = essay.word_goal
    ? Math.min(100, Math.round((wordCount / essay.word_goal) * 100))
    : null;
  const dueMeta   = getDueDateStatus(essay.due_date);
  const typeLabel = essay.essay_type ? ESSAY_TYPE_LABELS[essay.essay_type] : null;

  // ── Render ─────────────────────────────────────────────

  return (
    <div className={styles.editorPage}>

      {/* ─── Header ─────────────────────────────────── */}
      <header className={styles.editorHeader}>
        <div className={styles.headerInner}>
        <Link href="/essays" className={styles.backBtn} aria-label="Back to essays">
          <ArrowLeft size={14} aria-hidden="true" />
          Essays
        </Link>

        <div className={styles.divider} aria-hidden="true" />

        <input
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            scheduleTitleSave(e.target.value);
          }}
          placeholder="Essay title…"
          aria-label="Essay title"
          maxLength={200}
        />

        <div className={styles.headerRight}>
          {saveStatus !== 'idle' && (
            <span
              className={`${styles.saveStatus} ${
                saveStatus === 'saved'   ? styles.saveStatusSaved   :
                saveStatus === 'error'  ? styles.saveStatusError   :
                styles.saveStatusSaving
              }`}
              aria-live="polite"
              aria-label={
                saveStatus === 'saving' ? 'Saving…' :
                saveStatus === 'saved'  ? 'All changes saved' :
                saveStatus === 'error'  ? 'Save failed' :
                'Unsaved changes'
              }
            >
              <span className={styles.saveDot} aria-hidden="true" />
              {saveStatus === 'saving'  ? 'Saving…'            :
               saveStatus === 'saved'   ? 'Saved'               :
               saveStatus === 'error'   ? 'Save failed'         :
               'Unsaved changes'}
            </span>
          )}
          {typeLabel && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: '#F3EDE5',
                color: '#6B5F55',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
            >
              {typeLabel}
            </span>
          )}
        </div>
        </div>
      </header>

      {/* ─── Formatting Toolbar ─────────────────────── */}
      <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
        <div className={styles.toolbarInner}>

        {/* History */}
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            isDisabled={!editor?.can().undo()}
            label="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            isDisabled={!editor?.can().redo()}
            label="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={14} aria-hidden="true" />
          </ToolbarButton>
        </div>

        <div className={styles.toolbarSep} aria-hidden="true" />

        {/* Headings */}
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor?.isActive('heading', { level: 1 })}
            label="Heading 1"
          >
            <Heading1 size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor?.isActive('heading', { level: 2 })}
            label="Heading 2"
          >
            <Heading2 size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor?.isActive('heading', { level: 3 })}
            label="Heading 3"
          >
            <Heading3 size={14} aria-hidden="true" />
          </ToolbarButton>
        </div>

        <div className={styles.toolbarSep} aria-hidden="true" />

        {/* Marks */}
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            label="Bold (Ctrl+B)"
          >
            <Bold size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            label="Italic (Ctrl+I)"
          >
            <Italic size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            isActive={editor?.isActive('strike')}
            label="Strikethrough"
          >
            <Strikethrough size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCode().run()}
            isActive={editor?.isActive('code')}
            label="Inline code"
          >
            <Code size={14} aria-hidden="true" />
          </ToolbarButton>
        </div>

        <div className={styles.toolbarSep} aria-hidden="true" />

        {/* Lists */}
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
            label="Bullet list"
          >
            <List size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
            label="Numbered list"
          >
            <ListOrdered size={14} aria-hidden="true" />
          </ToolbarButton>
        </div>

        <div className={styles.toolbarSep} aria-hidden="true" />

        {/* Block elements */}
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            isActive={editor?.isActive('blockquote')}
            label="Blockquote"
          >
            <Quote size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            isActive={editor?.isActive('codeBlock')}
            label="Code block"
          >
            <Code2 size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            label="Horizontal rule"
          >
            <Minus size={14} aria-hidden="true" />
          </ToolbarButton>
        </div>
        </div>
      </div>

      {/* ─── Editor Body ─────────────────────────────── */}
      <div className={styles.editorBody}>
        <div className={styles.editorContent}>

          {/* AI Outline placeholder (shown when start_with_outline=true and no content yet) */}
          {essay.start_with_outline && !essay.outline && (
            <div className={styles.outlinePlaceholder}>
              <div className={styles.outlinePlaceholderIcon} aria-hidden="true">
                <Sparkles size={22} />
              </div>
              <p className={styles.outlinePlaceholderTitle}>AI outline coming soon</p>
              <p className={styles.outlinePlaceholderDesc}>
                Scriverly will generate a structured outline here based on your topic, essay type, and academic level. You can start writing below in the meantime.
              </p>
            </div>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ─── Status Bar ──────────────────────────────── */}
      <footer className={styles.statusBar}>
        <div className={styles.statusBarInner}>
        <div className={styles.statusBarLeft}>
          <span className={styles.wordCountText}>
            <strong>{wordCount.toLocaleString()}</strong>{' '}
            {wordCount === 1 ? 'word' : 'words'}
          </span>

          {essay.word_goal && (
            <div className={styles.wordGoalProgress}>
              <div className={styles.wordGoalTrack} role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`${styles.wordGoalFill} ${(progress ?? 0) >= 100 ? styles.wordGoalComplete : ''}`}
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
              <span className={styles.wordGoalLabel}>
                {progress ?? 0}% of {essay.word_goal.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className={styles.statusBarRight}>
          {dueMeta && (
            <span className={`${styles.dueDateChip} ${dueMeta.className}`}>
              <Calendar size={11} aria-hidden="true" />
              {dueMeta.label}
            </span>
          )}
          {essay.citation_style && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#9C9087',
              }}
            >
              {essay.citation_style}
            </span>
          )}
          {essay.academic_level && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#9C9087',
                textTransform: 'capitalize',
              }}
            >
              {essay.academic_level.replace('_', ' ')}
            </span>
          )}
        </div>
        </div>
      </footer>
    </div>
  );
}
