import { NextResponse } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    { success: true, data },
    { status },
  );
}

export function errorResponse(message: string, status: number, code?: string) {
  return NextResponse.json<ApiErrorResponse>(
    { success: false, error: message, ...(code ? { code } : {}) },
    { status },
  );
}

/**
 * Maps a Supabase AuthError to a user-facing message and HTTP status code.
 */
export function handleSupabaseAuthError(err: AuthError): {
  message: string;
  status: number;
  code: string;
} {
  const status = err.status ?? 500;

  // Supabase error codes reference:
  // https://supabase.com/docs/reference/javascript/auth-error-codes
  switch (err.code) {
    case 'invalid_credentials':
      return { message: 'Invalid email or password.', status: 401, code: err.code };
    case 'email_not_confirmed':
      return { message: 'Please verify your email before signing in.', status: 403, code: err.code };
    case 'user_already_exists':
    case 'email_exists':
      return { message: 'An account with this email already exists.', status: 409, code: err.code };
    case 'weak_password':
      return { message: 'Password is too weak. Please choose a stronger password.', status: 422, code: err.code };
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return { message: 'Too many requests. Please wait a moment and try again.', status: 429, code: err.code };
    case 'user_not_found':
      // Return a generic message to avoid leaking whether an email is registered
      return { message: 'If that email is registered, a reset link has been sent.', status: 200, code: err.code };
    case 'same_password':
      return { message: 'Your new password cannot be the same as your current password.', status: 422, code: err.code };
    case 'otp_expired':
    case 'token_expired':
      return { message: 'This link has expired. Please request a new one.', status: 410, code: err.code };
    default:
      return {
        message: status >= 500
          ? 'An unexpected error occurred. Please try again.'
          : err.message,
        status: status >= 400 ? status : 500,
        code: err.code ?? 'unknown',
      };
  }
}
