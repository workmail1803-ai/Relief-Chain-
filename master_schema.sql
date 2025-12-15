-- ==============================================================================
-- RELIEF CHAIN - MASTER SCHEMA
-- Combined & Corrected (Includes all recent fixes)
-- ==============================================================================

-- 1. UTILITY FUNCTIONS & ENUMS
-- ==============================================================================
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

do $$ begin
    create type public.mission_status as enum ('active', 'completed', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.app_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;


-- 2. CORE TABLES
-- ==============================================================================

-- PROFILES
create table if not exists public.profiles (
  email text not null primary key,
  id uuid references auth.users on delete cascade not null unique,
  full_name text,
  phone_number text,
  address text,
  role text default 'user' check (role in ('user', 'volunteer', 'admin')),
  nid_number text,
  t_shirt_size text,
  is_volunteer_verified boolean default false,
  total_donated numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DISASTERS
create table if not exists public.disasters (
  id uuid not null default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  target_amount numeric default 0,
  collected_amount numeric default 0,
  assigned_volunteers_count integer default 0,
  volunteers_needed integer default 0,
  image_url text,
  gallery text[],         -- Fixed: Added gallery array
  is_urgent boolean default false,
  severity text default 'medium',
  status public.mission_status default 'active',
  bkash_number text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- DONATIONS
create table if not exists public.donations (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id), 
  amount numeric not null,
  payment_method text check (payment_method in ('bkash', 'card')),
  donation_type text check (donation_type in ('general', 'disaster', 'medical', 'zakat')),
  disaster_id uuid references public.disasters(id) on delete set null, -- Fixed: Added FK
  medical_id uuid, -- Link to medical_cases if you have it
  transaction_id text,
  phone_last_4 text,      -- Fixed: Added phone_last_4
  status text default 'pending', -- Fixed: Added status
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- VOLUNTEER SYSTEM
create table if not exists public.disaster_volunteers (
  id uuid default gen_random_uuid() primary key,
  disaster_id uuid not null references public.disasters(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- Fixed: Link to profiles
  status text default 'pending', -- Fixed: Default pending
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text,
  message text not null,
  type text check (type in ('info', 'alert', 'mission', 'success', 'invite', 'message')),
  is_read boolean default false,
  meta_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- MEDICAL CASES (Optional but included in base)
create table if not exists public.medical_cases (
  id uuid default gen_random_uuid() primary key,
  patient_name text not null,
  condition text,
  hospital_name text,
  target_amount numeric default 0,
  collected_amount numeric default 0,
  image_url text,
  documents_url text,
  status mission_status default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- MERCHANDISE (Optional)
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  image_url text,
  stock integer default 0,
  description text,
  category text
);

-- 3. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

-- Enable RLS on all
alter table public.profiles enable row level security;
alter table public.disasters enable row level security;
alter table public.donations enable row level security;
alter table public.disaster_volunteers enable row level security;
alter table public.notifications enable row level security;
alter table public.medical_cases enable row level security;
alter table public.products enable row level security;

-- PROFILES
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles" on public.profiles for select using (public.is_admin());

-- DISASTERS
create policy "Public can view disasters" on public.disasters for select using (true);
create policy "Admins manage disasters" on public.disasters for all using (public.is_admin());

-- DONATIONS
drop policy if exists "Users can read own donations" on public.donations;
create policy "Users can read own donations" on public.donations for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all donations" on public.donations;
create policy "Admins can view all donations" on public.donations for select using (public.is_admin());

drop policy if exists "Users can donate" on public.donations;
create policy "Users can donate" on public.donations for insert with check (true);

drop policy if exists "Admins can update donations" on public.donations;
create policy "Admins can update donations" on public.donations for update using (public.is_admin());

-- VOLUNTEERS
drop policy if exists "Volunteers viewable by everyone" on public.disaster_volunteers;
create policy "Volunteers viewable by everyone" on public.disaster_volunteers for select using (true);

drop policy if exists "Users can join" on public.disaster_volunteers;
create policy "Users can join" on public.disaster_volunteers for insert with check (auth.uid() = user_id);

drop policy if exists "Users can leave" on public.disaster_volunteers;
create policy "Users can leave" on public.disaster_volunteers for delete using (auth.uid() = user_id);

drop policy if exists "Admins manage volunteers" on public.disaster_volunteers;
create policy "Admins manage volunteers" on public.disaster_volunteers for update using (public.is_admin());

-- NOTIFICATIONS
drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications" on public.notifications for delete using (auth.uid() = user_id);

drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Admins manage notifications" on public.notifications for all using (public.is_admin());


-- 4. TRIGGERS
-- ==============================================================================

-- Auto-create Profile on Signup
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (email, id, full_name, role)
  values (new.email, new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger logic for handling existing trigger creation safely
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end;
$$;

-- Update Volunteer Count
create or replace function public.handle_volunteer_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.disasters
    set assigned_volunteers_count = assigned_volunteers_count + 1
    where id = new.disaster_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.disasters
    set assigned_volunteers_count = assigned_volunteers_count - 1
    where id = old.disaster_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_volunteer_change on disaster_volunteers;
create trigger on_volunteer_change
  after insert or delete on disaster_volunteers
  for each row execute procedure public.handle_volunteer_count();
