-- Tracks monthly AI usage per user per feature type
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type     text        NOT NULL CHECK (type IN ('analysis', 'outline')),
  period   text        NOT NULL,  -- 'YYYY-MM'
  count    integer     NOT NULL DEFAULT 0,
  CONSTRAINT ai_usage_unique UNIQUE (user_id, type, period)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_period
  ON public.ai_usage(user_id, period);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage: select own"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ai_usage: insert own"
  ON public.ai_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_usage: update own"
  ON public.ai_usage FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
