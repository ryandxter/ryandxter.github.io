-- Create portfolio_info table for name, career, about, email, availability
CREATE TABLE IF NOT EXISTS portfolio_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  career_name TEXT NOT NULL,
  about TEXT NOT NULL,
  email TEXT NOT NULL,
  availability TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  href TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create gallery_images table for ticker images
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  row_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE portfolio_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "portfolio_info_public_read" ON portfolio_info FOR SELECT USING (true);
CREATE POLICY "portfolio_info_public_write" ON portfolio_info FOR INSERT WITH CHECK (true);
CREATE POLICY "portfolio_info_public_update" ON portfolio_info FOR UPDATE USING (true);

CREATE POLICY "social_links_public_read" ON social_links FOR SELECT USING (true);
CREATE POLICY "social_links_public_write" ON social_links FOR INSERT WITH CHECK (true);
CREATE POLICY "social_links_public_update" ON social_links FOR UPDATE USING (true);
CREATE POLICY "social_links_public_delete" ON social_links FOR DELETE USING (true);

CREATE POLICY "gallery_images_public_read" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "gallery_images_public_write" ON gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "gallery_images_public_update" ON gallery_images FOR UPDATE USING (true);
CREATE POLICY "gallery_images_public_delete" ON gallery_images FOR DELETE USING (true);

-- Insert default portfolio info if not exists
INSERT INTO portfolio_info (name, career_name, about, email, availability)
VALUES (
  'Yadwinder Singh',
  'Freelance Product Designer',
  'I''m Yadwinder Singh, a freelance product designer based in India. I design digital interfaces that solve challenges and amplify user experiences, turning strategic goals into reality. I experiment with tools like v0 to prototype swiftly, focusing on clean, impactful solutions that balance creativity and functionality.',
  'yadwinder.design@gmail.com',
  'Available for February'
)
ON CONFLICT DO NOTHING;

-- Insert default social links if not exist
INSERT INTO social_links (label, href)
VALUES
  ('Email', 'mailto:ryndxtr@gmail.com'),
  ('Twitter', 'https://x.com/ryandxter'),
  ('GitHub', 'https://github.com/ryandxter')
ON CONFLICT (label) DO NOTHING;
