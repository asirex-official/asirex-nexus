-- Create media-uploads bucket for projects, events, and general uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-uploads', 'media-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media-uploads bucket
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-uploads' AND is_admin_type(auth.uid()));

CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media-uploads' AND is_admin_type(auth.uid()));

CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-uploads' AND is_admin_type(auth.uid()));

CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-uploads');

-- Add gallery_videos column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gallery_videos jsonb DEFAULT '[]'::jsonb;

-- Add gallery_images and gallery_videos to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gallery_videos jsonb DEFAULT '[]'::jsonb;

-- Add gallery_images and gallery_videos to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_videos jsonb DEFAULT '[]'::jsonb;