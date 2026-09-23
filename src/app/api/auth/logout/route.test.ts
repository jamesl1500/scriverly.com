import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const signOut = vi.fn();

vi.mock('@/libs/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { signOut },
  })),
}));

import { POST } from './route';

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    signOut.mockReset();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://scriverly.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('signs the user out and redirects to /login', async () => {
    signOut.mockResolvedValue({ error: null });

    const res = await POST();

    expect(signOut).toHaveBeenCalled();
    expect(res.status).toBe(303);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login');
  });

  it('still redirects to /login if signing out throws', async () => {
    signOut.mockRejectedValue(new Error('network down'));

    const res = await POST();

    expect(res.status).toBe(303);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/login');
  });
});
