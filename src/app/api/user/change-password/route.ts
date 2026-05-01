import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { successResponse, errorResponse, handleSupabaseAuthError } from '@/libs/apiHelpers';
import { changePasswordSchema } from '@/libs/validations/user';
import { AuthError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const body = await request.json();
    // confirmPassword is validated by Zod refine but not sent to Supabase
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Re-authenticate to verify current password before allowing the change
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return errorResponse('Current password is incorrect.', 401, 'wrong_password');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      const { message, status, code } = handleSupabaseAuthError(error);
      return errorResponse(message, status, code);
    }

    // Invalidate all other active sessions
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
