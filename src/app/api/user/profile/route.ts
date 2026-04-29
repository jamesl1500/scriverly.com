import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  successResponse,
  errorResponse,
  handleSupabaseAuthError,
} from '@/libs/apiHelpers';
import { profileSchema } from '@/libs/validations/user';
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'full_name, username, bio, institution, department, academic_level, role, created_at',
      )
      .eq('user_id', user.id)
      .single();

    if (error) {
      return errorResponse('Failed to load profile.', 500);
    }

    return successResponse({ profile });
  } catch (err) {
    if (err instanceof AuthError) {
      const { message, status, code } = handleSupabaseAuthError(err);
      return errorResponse(message, status, code);
    }
    return errorResponse('An unexpected error occurred.', 500);
  }
}

export async function PUT(request: NextRequest) {
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
    const parsed = profileSchema.parse(body);

    // Strip empty strings so we only send explicit updates to Postgres
    const updates = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== '' && v !== undefined),
    );

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      // Unique constraint violation on username
      if (error.code === '23505') {
        return errorResponse(
          'That username is already taken.',
          409,
          'username_taken',
        );
      }
      return errorResponse('Failed to update profile.', 500);
    }

    return successResponse({ profile: data });
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
