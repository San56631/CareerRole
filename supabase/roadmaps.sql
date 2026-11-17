-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
-- NOTE: no "if not exists" on purpose. If a table with the same name already
-- exists from an older setup this will fail loudly instead of silently skipping.

create table public.saved_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  target_role text not null,
  readiness_score integer,
  matched_skills jsonb not null default '[]',
  missing_skills jsonb not null default '[]',
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roadmap_tasks (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.saved_roadmaps(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  phase_index integer not null,
  phase_label text not null,
  phase_focus text,
  position integer not null,
  title text not null,
  completed boolean not null default false,
  completed_at timestamptz
);

create index saved_roadmaps_user_idx on public.saved_roadmaps (user_id, created_at desc);
create index roadmap_tasks_roadmap_idx on public.roadmap_tasks (roadmap_id, phase_index, position);

alter table public.saved_roadmaps enable row level security;
alter table public.roadmap_tasks enable row level security;

create policy "roadmaps select own" on public.saved_roadmaps for select using (auth.uid() = user_id);
create policy "roadmaps insert own" on public.saved_roadmaps for insert with check (auth.uid() = user_id);
create policy "roadmaps update own" on public.saved_roadmaps for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "roadmaps delete own" on public.saved_roadmaps for delete using (auth.uid() = user_id);

create policy "tasks select own" on public.roadmap_tasks for select using (auth.uid() = user_id);
create policy "tasks insert own" on public.roadmap_tasks for insert with check (auth.uid() = user_id);
create policy "tasks update own" on public.roadmap_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks delete own" on public.roadmap_tasks for delete using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.saved_roadmaps to authenticated;
grant select, insert, update, delete on public.roadmap_tasks to authenticated;
