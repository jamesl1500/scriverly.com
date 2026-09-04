import { NextRequest, NextResponse } from 'next/server';
import { streamObject } from 'ai';
import crypto from 'crypto';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/libs/supabase/server';
import { successResponse, errorResponse } from '@/libs/apiHelpers';
import { checkAndIncrementQuota } from '@/libs/aiQuota';
import { extractText } from '@/libs/ai/extractText';
import { essayModel } from '@/libs/ai/client';
import { essayAnalysisSchema } from '@/libs/ai/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
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

// ── POST — run (or re-run) AI analysis, streamed ─────────────────────────────
//
// The model's JSON is streamed straight to the client as it's generated (see
// EssayAISidebar, which renders the score/breakdown/feedback progressively).
// Once the stream completes, `onFinish` validates the result against
// `essayAnalysisSchema` and persists it — the client then refetches via GET
// to pick up the canonical row (id/content_hash/updated_at).

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
      .select('content, essay_type, academic_level, subject, citation_style')
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
    const citationNote = essay.citation_style
      ? ` Where you flag issues involving citations or references, judge them against ${essay.citation_style} conventions.`
      : '';

    // ── Stream a schema-validated analysis from Claude Haiku ──────────────────
    const result = streamObject({
      model:      essayModel,
      schema:     essayAnalysisSchema,
      maxOutputTokens: 2048,
      temperature: 0.2,
      system:
        'You are a precise writing coach. Analyze essays and return structured JSON only.',
      prompt: `Analyze this ${essayTypeLabel} essay written at the ${levelLabel} level.${citationNote}

Guidelines:
- overall_feedback: 2-3 sentences of honest, constructive feedback
- style_recommendations: the 3-6 most impactful issues, not an exhaustive list
- spelling_grammar: only genuine errors, not style preferences
- For style_recommendations, "original" must be copied VERBATIM from the essay text — do not paraphrase. "example" is your improved rewrite of that exact sentence.

Subject: ${essay.subject ?? 'Not specified'}
---
${truncated}
---`,
      onFinish: async ({ object, error }) => {
        if (!object || error) {
          console.error('[analyze] Model returned an invalid analysis:', error);
          return;
        }

        const score = Math.min(100, Math.max(0, Math.round(object.score)));

        try {
          const service = createSupabaseServiceClient();
          await service.from('essay_ai_analyses').upsert(
            {
              essay_id:               id,
              user_id:                user.id,
              content_hash:           hash,
              score,
              score_breakdown:        object.score_breakdown,
              style_recommendations:  object.style_recommendations,
              spelling_grammar:       object.spelling_grammar,
              overall_feedback:       object.overall_feedback,
              updated_at:             new Date().toISOString(),
            },
            { onConflict: 'essay_id' },
          );
        } catch (persistErr) {
          console.error('[analyze] Failed to persist analysis:', persistErr);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('[analyze] Error:', err);
    return errorResponse('AI analysis failed. Please try again.', 500);
  }
}
