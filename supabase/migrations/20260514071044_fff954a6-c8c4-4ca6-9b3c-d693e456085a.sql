
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  weight_kg numeric,
  height_cm numeric,
  age int,
  sex text,
  goal text,
  diet_plan jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- WORKOUT LOGS
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  plan_key text not null,
  workout_name text,
  exercises jsonb,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.workout_logs enable row level security;
create policy "own workout select" on public.workout_logs for select using (auth.uid() = user_id);
create policy "own workout insert" on public.workout_logs for insert with check (auth.uid() = user_id);
create policy "own workout update" on public.workout_logs for update using (auth.uid() = user_id);
create index on public.workout_logs(user_id, log_date);

-- CUSTOM WORKOUTS
create table public.custom_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  day_of_week int,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.custom_workouts enable row level security;
create policy "own cw all" on public.custom_workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RUNS
create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_date date not null default current_date,
  km numeric not null default 0,
  calories numeric not null default 0,
  duration_min int,
  type text default 'corrida',
  created_at timestamptz not null default now()
);
alter table public.runs enable row level security;
create policy "own runs all" on public.runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FINANCE GOALS
create table public.finance_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  deadline date,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.finance_goals enable row level security;
create policy "own fg all" on public.finance_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FINANCE ENTRIES
create table public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  type text not null,
  category text,
  amount numeric not null,
  description text,
  created_at timestamptz not null default now()
);
alter table public.finance_entries enable row level security;
create policy "own fe all" on public.finance_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FOOD LOGS
create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  meal_type text not null,
  food text not null,
  calories numeric default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  created_at timestamptz not null default now()
);
alter table public.food_logs enable row level security;
create policy "own food all" on public.food_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WATER LOGS
create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  cups int not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, log_date)
);
alter table public.water_logs enable row level security;
create policy "own water all" on public.water_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- READING LOGS
create table public.reading_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  minutes int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, log_date)
);
alter table public.reading_logs enable row level security;
create policy "own reading all" on public.reading_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PRAYER LOGS (semanal)
create table public.prayer_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  day_of_week int not null,
  prayed boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, week_start, day_of_week)
);
alter table public.prayer_logs enable row level security;
create policy "own prayer all" on public.prayer_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GRATITUDE
create table public.gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.gratitude_entries enable row level security;
create policy "own grat all" on public.gratitude_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SLEEP LOGS
create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  bedtime time,
  wake_time time,
  hours numeric,
  quality int,
  created_at timestamptz not null default now()
);
alter table public.sleep_logs enable row level security;
create policy "own sleep all" on public.sleep_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DAILY CHECKLIST
create table public.daily_checklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  water_done boolean not null default false,
  meals_done boolean not null default false,
  workout_done boolean not null default false,
  reading_done boolean not null default false,
  prayer_done boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, log_date)
);
alter table public.daily_checklist enable row level security;
create policy "own check all" on public.daily_checklist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI DAILY CONTENT (orações + versículos do dia, compartilhado entre usuários)
create table public.ai_daily_content (
  content_date date primary key,
  prayers jsonb not null,
  verses jsonb not null,
  gratitude_tip text,
  saving_tip text,
  created_at timestamptz not null default now()
);
alter table public.ai_daily_content enable row level security;
create policy "ai content read" on public.ai_daily_content for select using (auth.uid() is not null);
