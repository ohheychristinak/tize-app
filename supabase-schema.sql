-- ============================================
-- Tize App — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Tags table
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  color text not null default '#b06a3a',
  bg text not null default '#faf5f0',
  border text not null default '#e5d5c5',
  created_at timestamptz default now()
);

alter table public.tags enable row level security;
create policy "Users can manage their own tags"
  on public.tags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tasks table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tier text not null default 'today'
    check (tier in ('today','tomorrow','midweek','lateweek','nextweek','thismonth','later')),
  text text not null,
  tag text,
  note text,
  done boolean not null default false,
  pinned boolean not null default false,
  subtasks jsonb not null default '[]'::jsonb,
  expanded boolean not null default false,
  energy integer not null default 0 check (energy between -2 and 2),
  due_date date,
  recur jsonb, -- null, {type:"days",days:[]} or {type:"times",count,period}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Users can manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- Matrix scores table
create table public.matrix_scores (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  u_deadline integer not null default 0 check (u_deadline between 0 and 4),
  u_rupture integer not null default 0 check (u_rupture between 0 and 4),
  u_blocking integer not null default 0 check (u_blocking between 0 and 4),
  i_fills integer not null default 0 check (i_fills between 0 and 4),
  i_depends integer not null default 0 check (i_depends between 0 and 4),
  i_future integer not null default 0 check (i_future between 0 and 4),
  pos_x real,
  pos_y real,
  unique (task_id, user_id)
);

alter table public.matrix_scores enable row level security;
create policy "Users can manage their own matrix scores"
  on public.matrix_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Routine logs table
create table public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null,
  checked boolean not null default true,
  unique (date, user_id, item_id)
);

alter table public.routine_logs enable row level security;
create policy "Users can manage their own routine logs"
  on public.routine_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Routine config table
create table public.routine_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  morning_base jsonb not null default '[]'::jsonb,
  morning_kids jsonb not null default '[]'::jsonb,
  evening_base jsonb not null default '[]'::jsonb,
  evening_kids jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.routine_config enable row level security;
create policy "Users can manage their own routine config"
  on public.routine_config for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger routine_config_updated_at
  before update on public.routine_config
  for each row execute function public.handle_updated_at();
