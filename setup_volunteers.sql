-- ==========================================
-- VOLUNTEER FEATURE SETUP
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Create Junction Table
create table if not exists public.disaster_volunteers (
  id uuid default gen_random_uuid() primary key,
  disaster_id uuid references public.disasters(id) not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (disaster_id, user_id)
);

-- 2. Enable Security
alter table public.disaster_volunteers enable row level security;

-- 3. Policies
create policy "Volunteers are viewable by everyone"
  on disaster_volunteers for select
  using ( true );

create policy "Users can join as volunteer"
  on disaster_volunteers for insert
  with check ( auth.uid() = user_id );

create policy "Users can leave (delete own record)"
  on disaster_volunteers for delete
  using ( auth.uid() = user_id );

-- 4. Trigger to Update Counts
-- This ensures the `disasters` table count is always accurate
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

-- 5. Fix Disasters count default just in case
alter table public.disasters 
alter column assigned_volunteers_count set default 0;

-- Optional: Recalculate existing counts if table was used before (unlikely but safe)
-- update public.disasters d
-- set assigned_volunteers_count = (select count(*) from public.disaster_volunteers where disaster_id = d.id);
