import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { checkAndIncrementQuota, getQuotaUsage } from './aiQuota';
import { FREE_ANALYSIS_LIMIT, FREE_OUTLINE_LIMIT } from '@/config/consts';

/**
 * Builds a minimal chainable/thenable query-builder mock that mirrors how the
 * real Supabase client is used in aiQuota.ts:
 *   - `.select().eq()...eq().single()` resolves to `{ data: singleData }`
 *   - `.select().eq()...eq()` (no `.single()`, e.g. the ai_usage list query in
 *     getQuotaUsage) is itself awaited, so it must be thenable too — resolves
 *     to `{ data: listData }`
 *   - `.upsert(...)` resolves to `{ data: null, error: null }`
 */
function makeQueryBuilder(opts: { singleData?: unknown; listData?: unknown } = {}) {
  const { singleData = null, listData = null } = opts;

  interface QueryBuilder {
    select: () => QueryBuilder;
    eq: () => QueryBuilder;
    single: () => Promise<{ data: unknown; error: null }>;
    upsert: () => Promise<{ data: null; error: null }>;
    then: (resolve: (value: { data: unknown; error: null }) => void) => void;
  }

  const builder: QueryBuilder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: singleData, error: null })),
    upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: (resolve) => resolve({ data: listData, error: null }),
  };

  return builder;
}

function makeSupabase(opts: {
  profileData?: unknown;
  usageSingleData?: unknown;
  usageListData?: unknown;
}) {
  const profilesBuilder = makeQueryBuilder({ singleData: opts.profileData });
  const aiUsageBuilder = makeQueryBuilder({
    singleData: opts.usageSingleData,
    listData: opts.usageListData,
  });

  const from = vi.fn((table: string) => {
    if (table === 'profiles') return profilesBuilder;
    if (table === 'ai_usage') return aiUsageBuilder;
    throw new Error(`Unexpected table: ${table}`);
  });

  const supabase = { from } as unknown as SupabaseClient;

  return { supabase, profilesBuilder, aiUsageBuilder };
}

/** Mirrors the private currentPeriod() helper in aiQuota.ts. */
function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

describe('checkAndIncrementQuota', () => {
  it('always allows premium users and skips the usage upsert', async () => {
    const { supabase, aiUsageBuilder } = makeSupabase({
      profileData: { plan: 'premium' },
    });

    const result = await checkAndIncrementQuota(supabase, 'user-1', 'analysis');

    expect(result).toEqual({ allowed: true, used: 0, limit: null });
    expect(aiUsageBuilder.upsert).not.toHaveBeenCalled();
  });

  it('allows a free user under the analysis limit and increments usage', async () => {
    const { supabase, aiUsageBuilder } = makeSupabase({
      profileData: { plan: 'free' },
      usageSingleData: { count: 2 },
    });

    const result = await checkAndIncrementQuota(supabase, 'user-1', 'analysis');

    expect(result).toEqual({ allowed: true, used: 3, limit: FREE_ANALYSIS_LIMIT });
    expect(aiUsageBuilder.upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', type: 'analysis', period: currentPeriod(), count: 3 },
      { onConflict: 'user_id,type,period' },
    );
  });

  it('blocks a free user at the analysis limit and does not upsert', async () => {
    const { supabase, aiUsageBuilder } = makeSupabase({
      profileData: { plan: 'free' },
      usageSingleData: { count: FREE_ANALYSIS_LIMIT },
    });

    const result = await checkAndIncrementQuota(supabase, 'user-1', 'analysis');

    expect(result).toEqual({
      allowed: false,
      used: FREE_ANALYSIS_LIMIT,
      limit: FREE_ANALYSIS_LIMIT,
    });
    expect(aiUsageBuilder.upsert).not.toHaveBeenCalled();
  });

  it('blocks a free user over the outline limit and does not upsert', async () => {
    const { supabase, aiUsageBuilder } = makeSupabase({
      profileData: { plan: 'free' },
      usageSingleData: { count: FREE_OUTLINE_LIMIT + 1 },
    });

    const result = await checkAndIncrementQuota(supabase, 'user-1', 'outline');

    expect(result).toEqual({
      allowed: false,
      used: FREE_OUTLINE_LIMIT + 1,
      limit: FREE_OUTLINE_LIMIT,
    });
    expect(aiUsageBuilder.upsert).not.toHaveBeenCalled();
  });

  it('treats a user with no prior usage row as zero used and allows the request', async () => {
    const { supabase, aiUsageBuilder } = makeSupabase({
      profileData: { plan: 'free' },
      usageSingleData: null,
    });

    const result = await checkAndIncrementQuota(supabase, 'user-1', 'outline');

    expect(result).toEqual({ allowed: true, used: 1, limit: FREE_OUTLINE_LIMIT });
    expect(aiUsageBuilder.upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', type: 'outline', period: currentPeriod(), count: 1 },
      { onConflict: 'user_id,type,period' },
    );
  });
});

describe('getQuotaUsage', () => {
  it('returns unlimited, zero-used quotas for a premium user', async () => {
    const { supabase } = makeSupabase({
      profileData: { plan: 'premium' },
      usageListData: [
        { type: 'analysis', count: 10 },
        { type: 'outline', count: 10 },
      ],
    });

    const result = await getQuotaUsage(supabase, 'user-1');

    expect(result).toEqual({
      plan: 'premium',
      analysis: { used: 0, limit: null },
      outline: { used: 0, limit: null },
    });
  });

  it('returns actual usage counts and free-tier limits for a free user', async () => {
    const { supabase } = makeSupabase({
      profileData: { plan: 'free' },
      usageListData: [
        { type: 'analysis', count: 3 },
        { type: 'outline', count: 1 },
      ],
    });

    const result = await getQuotaUsage(supabase, 'user-1');

    expect(result).toEqual({
      plan: 'free',
      analysis: { used: 3, limit: FREE_ANALYSIS_LIMIT },
      outline: { used: 1, limit: FREE_OUTLINE_LIMIT },
    });
  });

  it('defaults to the free plan and zero usage when no rows exist', async () => {
    const { supabase } = makeSupabase({
      profileData: null,
      usageListData: [],
    });

    const result = await getQuotaUsage(supabase, 'user-1');

    expect(result).toEqual({
      plan: 'free',
      analysis: { used: 0, limit: FREE_ANALYSIS_LIMIT },
      outline: { used: 0, limit: FREE_OUTLINE_LIMIT },
    });
  });
});
