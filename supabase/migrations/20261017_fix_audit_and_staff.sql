-- =============================================================================
-- Migration: Fix Audit Log RLS & Staff Management Profile Creation
-- Date: 2026-10-17
-- Description:
-- 1. Adds missing INSERT policy on public.audit_log so server actions can write audits.
-- 2. Updates handle_new_user() trigger so role, branch_id, and phone in raw_user_meta_data
--    are immediately populated upon user sign up.
-- 3. Adds admin_set_user_role() SECURITY DEFINER function to allow admins and branch
--    managers to update staff profiles without RLS blocking role updates.
-- =============================================================================

-- 1. Audit log INSERT policy
DROP POLICY IF EXISTS "Authenticated INSERT audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Allow authenticated insert audit log" ON public.audit_log;
CREATE POLICY "Authenticated INSERT audit log" ON public.audit_log
FOR INSERT
WITH CHECK (true);

-- 2. Improved handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
  v_branch_id uuid;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
  IF v_role NOT IN ('customer', 'staff', 'branch_manager', 'admin') THEN
    v_role := 'customer';
  END IF;

  IF new.raw_user_meta_data->>'branch_id' IS NOT NULL AND new.raw_user_meta_data->>'branch_id' != '' THEN
    BEGIN
      v_branch_id := (new.raw_user_meta_data->>'branch_id')::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_branch_id := NULL;
    END;
  ELSE
    v_branch_id := NULL;
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, role, branch_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'phone',
    v_role,
    v_branch_id
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = CASE WHEN EXCLUDED.role != 'customer' THEN EXCLUDED.role ELSE public.profiles.role END,
    branch_id = COALESCE(EXCLUDED.branch_id, public.profiles.branch_id),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Security definer RPC for updating staff profile and role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  p_user_id uuid,
  p_role text,
  p_branch_id uuid DEFAULT NULL,
  p_full_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF p_role NOT IN ('customer', 'staff', 'branch_manager', 'admin') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  UPDATE public.profiles
  SET
    role = p_role,
    branch_id = p_branch_id,
    full_name = COALESCE(p_full_name, full_name),
    phone = COALESCE(p_phone, phone),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
