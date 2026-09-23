import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

const signInWithPassword = vi.fn();

vi.mock('@/libs/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { signInWithPassword },
  })),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
  });

  it('returns the user on successful sign-in', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    const res = await POST(makeRequest({ email: 'a@b.com', password: 'secret123' }));

    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret123' });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      success: true,
      data: { user: { id: 'user-1' } },
    });
  });

  it('rejects an invalid body with a 422 validation error', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: '' }));

    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe('validation_error');
  });

  it('maps invalid_credentials to a 401 with a generic message', async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new AuthError('Invalid login credentials', 400, 'invalid_credentials'),
    });

    const res = await POST(makeRequest({ email: 'a@b.com', password: 'wrong' }));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: 'Invalid email or password.',
      code: 'invalid_credentials',
    });
  });

  it('returns a 500 for malformed JSON in the request body', async () => {
    const badRequest = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: '{not valid json',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(badRequest);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: 'An unexpected error occurred.',
    });
  });
});
