-- Create admin_credentials table for storing admin user and password hash
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure at least one admin exists will be handled by seed logic

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
