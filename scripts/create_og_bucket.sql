-- Fallback migration: create an `og_images` table to store uploaded OG image metadata
-- Note: Creating Supabase Storage buckets via SQL may not be supported in all projects.
-- Prefer running `scripts/create_og_bucket.js` with a service-role key to create the actual storage bucket.

-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table to store OG image metadata
CREATE TABLE IF NOT EXISTS public.og_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  path text NOT NULL,
  public_url text,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Optional index on path for lookups
CREATE INDEX IF NOT EXISTS idx_og_images_path ON public.og_images (path);

-- Example insert (replace values as needed):
-- INSERT INTO public.og_images (file_name, path, public_url) VALUES ('social.png', 'og-images/social.png', 'https://<bucket-url>/og-images/social.png');
