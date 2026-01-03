-- ==============================================================================
-- RELIEF CHAIN - MEDICAL MODULE SCHEMA (FIXED)
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. Create table if it doesn't exist
create table if not exists public.medical_cases (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Add Columns safely (if they don't exist)
-- This handles the case where the table already existed but was missing columns.

do $$
begin
    -- Text Columns
    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'title') then
        alter table public.medical_cases add column title text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'patient_name') then
         alter table public.medical_cases add column patient_name text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'hospital_name') then
         alter table public.medical_cases add column hospital_name text;
    end if;

     if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'condition') then
         alter table public.medical_cases add column condition text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'description') then
         alter table public.medical_cases add column description text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'bkash_number') then
         alter table public.medical_cases add column bkash_number text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'image_url') then
         alter table public.medical_cases add column image_url text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'documents_url') then
         alter table public.medical_cases add column documents_url text;
    end if;
    
    -- Status & Severity (using text to avoid enum conflicts)
    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'severity') then
         alter table public.medical_cases add column severity text default 'medium';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'status') then
         alter table public.medical_cases add column status text default 'pending';
    end if;

    -- Numeric/Integer Columns
    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'target_amount') then
         alter table public.medical_cases add column target_amount numeric default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'collected_amount') then
         alter table public.medical_cases add column collected_amount numeric default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'volunteers_needed') then
         alter table public.medical_cases add column volunteers_needed integer default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'assigned_volunteers_count') then
         alter table public.medical_cases add column assigned_volunteers_count integer default 0;
    end if;

    -- Arrays & Booleans
    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'gallery') then
         alter table public.medical_cases add column gallery text[];
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'is_urgent') then
         alter table public.medical_cases add column is_urgent boolean default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'medical_cases' and column_name = 'created_by') then
         alter table public.medical_cases add column created_by uuid references auth.users(id);
    end if;

end $$;


-- 3. DROP indexes if they exist to avoid errors, then recreate
-- ==============================================================================
drop index if exists idx_medical_status;
drop index if exists idx_medical_created_at;
drop index if exists idx_medical_severity;
drop index if exists idx_medical_is_urgent;

create index idx_medical_status on public.medical_cases(status);
create index idx_medical_created_at on public.medical_cases(created_at desc);
create index idx_medical_severity on public.medical_cases(severity);
create index idx_medical_is_urgent on public.medical_cases(is_urgent) where is_urgent = true;


-- 4. RLS POLICIES (Drop existing to avoid conflicts)
-- ==============================================================================
alter table public.medical_cases enable row level security;

drop policy if exists "Public View Active Medical" on public.medical_cases;
drop policy if exists "Users View Own Pending Medical" on public.medical_cases;
drop policy if exists "Volunteers Create Medical" on public.medical_cases;
drop policy if exists "Admins Full Access Medical" on public.medical_cases;

create policy "Public View Active Medical" on public.medical_cases 
  for select using (status = 'active');

create policy "Users View Own Pending Medical" on public.medical_cases 
  for select using (auth.uid() = created_by);

create policy "Volunteers Create Medical" on public.medical_cases 
  for insert with check (auth.role() = 'authenticated');

create policy "Admins Full Access Medical" on public.medical_cases 
  for all using (public.is_admin());


-- 5. STORAGE BUCKET
-- ==============================================================================
insert into storage.buckets (id, name, public) 
values ('medical', 'medical', true) 
on conflict (id) do nothing;

-- Storage policies can be tricky with conflicts, best to attempt insert, if fails usually fine as it exists
-- Dropping storage policies is safer if re-running
drop policy if exists "Public Access Medical Files" on storage.objects;
drop policy if exists "Authenticated Upload Medical" on storage.objects;

create policy "Public Access Medical Files" on storage.objects 
  for select using ( bucket_id = 'medical' );

create policy "Authenticated Upload Medical" on storage.objects 
  for insert to authenticated with check ( bucket_id = 'medical' );
