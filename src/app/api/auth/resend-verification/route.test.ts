import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

const resend = vi.fn();

vi.mock('@/libs/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { resend },
  })),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/resend-verification', () => {
  beforeEach(() => {
    resend.mockReset();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://scriverly.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resends the signup confirmation email', async () => {
    resend.mockResolvedValue({ error: null });

    const res = await POST(makeRequest({ email: 'a@b.com' }));

    expect(resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'a@b.com',
      options: { emailRedirectTo: 'https://scriverly.test/auth/callback' },
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true, data: { sent: true } });
  });

  it('surfaces a rate-limit error as a 429', async () => {
    resend.mockResolvedValue({
      error: new AuthError('Too many requests', 429, 'over_request_rate_limit'),
    });

    const res = await POST(makeRequest({ email: 'a@b.com' }));

    expect(res.status).toBe(429);
  });

  it('rejects an invalid email with a 422 validation error', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }));

    expect(resend).not.toHaveBeenCalled();
    expect(res.status).toBe(422);
  });

  it('returns a 500 misconfiguration error when NEXT_PUBLIC_APP_URL is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    const res = await POST(makeRequest({ email: 'a@b.com' }));

    expect(resend).not.toHaveBeenCalled();
    expect(res.status).toBe(500);
  });
});
