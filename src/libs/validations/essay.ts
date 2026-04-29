import { z } from 'zod';

// ============================================================
// Constants (for display + form options)
// ============================================================

export const ESSAY_TYPES = [
  { value: 'argumentative', label: 'Argumentative' },
  { value: 'analytical',    label: 'Analytical'    },
  { value: 'expository',    label: 'Expository'    },
  { value: 'persuasive',    label: 'Persuasive'    },
  { value: 'narrative',     label: 'Narrative'     },
  { value: 'descriptive',   label: 'Descriptive'   },
  { value: 'comparative',   label: 'Comparative'   },
] as const;

export const ACADEMIC_LEVELS = [
  { value: 'high_school',    label: 'High School'    },
  { value: 'undergraduate',  label: 'Undergraduate'  },
  { value: 'graduate',       label: 'Graduate'       },
  { value: 'doctoral',       label: 'Doctoral'       },
] as const;

export const CITATION_STYLES = [
  { value: 'APA',     label: 'APA'     },
  { value: 'MLA',     label: 'MLA'     },
  { value: 'Chicago', label: 'Chicago' },
] as const;

export const ESSAY_STATUSES = [
  { value: 'draft',       label: 'Draft'       },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete',    label: 'Complete'    },
] as const;

export const ESSAY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ESSAY_TYPES.map(({ value, label }) => [value, label]),
);

export const ACADEMIC_LEVEL_LABELS: Record<string, string> = Object.fromEntries(
  ACADEMIC_LEVELS.map(({ value, label }) => [value, label]),
);

export type EssayStatus = 'draft' | 'in_progress' | 'complete';

// ============================================================
// Step-by-step schemas (used for per-step validation)
// ============================================================

export const essayStep1Schema = z.object({
  title: z
    .string()
    .min(1, 'Essay title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  subject: z
    .string()
    .min(1, 'Subject is required — it helps AI understand your essay')
    .max(300, 'Subject must be 300 characters or fewer'),
  summary: z
    .string()
    .max(1000, 'Summary must be 1000 characters or fewer')
    .optional()
    .or(z.literal('')),
});

export const essayStep2Schema = z.object({
  essay_type: z.enum([
    'argumentative', 'analytical', 'expository',
    'persuasive', 'narrative', 'descriptive', 'comparative',
  ]),
  academic_level: z.enum([
    'high_school', 'undergraduate', 'graduate', 'doctoral',
  ]),
  citation_style: z.enum(['APA', 'MLA', 'Chicago']),
});

export const essayStep3Schema = z.object({
  word_goal: z
    .number()
    .int()
    .positive('Word goal must be a positive number')
    .optional()
    .or(z.nan().transform(() => undefined)),
  due_date: z.string().optional().or(z.literal('')),
  start_with_outline: z.boolean(),
});

// ============================================================
// Full create schema (all steps merged)
// ============================================================

export const createEssaySchema = essayStep1Schema
  .merge(essayStep2Schema)
  .merge(essayStep3Schema);

export type CreateEssayValues = z.infer<typeof createEssaySchema>;

// ============================================================
// Update schema (partial — used by the editor auto-save)
// ============================================================

export const updateEssaySchema = z.object({
  title:              z.string().min(1).max(200).optional(),
  subject:            z.string().max(300).optional().or(z.literal('')),
  summary:            z.string().max(1000).optional().or(z.literal('')),
  content:            z.record(z.string(), z.unknown()).optional(),
  word_count:         z.number().int().nonnegative().optional(),
  essay_type:         z.string().optional(),
  academic_level:     z.string().optional(),
  citation_style:     z.string().optional(),
  word_goal:          z.number().int().positive().optional().nullable(),
  due_date:           z.string().optional().nullable().or(z.literal('')),
  start_with_outline: z.boolean().optional(),
  status:             z.enum(['draft', 'in_progress', 'complete']).optional(),
});

export type UpdateEssayValues = z.infer<typeof updateEssaySchema>;

// ============================================================
// Essay row type (returned from Supabase)
// ============================================================

export interface Essay {
  id:                  string;
  user_id:             string;
  title:               string;
  subject:             string | null;
  summary:             string | null;
  content:             Record<string, unknown>;
  essay_type:          string | null;
  academic_level:      string | null;
  citation_style:      string | null;
  word_goal:           number | null;
  due_date:            string | null;
  start_with_outline:  boolean;
  outline:             Record<string, unknown> | null;
  status:              EssayStatus;
  word_count:          number;
  created_at:          string;
  updated_at:          string;
}

export type EssayListItem = Omit<Essay, 'content' | 'outline' | 'summary'>;
