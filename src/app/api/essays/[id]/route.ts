import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  successResponse,
  errorResponse,
  handleSupabaseAuthError,
} from '@/libs/apiHelpers';
import { updateEssaySchema } from '@/libs/validations/essay';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const { data: essay, error } = await supabase
      .from('essays')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !essay) {
      return errorResponse('Essay not found.', 404, 'not_found');
    }

    return successResponse({ essay });
  } catch (err) {
    if (err instanceof AuthError) {
      const { message, status, code } = handleSupabaseAuthError(err);
      return errorResponse(message, status, code);
    }
    return errorResponse('An unexpected error occurred.', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const body = await request.json();
    const parsed = updateEssaySchema.parse(body);

    const updates = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== undefined),
    );

    const { data: essay, error } = await supabase
      .from('essays')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // PGRST116 = no rows matched (not found / wrong user)
      if (error.code === 'PGRST116') {
        return errorResponse('Essay not found.', 404, 'not_found');
      }
      return errorResponse('Failed to update essay.', 500);
    }

    if (!essay) {
      return errorResponse('Essay not found.', 404, 'not_found');
    }

    return successResponse({ essay });
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

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const { error } = await supabase
      .from('essays')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return errorResponse('Failed to delete essay.', 500);
    }

    return successResponse({ deleted: true });
  } catch (err) {
    if (err instanceof AuthError) {
      const { message, status, code } = handleSupabaseAuthError(err);
      return errorResponse(message, status, code);
    }
    return errorResponse('An unexpected error occurred.', 500);
  }
}
