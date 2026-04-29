-- Migration: create_essays_table
-- 2026-04-29

-- ============================================================
-- 1. essays table
-- ============================================================
create table if not exists public.essays (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,

  -- Content
  title               text        not null default 'Untitled Essay',
  topic               text,
  summary             text,
  content             jsonb       not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,

  -- Configuration
  essay_type          text        check (essay_type in ('argumentative','analytical','expository','persuasive','narrative','descriptive','comparative')),
  academic_level      text        check (academic_level in ('high_school','undergraduate','graduate','doctoral')),
  citation_style      text        check (citation_style in ('APA','MLA','Chicago')),

  -- Goals
  word_goal           integer     check (word_goal > 0),
  due_date            date,
  start_with_outline  boolean     not null default false,
  outline             jsonb,        -- reserved for AI-generated outline

  -- Tracking
  status              text        not null default 'draft' check (status in ('draft','in_progress','complete')),
  word_count          integer     not null default 0,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- 2. Row-Level Security
-- ============================================================
alter table public.essays enable row level security;

create policy "essays: select own"
  on public.essays for select
  using (auth.uid() = user_id);

create policy "essays: insert own"
  on public.essays for insert
  with check (auth.uid() = user_id);

create policy "essays: update own"
  on public.essays for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "essays: delete own"
  on public.essays for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. Auto-update updated_at
-- ============================================================
drop trigger if exists essays_set_updated_at on public.essays;
create trigger essays_set_updated_at
  before update on public.essays
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 4. Index for fast user essay listing
-- ============================================================
create index if not exists essays_user_id_updated_at_idx
  on public.essays(user_id, updated_at desc);
