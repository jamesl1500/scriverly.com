import { z } from 'zod';

// ── Essay analysis ────────────────────────────────────────────────────────────
// Field order matters: it roughly matches the order fields are consumed by the
// streaming UI (score/breakdown first, then feedback, then recommendation lists).

export const scoreBreakdownSchema = z.object({
  clarity:         z.number().int().min(0).max(100),
  structure:       z.number().int().min(0).max(100),
  style_alignment: z.number().int().min(0).max(100),
  grammar:         z.number().int().min(0).max(100),
  vocabulary:      z.number().int().min(0).max(100),
});

export const styleRecommendationSchema = z.object({
  type:       z.enum(['structure', 'style', 'argument', 'vocabulary', 'clarity']),
  severity:   z.enum(['high', 'medium', 'low']),
  message:    z.string(),
  suggestion: z.string(),
  original:   z.string(),
  example:    z.string(),
});

export const spellingGrammarIssueSchema = z.object({
  original:   z.string(),
  suggestion: z.string(),
  reason:     z.string(),
});

export const essayAnalysisSchema = z.object({
  score:                 z.number().int().min(0).max(100),
  score_breakdown:       scoreBreakdownSchema,
  overall_feedback:      z.string(),
  style_recommendations: z.array(styleRecommendationSchema),
  spelling_grammar:      z.array(spellingGrammarIssueSchema),
});

export type EssayAnalysis = z.infer<typeof essayAnalysisSchema>;

// ── Essay outline ─────────────────────────────────────────────────────────────

export const outlineSectionItemSchema = z.object({
  heading:       z.string(),
  talking_point: z.string(),
});

export const essayOutlineSchema = z.object({
  introduction: z.array(outlineSectionItemSchema),
  body:         z.array(outlineSectionItemSchema),
  conclusion:   z.array(outlineSectionItemSchema),
});

export type EssayOutline = z.infer<typeof essayOutlineSchema>;
