import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  successResponse,
  errorResponse,
  handleSupabaseAuthError,
} from '@/libs/apiHelpers';
import { forgotPasswordSchema } from '@/libs/validations/auth';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return errorResponse('Server misconfiguration: NEXT_PUBLIC_APP_URL is not set.', 500, 'misconfiguration');
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback`,
    });

    if (error) {
      const { message, status, code } = handleSupabaseAuthError(error);
      // For user_not_found: return a 200 with a generic message to avoid
      // leaking whether an email is registered in the system.
      if (code === 'user_not_found') {
        return successResponse({ sent: true });
      }
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
