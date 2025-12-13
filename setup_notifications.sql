-- 1. Create Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text,
  message text,
  type text check (type in ('invite', 'message', 'alert', 'info')),
  meta_data jsonb default '{}'::jsonb, -- Store disaster_id, etc.
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- Policies
drop policy if exists "Users can view their own notifications" on notifications;
create policy "Users can view their own notifications"
  on notifications for select
  using ( auth.uid() = user_id );

drop policy if exists "Admins can insert notifications" on notifications;
create policy "Admins can insert notifications"
  on notifications for insert
  with check ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
  
-- Allow users to update their own notifications (mark as read)
drop policy if exists "Users can update their own notifications" on notifications;
create policy "Users can update their own notifications"
  on notifications for update
  using ( auth.uid() = user_id );

-- 2. Helper to find User ID by Email (Security Critical: Only Admins)
-- We need a secure way for Admins to find a user_id by email to send an invite
create or replace function public.get_user_id_by_email(user_email text)
returns uuid as $$
declare
  target_id uuid;
begin
  -- Check if requester is admin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    return null;
  end if;

  select id into target_id from public.profiles where email = user_email;
  return target_id;
end;
$$ language plpgsql security definer;

-- 3. Trigger to notify admin when user accepts invite (Optional, simplifies frontend)
-- When a user updates status from 'invited' to 'joined', we could create a notification for admin
-- For now, we'll handle this in the frontend logic or keep it simple.
