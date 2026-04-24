import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  successResponse,
  errorResponse,
  handleSupabaseAuthError,
} from '@/libs/apiHelpers';
import { resetPasswordSchema } from '@/libs/validations/auth';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = resetPasswordSchema.parse(body);

    const supabase = await createSupabaseServerClient();

    // The user must have an active session restored from the reset link
    // (Supabase sets this automatically when the user visits the reset URL)
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return errorResponse(
        'Your reset link is invalid or has expired. Please request a new one.',
        401,
        'session_missing',
      );
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const { message, status, code } = handleSupabaseAuthError(error);
      return errorResponse(message, status, code);
    }

    // Sign out all other sessions after a password change
    await supabase.auth.signOut({ scope: 'others' });

    return successResponse({ updated: true });
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
