import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { AuthError } from '@supabase/supabase-js';

const getSession = vi.fn();
const updateUser = vi.fn();
const signOut = vi.fn();

vi.mock('@/libs/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getSession, updateUser, signOut },
  })),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = { password: 'newpassword1', confirmPassword: 'newpassword1' };

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    getSession.mockReset();
    updateUser.mockReset();
    signOut.mockReset();
  });

  it('rejects when there is no active session', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });

    const res = await POST(makeRequest(validBody));

    expect(updateUser).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.code).toBe('session_missing');
  });

  it('updates the password and signs out other sessions on success', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'x' } }, error: null });
    updateUser.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({ error: null });

    const res = await POST(makeRequest(validBody));

    expect(updateUser).toHaveBeenCalledWith({ password: validBody.password });
    expect(signOut).toHaveBeenCalledWith({ scope: 'others' });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true, data: { updated: true } });
  });

  it('maps a same_password AuthError to a 422 and does not sign out other sessions', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'x' } }, error: null });
    updateUser.mockResolvedValue({
      error: new AuthError('Same password', 422, 'same_password'),
    });

    const res = await POST(makeRequest(validBody));

    expect(signOut).not.toHaveBeenCalled();
    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: 'Your new password cannot be the same as your current password.',
      code: 'same_password',
    });
  });

  it('rejects a mismatched confirmPassword with a 422 validation error', async () => {
    const res = await POST(makeRequest({ password: 'newpassword1', confirmPassword: 'nope' }));

    expect(getSession).not.toHaveBeenCalled();
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('validation_error');
  });
});
