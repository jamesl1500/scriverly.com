import { describe, expect, it } from 'vitest';
import { AuthError } from '@supabase/supabase-js';
import { errorResponse, handleSupabaseAuthError, successResponse } from './apiHelpers';

describe('successResponse', () => {
  it('wraps data in a success envelope with default status 200', async () => {
    const res = successResponse({ foo: 'bar' });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true, data: { foo: 'bar' } });
  });

  it('honors a custom status code', () => {
    const res = successResponse({ ok: true }, 201);
    expect(res.status).toBe(201);
  });
});

describe('errorResponse', () => {
  it('wraps a message in an error envelope without a code by default', async () => {
    const res = errorResponse('Not found.', 404);
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ success: false, error: 'Not found.' });
  });

  it('includes the code field when provided', async () => {
    const res = errorResponse('Not found.', 404, 'not_found');
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: 'Not found.',
      code: 'not_found',
    });
  });
});

describe('handleSupabaseAuthError', () => {
  const makeError = (code: string, status?: number, message = 'msg') => {
    const err = new AuthError(message, status, code);
    return err;
  };

  it('maps invalid_credentials to a 401 with a generic message', () => {
    const result = handleSupabaseAuthError(makeError('invalid_credentials', 400));
    expect(result).toEqual({
      message: 'Invalid email or password.',
      status: 401,
      code: 'invalid_credentials',
    });
  });

  it('maps user_not_found to a 200 with an anti-enumeration message', () => {
    const result = handleSupabaseAuthError(makeError('user_not_found', 404));
    expect(result.status).toBe(200);
    expect(result.message).toMatch(/if that email is registered/i);
  });

  it('maps over_email_send_rate_limit to a 429', () => {
    const result = handleSupabaseAuthError(makeError('over_email_send_rate_limit', 429));
    expect(result.status).toBe(429);
  });

  it('falls back to a generic message for unknown 5xx errors', () => {
    const result = handleSupabaseAuthError(makeError('some_new_code', 503, 'boom'));
    expect(result).toEqual({
      message: 'An unexpected error occurred. Please try again.',
      status: 503,
      code: 'some_new_code',
    });
  });

  it('surfaces the original message for unknown 4xx errors', () => {
    const result = handleSupabaseAuthError(makeError('some_new_code', 422, 'Field is invalid.'));
    expect(result).toEqual({
      message: 'Field is invalid.',
      status: 422,
      code: 'some_new_code',
    });
  });

  it('defaults status to 500 when the error has none', () => {
    const err = makeError('unmapped_code', undefined, 'weird');
    const result = handleSupabaseAuthError(err);
    expect(result.status).toBe(500);
    expect(result.message).toBe('An unexpected error occurred. Please try again.');
  });
});
