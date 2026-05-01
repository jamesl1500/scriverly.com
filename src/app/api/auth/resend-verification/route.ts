import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import {
  successResponse,
  errorResponse,
  handleSupabaseAuthError,
} from '@/libs/apiHelpers';
import { AuthError } from '@supabase/supabase-js';
import { z, ZodError } from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return errorResponse('Server misconfiguration: NEXT_PUBLIC_APP_URL is not set.', 500, 'misconfiguration');
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });

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
