import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

const signUp = vi.fn();

vi.mock('@/libs/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { signUp },
  })),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  password: 'secret123',
  confirmPassword: 'secret123',
};

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    signUp.mockReset();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://scriverly.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a user and reports that email confirmation is required', async () => {
    signUp.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [{ id: 'identity-1' }] }, session: null },
      error: null,
    });

    const res = await POST(makeRequest(validBody));

    expect(signUp).toHaveBeenCalledWith({
      email: validBody.email,
      password: validBody.password,
      options: {
        data: { full_name: validBody.fullName },
        emailRedirectTo: 'https://scriverly.test/auth/callback',
      },
    });
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({
      success: true,
      data: { user: { id: 'user-1', identities: [{ id: 'identity-1' }] }, requiresEmailConfirmation: true },
    });
  });

  it('reports no confirmation required when a session is returned', async () => {
    signUp.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [{ id: 'identity-1' }] }, session: { access_token: 'x' } },
      error: null,
    });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(json.data.requiresEmailConfirmation).toBe(false);
  });

  it('treats an empty identities array as an existing account (409)', async () => {
    signUp.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [] }, session: null },
      error: null,
    });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: 'An account with this email already exists.',
      code: 'email_exists',
    });
  });

  it('rejects a mismatched confirmPassword with a 422 validation error', async () => {
    const res = await POST(makeRequest({ ...validBody, confirmPassword: 'different' }));

    expect(signUp).not.toHaveBeenCalled();
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('validation_error');
  });

  it('maps a weak_password AuthError to a 422', async () => {
    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthError('Password too weak', 422, 'weak_password'),
    });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: 'Password is too weak. Please choose a stronger password.',
      code: 'weak_password',
    });
  });

  it('returns a 500 misconfiguration error when NEXT_PUBLIC_APP_URL is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    const res = await POST(makeRequest(validBody));

    expect(signUp).not.toHaveBeenCalled();
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.code).toBe('misconfiguration');
  });
});
