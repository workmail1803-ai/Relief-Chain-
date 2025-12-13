-- ==========================================
-- PROMOTE USER TO ADMIN
-- ==========================================

-- 1. Replace 'YOUR_EMAIL@GMAIL.COM' with your actual email address below.
-- 2. Run this query in Supabase SQL Editor.

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@GMAIL.COM'
);

-- Verification:
-- SELECT * FROM public.profiles WHERE role = 'admin';
