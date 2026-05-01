-- AI analysis results table for essay editor
-- Applied via Supabase MCP (Scriverly project) on 2026-04-30

CREATE TABLE IF NOT EXISTS essay_ai_analyses (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id              uuid NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_hash          text NOT NULL,
  score                 integer NOT NULL CHECK (score >= 0 AND score <= 100),
  score_breakdown       jsonb NOT NULL DEFAULT '{}',
  style_recommendations jsonb NOT NULL DEFAULT '[]',
  spelling_grammar      jsonb NOT NULL DEFAULT '[]',
  overall_feedback      text NOT NULL DEFAULT '',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- One analysis per essay (upsert by essay_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_essay_ai_analyses_essay_unique ON essay_ai_analyses(essay_id);

-- Supporting indexes
CREATE INDEX IF NOT EXISTS idx_essay_ai_analyses_essay_id ON essay_ai_analyses(essay_id);
CREATE INDEX IF NOT EXISTS idx_essay_ai_analyses_user_id  ON essay_ai_analyses(user_id);

-- Row Level Security
ALTER TABLE essay_ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
  ON essay_ai_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON essay_ai_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
  ON essay_ai_analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON essay_ai_analyses FOR DELETE
  USING (auth.uid() = user_id);
