-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.citations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL,
  user_id uuid NOT NULL,
  raw_text text NOT NULL,
  author text,
  title text,
  publication text,
  year integer,
  url text,
  doi text,
  page_range text,
  formatted_apa text,
  formatted_mla text,
  formatted_chicago text,
  active_style USER-DEFINED NOT NULL DEFAULT 'APA'::citation_style,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT citations_pkey PRIMARY KEY (id),
  CONSTRAINT citations_essay_id_fkey FOREIGN KEY (essay_id) REFERENCES public.essays(id),
  CONSTRAINT citations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.essay_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content jsonb NOT NULL,
  word_count integer NOT NULL DEFAULT 0,
  label text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT essay_versions_pkey PRIMARY KEY (id),
  CONSTRAINT essay_versions_essay_id_fkey FOREIGN KEY (essay_id) REFERENCES public.essays(id),
  CONSTRAINT essay_versions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.essays (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  subject text,
  prompt_text text,
  essay_type USER-DEFINED NOT NULL DEFAULT 'argumentative'::essay_type,
  academic_level USER-DEFINED NOT NULL DEFAULT 'undergraduate'::academic_level,
  citation_style USER-DEFINED NOT NULL DEFAULT 'APA'::citation_style,
  word_count_goal integer CHECK (word_count_goal > 0),
  due_date date,
  content jsonb,
  word_count integer NOT NULL DEFAULT 0,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::essay_status,
  thesis_statement text,
  detected_tone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_saved_at timestamp with time zone,
  CONSTRAINT essays_pkey PRIMARY KEY (id),
  CONSTRAINT essays_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.faculty_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL,
  faculty_id uuid NOT NULL,
  paragraph_index integer NOT NULL,
  char_from integer,
  char_to integer,
  comment_text text NOT NULL,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT faculty_comments_pkey PRIMARY KEY (id),
  CONSTRAINT faculty_comments_essay_id_fkey FOREIGN KEY (essay_id) REFERENCES public.essays(id),
  CONSTRAINT faculty_comments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.feedback_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL,
  user_id uuid NOT NULL,
  scores jsonb NOT NULL,
  summary text,
  strengths ARRAY,
  improvements ARRAY,
  word_count_at integer,
  rubric_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_reports_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_reports_essay_id_fkey FOREIGN KEY (essay_id) REFERENCES public.essays(id),
  CONSTRAINT feedback_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT fk_report_rubric FOREIGN KEY (rubric_id) REFERENCES public.rubrics(id)
);
CREATE TABLE public.outline_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL,
  section USER-DEFINED NOT NULL,
  position integer NOT NULL,
  heading text NOT NULL,
  talking_point text,
  is_complete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT outline_items_pkey PRIMARY KEY (id),
  CONSTRAINT outline_items_essay_id_fkey FOREIGN KEY (essay_id) REFERENCES public.essays(id)
);
CREATE TABLE public.profiles (
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  username text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bio text,
  onboarding_completed boolean DEFAULT false,
  academic_level USER-DEFINED DEFAULT 'undergraduate'::academic_level,
  role USER-DEFINED DEFAULT 'student'::user_role,
  default_citation_style text DEFAULT 'APA'::text,
  default_essay_type text,
  institution text,
  department text,
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id, id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.rubrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  criteria jsonb NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rubrics_pkey PRIMARY KEY (id),
  CONSTRAINT rubrics_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  essay_id uuid NOT NULL,
  user_id uuid NOT NULL,
  suggestion_type USER-DEFINED NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::suggestion_status,
  original_text text NOT NULL,
  suggestion_text text NOT NULL,
  rewrite_text text,
  paragraph_index integer,
  char_from integer,
  char_to integer,
  confidence integer CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT suggestions_pkey PRIMARY KEY (id),
  CONSTRAINT suggestions_essay_id_fkey FOREIGN KEY (essay_id) REFERENCES public.essays(id),
  CONSTRAINT suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);