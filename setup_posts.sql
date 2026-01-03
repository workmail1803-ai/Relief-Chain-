-- 1. Create 'posts' table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    image_url text, -- Optional image
    created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. App Policies
-- READ: All authenticated users can read posts (User Requirement)
CREATE POLICY "All users can view posts"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only 'volunteer' or 'admin' can create posts
CREATE POLICY "Volunteers and Admins can create posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('volunteer', 'admin')
    )
);

-- UPDATE/DELETE: Users can manage their own posts
CREATE POLICY "Users can manage own posts"
ON public.posts FOR ALL
USING (auth.uid() = author_id);


-- 4. Storage for 'posts' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Public Read Access
CREATE POLICY "Public Access Posts"
ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

-- Authenticated Upload
CREATE POLICY "Authenticated Upload Posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'posts' );

-- Update Own
CREATE POLICY "Users Update Own Post Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'posts' AND auth.uid() = owner );

-- 5. Performance Indices
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
