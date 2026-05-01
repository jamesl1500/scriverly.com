import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { successResponse, errorResponse, handleSupabaseAuthError } from '@/libs/apiHelpers';
import { changeEmailSchema } from '@/libs/validations/user';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const body = await request.json();
    const { newEmail } = changeEmailSchema.parse(body);

    if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
      return errorResponse('New email must be different from your current email.', 422, 'same_email');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return errorResponse('Server misconfiguration: NEXT_PUBLIC_APP_URL is not set.', 500, 'misconfiguration');
    }

    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${appUrl}/auth/callback` },
    );

    if (error) {
      const { message, status, code } = handleSupabaseAuthError(error);
      return errorResponse(message, status, code);
    }

    return successResponse({ sent: true });
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
