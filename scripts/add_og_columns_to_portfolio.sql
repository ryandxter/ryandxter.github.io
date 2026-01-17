-- Migration: add OG columns to portfolio_info
-- Run this in the Supabase SQL editor or via psql connected to your database.

BEGIN;

-- Add Open Graph columns if they do not already exist
ALTER TABLE public.portfolio_info
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS og_image_url text;

COMMIT;

-- Optional: verify columns
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'portfolio_info' AND column_name LIKE 'og_%';
