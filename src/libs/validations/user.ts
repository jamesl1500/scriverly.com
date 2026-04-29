import { z } from 'zod';

export const ACADEMIC_LEVELS = [
  { value: 'high_school', label: 'High school' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'doctoral', label: 'Doctoral' },
] as const;

export const CITATION_STYLES = [
  { value: 'APA', label: 'APA' },
  { value: 'MLA', label: 'MLA' },
  { value: 'Chicago', label: 'Chicago' },
] as const;

export const ESSAY_TYPES = [
  { value: 'argumentative', label: 'Argumentative' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'expository', label: 'Expository' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'narrative', label: 'Narrative' },
  { value: 'descriptive', label: 'Descriptive' },
  { value: 'comparative', label: 'Comparative' },
] as const;

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  username: z
    .string()
    .max(30, 'Username must be 30 characters or fewer')
    .regex(
      /^[a-zA-Z0-9_-]*$/,
      'Username can only contain letters, numbers, underscores, and hyphens',
    )
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
  institution: z
    .string()
    .max(150, 'Institution name must be 150 characters or fewer')
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .max(150, 'Department name must be 150 characters or fewer')
    .optional()
    .or(z.literal('')),
  academic_level: z
    .enum(['high_school', 'undergraduate', 'graduate', 'doctoral'])
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const settingsSchema = z.object({
  default_citation_style: z.enum(['APA', 'MLA', 'Chicago']).optional(),
  default_essay_type: z
    .enum([
      'argumentative',
      'analytical',
      'expository',
      'persuasive',
      'narrative',
      'descriptive',
      'comparative',
    ])
    .optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
