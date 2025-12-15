-- ==============================================================================
-- RELIEF CHAIN - SHOP MODULE SCHEMA
-- Run this in your Supabase SQL Editor to enable the Shop functionality.
-- ==============================================================================

-- 1. PRODUCTS TABLE
-- ==============================================================================
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  image_url text, -- optimized image URL
  stock integer default 0,
  description text,
  category text, -- e.g., 'T-Shirt', 'Hoodie', 'Sticker'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. INDEXES
-- ==============================================================================
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- 3. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.products enable row level security;

-- Policies
-- Anyone can view products
create policy "Public View Products" on public.products 
  for select using (true);

-- Only Admins can manage products (insert, update, delete)
create policy "Admins Manage Products" on public.products 
  for all using (public.is_admin());

-- 4. STORAGE BUCKET
-- ==============================================================================
-- Create 'products' bucket if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('products', 'products', true) 
on conflict (id) do nothing;

-- Storage Policies
-- Public read access
create policy "Public Access Products" on storage.objects 
  for select using ( bucket_id = 'products' );

-- Admin only upload/update access
create policy "Admins Upload Products" on storage.objects 
  for insert to authenticated with check ( 
    bucket_id = 'products' and public.is_admin() 
  );

create policy "Admins Update Products" on storage.objects 
  for update to authenticated using ( 
    bucket_id = 'products' and public.is_admin() 
  );

create policy "Admins Delete Products" on storage.objects 
  for delete to authenticated using ( 
    bucket_id = 'products' and public.is_admin() 
  );
