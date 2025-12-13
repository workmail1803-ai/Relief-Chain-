-- =============================================
-- 1. CORE PROFILES (Run this first)
-- =============================================
-- Requirement: Primary Key is Email
create table if not exists public.profiles (
  email text not null primary key,
  id uuid references auth.users on delete cascade not null unique,
  full_name text,
  phone_number text,
  address text,
  role text default 'user' check (role in ('user', 'volunteer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Helper function to check admin role without recursion (Security Definer bypasses RLS)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Admins can read all profiles (Uses the helper function)
create policy "Admins can read all profiles" on public.profiles
  for all using (public.is_admin());

-- Trigger for new users
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (email, id, full_name, phone_number, address, role)
  values (new.email, new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone_number', new.raw_user_meta_data->>'address', 'user');
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end;
$$;

-- =============================================
-- 2. ENUMS & UTILITIES
-- =============================================
do $$ begin
    create type mission_status as enum ('active', 'completed', 'urgent');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type app_status as enum ('pending', 'approved', 'rejected');
exception
    when duplicate_object then null;
end $$;

-- =============================================
-- 3. UPDATE PROFILES (Adding Volunteer Fields)
-- =============================================
alter table public.profiles 
add column if not exists nid_number text,
add column if not exists t_shirt_size text,
add column if not exists is_volunteer_verified boolean default false,
add column if not exists total_donated numeric default 0;

-- =============================================
-- 4. DISASTER & MEDICAL MODULES
-- =============================================

create table if not exists public.disasters (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  target_amount numeric default 0,
  collected_amount numeric default 0,
  assigned_volunteers_count int default 0,
  image_url text,
  is_urgent boolean default false,
  status mission_status default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

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

-- =============================================
-- 5. DONATION MODULE
-- =============================================

create table if not exists public.donations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id), 
  amount numeric not null,
  payment_method text check (payment_method in ('bkash', 'card')),
  donation_type text check (donation_type in ('general', 'disaster', 'medical', 'zakat')),
  disaster_id uuid references public.disasters(id),
  medical_id uuid references public.medical_cases(id),
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================
-- 6. VOLUNTEER MISSION SYSTEM
-- =============================================

create table if not exists public.volunteer_applications (
  id uuid default gen_random_uuid() primary key,
  volunteer_id uuid references public.profiles(id) not null,
  disaster_id uuid references public.disasters(id) not null,
  status app_status default 'pending',
  applied_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================
-- 7. MERCHANDISE SHOP
-- =============================================

create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  image_url text,
  stock integer default 0,
  description text,
  category text
);

create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  total_price numeric not null,
  shipping_address text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================
-- 8. NEWS FEED & TRANSPARENCY
-- =============================================

create table if not exists public.news_updates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  image_url text,
  related_disaster_id uuid references public.disasters(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric not null,
  receipt_image_url text,
  category text,
  expense_date timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================
-- 9. NOTIFICATIONS (Added mainly for updates/admin msgs)
-- =============================================

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  message text not null,
  type text check (type in ('info', 'alert', 'mission', 'success')),
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================
-- 10. SECURITY (RLS Policies)
-- =============================================

-- Enable RLS
alter table public.disasters enable row level security;
alter table public.medical_cases enable row level security;
alter table public.donations enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.orders enable row level security;
alter table public.notifications enable row level security;

-- Drop existing policies to avoid errors if re-running (optional but safer)
drop policy if exists "Public can view disasters" on public.disasters;
drop policy if exists "Public can view patients" on public.medical_cases;
drop policy if exists "Public can view products" on public.products;
drop policy if exists "Public can view news" on public.news_updates;
drop policy if exists "Users can donate" on public.donations;
drop policy if exists "Volunteers can apply" on public.volunteer_applications;
drop policy if exists "Users can place orders" on public.orders;
drop policy if exists "Users view own orders" on public.orders;
drop policy if exists "Volunteers view own apps" on public.volunteer_applications;
drop policy if exists "Users can read own notifications" on public.notifications;

-- Public Read
create policy "Public can view disasters" on public.disasters for select using (true);
create policy "Public can view patients" on public.medical_cases for select using (true);
create policy "Public can view products" on public.products for select using (true);
create policy "Public can view news" on public.news_updates for select using (true);

-- User Write
create policy "Users can donate" on public.donations for insert with check (true);
create policy "Volunteers can apply" on public.volunteer_applications for insert with check (auth.uid() = volunteer_id);
create policy "Users can place orders" on public.orders for insert with check (auth.uid() = user_id);

-- User Read Private
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Volunteers view own apps" on public.volunteer_applications for select using (auth.uid() = volunteer_id);
create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);

-- Add Severity Column
alter table public.disasters add column if not exists severity text default 'medium';
alter table public.disasters add column if not exists volunteers_needed int default 0;

-- Admin Policies (Simplified Check using Helper)
drop policy if exists "Admins manage disasters" on public.disasters;
create policy "Admins manage disasters" on public.disasters for all using (public.is_admin());

drop policy if exists "Admins manage medical" on public.medical_cases;
create policy "Admins manage medical" on public.medical_cases for all using (public.is_admin());

-- =============================================
-- 11. STORAGE BUCKET SETUP (Run this manually if needed)
-- =============================================
insert into storage.buckets (id, name, public) 
values ('disasters', 'disasters', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'disasters' );
create policy "Admin Upload" on storage.objects for insert with check ( bucket_id = 'disasters' );
