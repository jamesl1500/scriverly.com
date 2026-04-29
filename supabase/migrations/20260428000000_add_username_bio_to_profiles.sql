-- Migration: add_username_bio_to_profiles
-- Adds username and bio columns to the profiles table

alter table public.profiles
  add column if not exists username text unique,
  add column if not exists bio      text;

-- Enforce a sane username format at the DB level
alter table public.profiles
  add constraint profiles_username_format
    check (username ~ '^[a-zA-Z0-9_-]{3,30}$');
