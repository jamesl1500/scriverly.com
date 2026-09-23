import { describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const updateSession = vi.fn();

vi.mock('@/libs/supabase/proxy', () => ({
  updateSession: (...args: unknown[]) => updateSession(...args),
}));

import { proxy, config } from './proxy';

describe('proxy', () => {
  it('delegates to updateSession with the incoming request', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    const expected = NextResponse.next();
    updateSession.mockResolvedValue(expected);

    const result = await proxy(request);

    expect(updateSession).toHaveBeenCalledWith(request);
    expect(result).toBe(expected);
  });

  it('excludes static assets and image optimization routes from the matcher', () => {
    expect(config.matcher[0]).toContain('_next/static');
    expect(config.matcher[0]).toContain('_next/image');
    expect(config.matcher[0]).toContain('favicon');
  });
});
