-- ============================================================
-- Security audit fixes — 2026-05-04
-- ============================================================

-- ── FIX 1 (CRITICAL): Prevent users from self-upgrading billing fields ───────
-- The existing UPDATE policy has no WITH CHECK, so a user can POST directly to
-- Supabase's REST API and set plan='premium' on their own row.
-- Solution: tighten WITH CHECK so billing columns cannot be changed by users.
-- The service role (webhook) bypasses RLS entirely and is unaffected.

DROP POLICY IF EXISTS "profiles: update own" ON public.profiles;

CREATE POLICY "profiles: update own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Billing fields must remain equal to current stored values
    AND plan                  = (SELECT plan                  FROM public.profiles p WHERE p.user_id = auth.uid())
    AND stripe_customer_id    IS NOT DISTINCT FROM (SELECT stripe_customer_id    FROM public.profiles p WHERE p.user_id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.profiles p WHERE p.user_id = auth.uid())
    AND plan_expires_at        IS NOT DISTINCT FROM (SELECT plan_expires_at        FROM public.profiles p WHERE p.user_id = auth.uid())
  );


-- ── FIX 2 (BUG): Faculty essay policy used profiles.id instead of user_id ───
-- profiles.id is an auto-generated UUID; the auth UUID lives in profiles.user_id.
-- This policy always evaluated to false, meaning faculty could never read essays.

DROP POLICY IF EXISTS "Faculty can read submitted essays" ON public.essays;

CREATE POLICY "Faculty can read submitted essays"
  ON public.essays
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'faculty'::user_role
    )
    AND status = 'submitted'::essay_status
  );


-- ── FIX 3 (HIGH): Revoke unnecessary anon write grants ───────────────────────
-- No unauthenticated write path exists. RLS is the only guard; remove the
-- anon role's write privileges so a future policy mistake can't expose data.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON public.profiles
  FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON public.essays
  FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON public.essay_ai_analyses
  FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON public.ai_usage
  FROM anon;

-- Also revoke SELECT on tables that have no public read use-case
REVOKE SELECT
  ON public.essays, public.essay_ai_analyses, public.ai_usage
  FROM anon;
