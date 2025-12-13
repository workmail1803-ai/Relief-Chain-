-- ==================================================
-- SUPABASE PERFORMANCE OPTIMIZATION SCRIPT
-- Run this in your Supabase SQL Editor to speed up queries
-- ==================================================

-- 1. Donations Table Indexes
-- Used for: Admin Dashboard (filtering/sorting), User Profile (history)
CREATE INDEX IF NOT EXISTS idx_donations_disaster_id ON public.donations(disaster_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);

-- 2. Disasters Table Indexes
-- Used for: Main Feed (sorting by date), Filtering by Urgency
CREATE INDEX IF NOT EXISTS idx_disasters_created_at ON public.disasters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disasters_is_urgent ON public.disasters(is_urgent);

-- 3. Volunteer Applications / Junction Table
-- Used for: Checking if user is a volunteer, Admin counting
CREATE INDEX IF NOT EXISTS idx_disaster_volunteers_disaster_id ON public.disaster_volunteers(disaster_id);
CREATE INDEX IF NOT EXISTS idx_disaster_volunteers_user_id ON public.disaster_volunteers(user_id);

-- 4. Notifications
-- Used for: Navbar notification bell (fetching unread for user)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 5. Foreign Key Indexes (General Good Practice)
-- Helps with JOIN performance
CREATE INDEX IF NOT EXISTS idx_medical_cases_status ON public.medical_cases(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_news_related_disaster ON public.news_updates(related_disaster_id);

-- Usage:
-- Copy all the SQL above and paste it into the SQL Editor in your Supabase Dashboard.
-- Click "Run".
