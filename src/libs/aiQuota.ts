/**
 * aiQuota.ts
 * -----------
 * Server-side utility for checking and incrementing AI feature usage.
 * Premium users bypass all limits. Free users are capped per calendar month.
 *
 * Usage:
 *   const result = await checkAndIncrementQuota(supabase, userId, 'analysis');
 *   if (!result.allowed) return errorResponse('quota_exceeded', 402, 'quota_exceeded');
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { FREE_ANALYSIS_LIMIT, FREE_OUTLINE_LIMIT } from '@/config/consts';

export type QuotaType = 'analysis' | 'outline';

export interface QuotaResult {
  allowed:  boolean;
  used:     number;
  limit:    number | null; // null = unlimited (premium)
}

/** Returns the current billing period as 'YYYY-MM'. */
function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function limitFor(type: QuotaType): number {
  return type === 'analysis' ? FREE_ANALYSIS_LIMIT : FREE_OUTLINE_LIMIT;
}

/**
 * Checks whether the user is allowed to run an AI feature.
 * If allowed AND the user is on the free tier, atomically increments their usage.
 * Premium users always receive { allowed: true, used: 0, limit: null }.
 */
export async function checkAndIncrementQuota(
  supabase: SupabaseClient,
  userId: string,
  type: QuotaType,
): Promise<QuotaResult> {
  // 1. Read the user's plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (profile?.plan === 'premium') {
    return { allowed: true, used: 0, limit: null };
  }

  const limit  = limitFor(type);
  const period = currentPeriod();

  // 2. Read current usage
  const { data: row } = await supabase
    .from('ai_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('period', period)
    .single();

  const used = row?.count ?? 0;

  if (used >= limit) {
    return { allowed: false, used, limit };
  }

  // 3. Upsert — increment atomically
  await supabase.from('ai_usage').upsert(
    { user_id: userId, type, period, count: used + 1 },
    { onConflict: 'user_id,type,period' },
  );

  return { allowed: true, used: used + 1, limit };
}

/**
 * Read-only quota fetch — used by the /api/user/plan endpoint.
 * Does NOT increment.
 */
export async function getQuotaUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  plan: string;
  analysis: { used: number; limit: number | null };
  outline:  { used: number; limit: number | null };
}> {
  const period = currentPeriod();

  const [profileRes, usageRes] = await Promise.all([
    supabase.from('profiles').select('plan').eq('user_id', userId).single(),
    supabase
      .from('ai_usage')
      .select('type, count')
      .eq('user_id', userId)
      .eq('period', period),
  ]);

  const plan     = profileRes.data?.plan ?? 'free';
  const isPremium = plan === 'premium';
  const rows     = usageRes.data ?? [];

  const find = (t: QuotaType) => rows.find(r => r.type === t)?.count ?? 0;

  return {
    plan,
    analysis: {
      used:  isPremium ? 0 : find('analysis'),
      limit: isPremium ? null : FREE_ANALYSIS_LIMIT,
    },
    outline: {
      used:  isPremium ? 0 : find('outline'),
      limit: isPremium ? null : FREE_OUTLINE_LIMIT,
    },
  };
}
