/**
 * apiHelpers.ts
 * -----------------
 * This file contains helper functions for handling API responses and errors in a consistent way across the application.
 * 
 * @module src/libs/apiHelpers
 * @author James Latten
 * @created 2026-04-29
 * @version 1.0.0
 */
import { NextResponse } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

/**
 * Type definitions for API responses:
 * - ApiSuccessResponse: Represents a successful API response, containing a `success` flag set to true and a `data` field of a generic type T.
 * - ApiErrorResponse: Represents an error response from the API, containing a `success` flag set to false, an `error` message, and an optional `code` for more specific error identification.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

/**
 * successResponse:
 * Helper function to create a standardized JSON response for successful API calls. It takes the data to be returned and an optional HTTP status code (defaulting to 200) and returns a NextResponse object with the appropriate structure.
 * 
 * @param data The data to be returned in the response.
 * @param status The HTTP status code for the response. Defaults to 200.
 * @returns A NextResponse object containing the standardized success response.
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    { success: true, data },
    { status },
  );
}

/**
 * errorResponse:
 * Helper function to create a standardized JSON response for API errors. It takes an error message, an HTTP status code, and an optional error code, and returns a NextResponse object with the appropriate structure.
 * 
 * @param message The error message to be returned in the response.
 * @param status The HTTP status code for the response.
 * @param code An optional error code for more specific error identification.
 * @returns A NextResponse object containing the standardized error response.
 */
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
