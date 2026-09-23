import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

const resetPasswordForEmail = vi.fn();

vi.mock('@/libs/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { resetPasswordForEmail },
  })),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    resetPasswordForEmail.mockReset();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://scriverly.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends a reset email and confirms with { sent: true }', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });

    const res = await POST(makeRequest({ email: 'a@b.com' }));

    expect(resetPasswordForEmail).toHaveBeenCalledWith('a@b.com', {
      redirectTo: 'https://scriverly.test/auth/callback',
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true, data: { sent: true } });
  });

  it('returns { sent: true } even when the email is not registered (anti-enumeration)', async () => {
    resetPasswordForEmail.mockResolvedValue({
      error: new AuthError('User not found', 404, 'user_not_found'),
    });

    const res = await POST(makeRequest({ email: 'nobody@example.com' }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true, data: { sent: true } });
  });

  it('surfaces a rate-limit error as a 429', async () => {
    resetPasswordForEmail.mockResolvedValue({
      error: new AuthError('Too many requests', 429, 'over_email_send_rate_limit'),
    });

    const res = await POST(makeRequest({ email: 'a@b.com' }));

    expect(res.status).toBe(429);
  });

  it('rejects an invalid email with a 422 validation error', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }));

    expect(resetPasswordForEmail).not.toHaveBeenCalled();
    expect(res.status).toBe(422);
  });

  it('returns a 500 misconfiguration error when NEXT_PUBLIC_APP_URL is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    const res = await POST(makeRequest({ email: 'a@b.com' }));

    expect(resetPasswordForEmail).not.toHaveBeenCalled();
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.code).toBe('misconfiguration');
  });
});
