-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_role text not null,
  file_name text,
  score integer not null,
  strengths jsonb not null default '[]',
  weaknesses jsonb not null default '[]',
  suggestions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists resume_analyses_user_created_idx
  on public.resume_analyses (user_id, created_at desc);

-- Row Level Security: each user can only touch their own rows
alter table public.resume_analyses enable row level security;

create policy "read own analyses" on public.resume_analyses
  for select using (auth.uid() = user_id);
create policy "insert own analyses" on public.resume_analyses
  for insert with check (auth.uid() = user_id);
create policy "delete own analyses" on public.resume_analyses
  for delete using (auth.uid() = user_id);

-- Newer Supabase projects don't auto-grant table access to logged-in users
grant usage on schema public to authenticated;
grant select, insert, delete on public.resume_analyses to authenticated;
