-- ==========================================
-- COMPLETE DB REPAIR & ADMIN SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- ==========================================

-- 1. Create Table (if it doesn't exist)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add Missing Columns (Safe Migrations)
do $$
begin
  -- Add email
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='email') then
    alter table public.profiles add column email text;
  end if;
  
  -- Add full_name
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='full_name') then
    alter table public.profiles add column full_name text;
  end if;

  -- Add role
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='role') then
    alter table public.profiles add column role text default 'user';
  end if;

  -- Add phone_number
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='phone_number') then
    alter table public.profiles add column phone_number text;
  end if;

  -- Add address
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='address') then
    alter table public.profiles add column address text;
  end if;

  -- Add avatar_url (if needed)
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
end $$;

-- 3. Enable Security
alter table public.profiles enable row level security;

-- 4. Safe Policy Creation
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using ( true );

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );

-- 5. Create Trigger for New Users (Handles all fields)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, phone_number, address)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name', 
    'user', 
    new.raw_user_meta_data->>'phone_number', 
    new.raw_user_meta_data->>'address'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    address = excluded.address;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. SETUP ADMIN (EDIT EMAIL BELOW)
-- ***************************************************************
DO $$
DECLARE
  target_email text := 'admin@internal.com'; -- <<< CHANGE THIS EMAIL
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = target_user_id;
    RAISE NOTICE 'SUCCESS: User % is now an ADMIN.', target_email;
  ELSE
    RAISE NOTICE 'User % not found. Sign up first, then run this.', target_email;
  END IF;
END $$;
