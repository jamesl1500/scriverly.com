import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  successResponse,
  errorResponse,
  handleSupabaseAuthError,
} from '@/libs/apiHelpers';
import { signupSchema } from '@/libs/validations/auth';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = signupSchema.parse(body);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      const { message, status, code } = handleSupabaseAuthError(error);
      return errorResponse(message, status, code);
    }

    // If the user object has an identities array that is empty, the email is
    // already registered but unconfirmed — Supabase returns 200 in this case.
    if (data.user && data.user.identities?.length === 0) {
      return errorResponse(
        'An account with this email already exists.',
        409,
        'email_exists',
      );
    }

    return successResponse(
      { user: data.user, requiresEmailConfirmation: !data.session },
      201,
    );
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
