import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { successResponse, errorResponse } from '@/libs/apiHelpers';
import { checkAndIncrementQuota } from '@/libs/aiQuota';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── Extract plain text from TipTap/ProseMirror JSON doc ──────────────────────

function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (n.type === 'text') return String(n.text ?? '');
  if (!Array.isArray(n.content)) return '';
  const blockTypes = new Set([
    'paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem',
  ]);
  const childText = (n.content as unknown[]).map(extractText).join('');
  return typeof n.type === 'string' && blockTypes.has(n.type)
    ? childText + '\n'
    : childText;
}

// ── GET — return cached analysis ─────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const { data: analysis } = await supabase
      .from('essay_ai_analyses')
      .select('*')
      .eq('essay_id', id)
      .eq('user_id', user.id)
      .single();

    return successResponse({ analysis: analysis ?? null });
  } catch {
    return errorResponse('An unexpected error occurred.', 500);
  }
}

// ── POST — run (or re-run) AI analysis ───────────────────────────────────────

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    // ── Quota check ──────────────────────────────────────────────────────────
    const quota = await checkAndIncrementQuota(supabase, user.id, 'analysis');
    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `You've used all ${quota.limit} AI analyses for this month. Upgrade to Premium for unlimited access.`,
          code:  'quota_exceeded',
          used:  quota.used,
          limit: quota.limit,
        },
        { status: 402 },
      );
    }

    // Fetch the essay
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select('content, essay_type, academic_level, subject')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (essayError || !essay) {
      return errorResponse('Essay not found.', 404, 'not_found');
    }

    // Extract and clean the plain text
    const rawText = extractText(essay.content as Record<string, unknown>)
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!rawText || rawText.split(/\s+/).length < 20) {
      return errorResponse(
        'Essay is too short to analyze (minimum 20 words).',
        422,
        'too_short',
      );
    }

    // Determine if this is a forced re-run
    const body = await request.json().catch(() => ({}));
    const force = (body as { force?: boolean }).force ?? false;

    // Content hash — avoids redundant API calls for unchanged text
    const hash = crypto.createHash('sha256').update(rawText).digest('hex');

    if (!force) {
      const { data: cached } = await supabase
        .from('essay_ai_analyses')
        .select('*')
        .eq('essay_id', id)
        .eq('user_id', user.id)
        .eq('content_hash', hash)
        .single();

      if (cached) {
        return successResponse({ analysis: cached, cached: true });
      }
    }

    // Truncate to ~5 000 chars for cost efficiency (~1 250 tokens)
    const truncated =
      rawText.length > 5000 ? rawText.slice(0, 5000) + '…' : rawText;

    const essayTypeLabel = essay.essay_type
      ? essay.essay_type.charAt(0).toUpperCase() + essay.essay_type.slice(1)
      : 'General';
    const levelLabel = (essay.academic_level ?? 'general').replace(/_/g, ' ');

    // ── Call Claude Haiku ────────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1536,
      temperature: 0.2,
      system:
        'You are a precise writing coach. Analyze essays and return structured JSON only. Never include prose outside the JSON object.',
      messages: [
        {
          role: 'user',
          content: `Analyze this ${essayTypeLabel} essay written at the ${levelLabel} level.

Return ONLY this JSON structure (no markdown, no explanation):
{
  "score": <integer 0-100>,
  "score_breakdown": {
    "clarity":         <0-100>,
    "structure":       <0-100>,
    "style_alignment": <0-100>,
    "grammar":         <0-100>,
    "vocabulary":      <0-100>
  },
  "style_recommendations": [
    {
      "type":       "structure|style|argument|vocabulary|clarity",
      "severity":   "high|medium|low",
      "message":    "<specific issue found in the essay>",
      "suggestion": "<actionable improvement strategy>",
      "original":   "<exact sentence or short passage from the essay that illustrates the problem — copy verbatim>",
      "example":    "<your improved rewrite of that same sentence or passage>"
    }
  ],
  "spelling_grammar": [
    {
      "original":   "<problematic phrase>",
      "suggestion": "<corrected phrase>",
      "reason":     "<brief explanation>"
    }
  ],
  "overall_feedback": "<2-3 sentences of honest, constructive feedback>"
}

IMPORTANT for style_recommendations: \"original\" must be copied VERBATIM from the essay text — do not paraphrase. \"example\" is your improved rewrite of that exact sentence.

Subject: ${essay.subject ?? 'Not specified'}
---
${truncated}
---

Return ONLY the JSON object.`,
        },
      ],
    });

    // ── Parse structured response ────────────────────────────────────────────
    const raw =
      message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = raw
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    let analysisData: {
      score: number;
      score_breakdown: Record<string, number>;
      style_recommendations: Array<{
        type: string;
        severity: string;
        message: string;
        suggestion: string;
      }>;
      spelling_grammar: Array<{
        original: string;
        suggestion: string;
        reason: string;
      }>;
      overall_feedback: string;
    };

    try {
      analysisData = JSON.parse(cleaned);
    } catch {
      return errorResponse('AI returned an unexpected response format.', 500);
    }

    const score = Math.min(100, Math.max(0, Math.round(analysisData.score ?? 0)));

    // ── Upsert into Supabase ─────────────────────────────────────────────────
    const { data: saved, error: upsertError } = await supabase
      .from('essay_ai_analyses')
      .upsert(
        {
          essay_id:             id,
          user_id:              user.id,
          content_hash:         hash,
          score,
          score_breakdown:      analysisData.score_breakdown       ?? {},
          style_recommendations: analysisData.style_recommendations ?? [],
          spelling_grammar:     analysisData.spelling_grammar       ?? [],
          overall_feedback:     analysisData.overall_feedback       ?? '',
          updated_at:           new Date().toISOString(),
        },
        { onConflict: 'essay_id' },
      )
      .select()
      .single();

    if (upsertError) {
      return errorResponse('Failed to save analysis.', 500);
    }

    return successResponse({ analysis: saved, cached: false });
  } catch (err) {
    console.error('[analyze] Error:', err);
    return errorResponse('AI analysis failed. Please try again.', 500);
  }
}
