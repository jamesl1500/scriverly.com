import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const getClaims = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getClaims },
  })),
}));

import { updateSession } from './proxy';

function makeRequest(path: string) {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

/** Public routes that must remain reachable by anonymous visitors and crawlers. */
const publicPaths = [
  '/',
  '/about',
  '/changelog',
  '/contact',
  '/cookies',
  '/feedback',
  '/help-center',
  '/privacy',
  '/status',
  '/terms',
  '/login',
  '/signup',
  '/forgot_password',
  '/reset_password',
  '/verify-email',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
  '/opengraph-image',
  '/icon',
  '/apple-icon',
  '/api/auth/login',
  '/api/billing/webhook',
  '/auth/callback',
  '/features/essay-feedback',
  '/guides',
  // Unknown and look-alike paths fall through to the router's 404 page
  '/does-not-exist',
  '/essays-guide',
];

/** Routes that require an authenticated session. */
const protectedPaths = [
  '/dashboard',
  '/essays',
  '/essays/new',
  '/essays/abc-123',
  '/profile',
  '/settings',
  '/onboarding',
  '/api/essays',
  '/api/user/profile',
  '/api/billing/checkout',
];

describe('updateSession', () => {
  beforeEach(() => {
    getClaims.mockReset();
  });

  describe('unauthenticated visitors', () => {
    beforeEach(() => {
      getClaims.mockResolvedValue({ data: null });
    });

    it.each(publicPaths)('does not redirect a public path: %s', async (path) => {
      const response = await updateSession(makeRequest(path));
      expect(response.status).not.toBe(307);
      expect(response.headers.get('location')).toBeNull();
    });

    it.each(protectedPaths)('redirects a protected path to /login: %s', async (path) => {
      const response = await updateSession(makeRequest(path));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
    });
  });

  describe('authenticated visitors', () => {
    beforeEach(() => {
      getClaims.mockResolvedValue({ data: { claims: { sub: 'user-1' } } });
    });

    it.each(protectedPaths)('allows access to a protected path: %s', async (path) => {
      const response = await updateSession(makeRequest(path));
      expect(response.status).not.toBe(307);
      expect(response.headers.get('location')).toBeNull();
    });

    it('allows access to public paths too', async () => {
      const response = await updateSession(makeRequest('/'));
      expect(response.headers.get('location')).toBeNull();
    });
  });
});
