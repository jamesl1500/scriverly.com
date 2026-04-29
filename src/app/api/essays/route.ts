import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  successResponse,
  errorResponse,
  handleSupabaseAuthError,
} from '@/libs/apiHelpers';
import { createEssaySchema } from '@/libs/validations/essay';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const { data: essays, error } = await supabase
      .from('essays')
      .select(
        'id, title, subject, status, word_count, word_goal, due_date, essay_type, academic_level, citation_style, start_with_outline, updated_at, created_at',
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return errorResponse('Failed to load essays.', 500);
    }

    return successResponse({ essays });
  } catch (err) {
    if (err instanceof AuthError) {
      const { message, status, code } = handleSupabaseAuthError(err);
      return errorResponse(message, status, code);
    }
    return errorResponse('An unexpected error occurred.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const body = await request.json();
    const parsed = createEssaySchema.parse(body);

    const { data: essay, error } = await supabase
      .from('essays')
      .insert({
        user_id:            user.id,
        title:              parsed.title,
        subject:            parsed.subject,
        summary:            parsed.summary || null,
        essay_type:         parsed.essay_type,
        academic_level:     parsed.academic_level,
        citation_style:     parsed.citation_style,
        word_goal:          parsed.word_goal || null,
        due_date:           parsed.due_date || null,
        start_with_outline: parsed.start_with_outline ?? false,
      })
      .select()
      .single();

    if (error) {
      return errorResponse('Failed to create essay.' + error.message, 500);
    }

    return successResponse({ essay }, 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return errorResponse(err.issues[0].message, 422, 'validation_error');
    }
    if (err instanceof AuthError) {
      const { message, status, code } = handleSupabaseAuthError(err);
      return errorResponse(message, status, code);
    }
    return errorResponse('An unexpected error occurred.', 500);
  }
}
