-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
-- No "if not exists" on purpose: fails loudly if a table with this name already exists.

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_role text not null,
  status text not null default 'completed' check (status in ('completed', 'incomplete')),
  question_count integer not null default 5,
  messages jsonb not null default '[]',
  report jsonb,
  overall_score numeric(3,1),
  created_at timestamptz not null default now()
);

create index interview_sessions_user_idx on public.interview_sessions (user_id, created_at desc);

alter table public.interview_sessions enable row level security;

create policy "interviews select own" on public.interview_sessions for select using (auth.uid() = user_id);
create policy "interviews insert own" on public.interview_sessions for insert with check (auth.uid() = user_id);
create policy "interviews update own" on public.interview_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interviews delete own" on public.interview_sessions for delete using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.interview_sessions to authenticated;
