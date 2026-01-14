-- Create experiences table for public CRUD
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON experiences
  FOR SELECT
  USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert" ON experiences
  FOR INSERT
  WITH CHECK (true);

-- Allow public update
CREATE POLICY "Allow public update" ON experiences
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow public delete
CREATE POLICY "Allow public delete" ON experiences
  FOR DELETE
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON experiences(created_at DESC);
