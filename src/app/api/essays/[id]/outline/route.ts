import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { successResponse, errorResponse } from '@/libs/apiHelpers';
import { checkAndIncrementQuota } from '@/libs/aiQuota';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

// ── GET — fetch saved outline items ─────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return errorResponse('Unauthorized', 401, 'unauthorized');

    // Verify essay belongs to user
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (essayError || !essay) return errorResponse('Essay not found', 404, 'not_found');

    const { data: items, error } = await supabase
      .from('outline_items')
      .select('*')
      .eq('essay_id', id)
      .order('section')
      .order('position');

    if (error) return errorResponse('Failed to fetch outline', 500);

    return successResponse({ items: items ?? [] });
  } catch {
    return errorResponse('An unexpected error occurred.', 500);
  }
}

// ── POST — generate AI outline, replace existing items ───────────────────────

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return errorResponse('Unauthorized', 401, 'unauthorized');

    // ── Quota check ──────────────────────────────────────────────────────────
    const quota = await checkAndIncrementQuota(supabase, user.id, 'outline');
    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `You've used all ${quota.limit} outline generations for this month. Upgrade to Premium for unlimited access.`,
          code:  'quota_exceeded',
          used:  quota.used,
          limit: quota.limit,
        },
        { status: 402 },
      );
    }

    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select('id, title, subject, summary, essay_type, academic_level, citation_style')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (essayError || !essay) return errorResponse('Essay not found', 404, 'not_found');

    const essayType     = essay.essay_type    ?? 'argumentative';
    const academicLevel = (essay.academic_level ?? 'undergraduate').replace('_', ' ');

    const message = await anthropic.messages.create({
      model:       'claude-haiku-4-5-20251001',
      max_tokens:  1024,
      temperature: 0.3,
      system:
        'You are an expert academic writing coach. Generate structured essay outlines and return JSON only. Never include prose outside the JSON object.',
      messages: [
        {
          role: 'user',
          content: `Create a detailed outline for a ${essayType} essay at the ${academicLevel} level.

Title: ${essay.title}
Subject: ${essay.subject ?? 'Not specified'}${essay.summary ? `\nSummary: ${essay.summary}` : ''}

Return ONLY this JSON structure (no markdown, no explanation):
{
  "introduction": [
    { "heading": "<heading for this intro point>", "talking_point": "<1-2 sentences describing what to write here>" }
  ],
  "body": [
    { "heading": "<heading for this body section>", "talking_point": "<1-2 sentences describing main argument or evidence>" }
  ],
  "conclusion": [
    { "heading": "<heading for this conclusion point>", "talking_point": "<1-2 sentences describing what to cover>" }
  ]
}

Guidelines:
- introduction: 3 items (hook, background/context, thesis statement)
- body: 3-5 items depending on essay complexity (each a major argument or point)
- conclusion: 3 items (restate thesis, summary of arguments, closing thought/call to action)
- Make headings specific to the actual topic, not generic
- Make talking_points concrete and actionable

Return ONLY the JSON object.`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const jsonStr = raw.startsWith('```')
      ? raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      : raw;

    let outline: Record<OutlineSection, { heading: string; talking_point: string }[]>;
    try {
      outline = JSON.parse(jsonStr);
    } catch {
      return errorResponse('AI returned invalid outline format.', 500, 'parse_error');
    }

    // Delete existing items for this essay
    await supabase.from('outline_items').delete().eq('essay_id', id);

    // Build insert rows
    const rows: Omit<OutlineItem, 'id' | 'created_at'>[] = [];
    const sections: OutlineSection[] = ['introduction', 'body', 'conclusion'];
    for (const section of sections) {
      const sectionItems = outline[section] ?? [];
      sectionItems.forEach((item, idx) => {
        rows.push({
          essay_id:      id,
          section,
          position:      idx,
          heading:       item.heading,
          talking_point: item.talking_point ?? null,
          is_complete:   false,
        });
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('outline_items')
      .insert(rows)
      .select('*');

    if (insertError) return errorResponse('Failed to save outline.', 500);

    return successResponse({ items: inserted ?? [] });
  } catch {
    return errorResponse('An unexpected error occurred.', 500);
  }
}

// ── PATCH — toggle is_complete on a single item ───────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return errorResponse('Unauthorized', 401, 'unauthorized');

    const body = await request.json() as { itemId: string; is_complete: boolean };
    if (!body.itemId || typeof body.is_complete !== 'boolean') {
      return errorResponse('itemId and is_complete are required.', 400, 'bad_request');
    }

    const { data: updated, error: updateError } = await supabase
      .from('outline_items')
      .update({ is_complete: body.is_complete })
      .eq('id', body.itemId)
      .eq('essay_id', id)
      .select('*')
      .single();

    if (updateError || !updated) return errorResponse('Item not found or update failed.', 404);

    return successResponse({ item: updated });
  } catch {
    return errorResponse('An unexpected error occurred.', 500);
  }
}

// ── DELETE — remove all outline items for an essay ───────────────────────────

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return errorResponse('Unauthorized', 401, 'unauthorized');

    const { error } = await supabase.from('outline_items').delete().eq('essay_id', id);
    if (error) return errorResponse('Failed to delete outline.', 500);

    return successResponse({ deleted: true });
  } catch {
    return errorResponse('An unexpected error occurred.', 500);
  }
}
