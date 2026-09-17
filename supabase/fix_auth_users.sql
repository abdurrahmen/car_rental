-- ============================================================================
-- FIX: Supabase Auth "Database error querying schema"
--
-- CAUSE:
-- In Supabase, direct SQL inserts into `auth.users` omit internal columns
-- (like confirmation_token, recovery_token, email_change_token_new, etc.)
-- leaving them as NULL. When Supabase Auth (GoTrue) queries the user, its Go
-- database scanner crashes with:
--   "converting NULL to string is unsupported" -> "Database error querying schema"
--
-- RUN THIS ENTIRE SCRIPT in the Supabase SQL Editor to fix it in 1 second.
-- ============================================================================

-- 1. Fix NULL token columns on all auth users so GoTrue Go scanner succeeds
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL
  OR recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- 2. Make sure handle_new_user trigger never fails on duplicate keys
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 'customer')
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Confirm the admin user profile has the 'admin' role
INSERT INTO public.profiles (id, full_name, phone, role, preferred_language, license_verified)
SELECT id, 'Samir Belkacem (Admin)', '+213 550 11 22 33', 'admin', 'ar', true
FROM auth.users
WHERE email = 'admin@dzrent.dz'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Samir Belkacem (Admin)';

-- 4. Verify fixed rows
SELECT id, email, role, confirmation_token, recovery_token, created_at 
FROM auth.users 
WHERE email = 'admin@dzrent.dz';
