-- Add status column to disaster_volunteers
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='disaster_volunteers' and column_name='status') then
    alter table public.disaster_volunteers add column status text default 'joined';
  end if;
end $$;

-- Policy Update: Ensure Admins can update this table
drop policy if exists "Admins can update volunteers" on disaster_volunteers;
create policy "Admins can update volunteers"
  on disaster_volunteers
  for update
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow Admins to select all
drop policy if exists "Admins can view all volunteers" on disaster_volunteers;
create policy "Admins can view all volunteers"
  on disaster_volunteers
  for select
  using ( true ); 
  -- Existing select policy was "true" for everyone, so this is redundant but safe to be explicit if needed.
  -- The previous "Volunteers are viewable by everyone" covers it.
