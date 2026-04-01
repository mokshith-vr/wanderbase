-- Cities table
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text not null,
  country_code text not null,
  continent text not null,
  flag_emoji text,
  monthly_rent_usd integer,
  monthly_food_usd integer,
  monthly_transport_usd integer,
  monthly_utilities_usd integer,
  monthly_total_budget_usd integer,
  internet_speed_mbps integer,
  safety_score integer,
  english_proficiency text,
  coworking_count integer,
  timezone text,
  currency_code text,
  image_url text,
  description text,
  best_for text[],
  updated_at timestamptz default now()
);

-- Visa requirements table
create table if not exists visa_requirements (
  id uuid primary key default gen_random_uuid(),
  passport_country_code text not null,
  destination_country_code text not null,
  visa_type text not null,
  max_stay_days integer,
  evisa_link text,
  embassy_link text,
  notes text,
  last_verified_at timestamptz default now(),
  unique(passport_country_code, destination_country_code)
);

-- Jobs table
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  company_logo text,
  location_type text not null default 'remote',
  india_friendly boolean default true,
  salary_min_usd integer,
  salary_max_usd integer,
  tech_stack text[],
  job_url text not null,
  source text not null,
  is_featured boolean default false,
  posted_at timestamptz default now(),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Users table (mirrors Supabase auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar_url text,
  is_premium boolean default false,
  premium_expires_at timestamptz,
  created_at timestamptz default now()
);

-- Saved cities
create table if not exists saved_cities (
  user_id uuid references users(id) on delete cascade,
  city_id uuid references cities(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (user_id, city_id)
);

-- Enable Row Level Security
alter table cities enable row level security;
alter table visa_requirements enable row level security;
alter table jobs enable row level security;

-- Public read policies
create policy "Public read cities" on cities for select using (true);
create policy "Public read visa" on visa_requirements for select using (true);
create policy "Public read jobs" on jobs for select using (true);

-- RLS for users and saved_cities
alter table users enable row level security;
alter table saved_cities enable row level security;

create policy "Users can read own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = id);

create policy "Users can read own saved cities" on saved_cities for select using (auth.uid() = user_id);
create policy "Users can save cities" on saved_cities for insert with check (auth.uid() = user_id);
create policy "Users can unsave cities" on saved_cities for delete using (auth.uid() = user_id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
