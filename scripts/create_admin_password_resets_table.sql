-- create_admin_password_resets_table.sql
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
