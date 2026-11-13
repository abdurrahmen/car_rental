-- =============================================================================
-- DZRent — Patch Migration v1.0
-- Safe to run on existing data — no drops, no truncates.
-- Run this in Supabase SQL Editor.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add missing vehicles.is_active column
--    (app filters .eq('is_active', true) in getDashboardData)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Mark all existing vehicles as active (they were implicitly active)
UPDATE vehicles SET is_active = true WHERE is_active IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Harden branches.is_active to NOT NULL
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE branches SET is_active = true WHERE is_active IS NULL;
ALTER TABLE branches ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE branches ALTER COLUMN is_active SET DEFAULT true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Create audit_logs view aliasing audit_log
--    (keeps your table name, app code uses audit_logs)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW audit_logs AS SELECT * FROM audit_log;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RLS helper functions (safe to re-create)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('staff', 'branch_manager', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Auto-create profile on signup trigger
--    (safe to re-create — only fires on new signups)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ar')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop first in case it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Add RLS policies if not already present
--    (IF NOT EXISTS not supported on policies — use DO block)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Enable RLS on tables that might not have it yet
  ALTER TABLE branches                  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE profiles                  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE vehicle_categories        ENABLE ROW LEVEL SECURITY;
  ALTER TABLE vehicles                  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE vehicle_photos            ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reservations              ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payments                  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE vehicle_condition_reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE documents                 ENABLE ROW LEVEL SECURITY;
  ALTER TABLE notifications             ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reviews                   ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audit_log                 ENABLE ROW LEVEL SECURITY;

  -- Branches: readable by all authenticated, writable by admins
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branches' AND policyname = 'branches_read') THEN
    CREATE POLICY "branches_read"  ON branches FOR SELECT USING (auth.uid() IS NOT NULL);
    CREATE POLICY "branches_write" ON branches FOR ALL    USING (is_admin());
  END IF;

  -- Vehicle categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_categories' AND policyname = 'categories_read') THEN
    CREATE POLICY "categories_read"  ON vehicle_categories FOR SELECT USING (auth.uid() IS NOT NULL);
    CREATE POLICY "categories_write" ON vehicle_categories FOR ALL    USING (is_admin());
  END IF;

  -- Vehicles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'vehicles_read_staff') THEN
    CREATE POLICY "vehicles_read_staff"  ON vehicles FOR SELECT USING (is_staff());
    CREATE POLICY "vehicles_read_public" ON vehicles FOR SELECT USING (status = 'available');
    CREATE POLICY "vehicles_write_admin" ON vehicles FOR ALL    USING (is_admin());
    CREATE POLICY "vehicles_write_staff" ON vehicles FOR UPDATE USING (is_staff());
  END IF;

  -- Vehicle photos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_photos' AND policyname = 'vehicle_photos_read') THEN
    CREATE POLICY "vehicle_photos_read"  ON vehicle_photos FOR SELECT USING (auth.uid() IS NOT NULL);
    CREATE POLICY "vehicle_photos_write" ON vehicle_photos FOR ALL    USING (is_staff());
  END IF;

  -- Profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_self') THEN
    CREATE POLICY "profiles_self"       ON profiles FOR SELECT USING (id = auth.uid());
    CREATE POLICY "profiles_staff_read" ON profiles FOR SELECT USING (is_staff());
    CREATE POLICY "profiles_self_write" ON profiles FOR UPDATE USING (id = auth.uid());
    CREATE POLICY "profiles_admin"      ON profiles FOR ALL    USING (is_admin());
  END IF;

  -- Reservations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reservations' AND policyname = 'reservations_customer') THEN
    CREATE POLICY "reservations_customer" ON reservations FOR SELECT USING (customer_id = auth.uid());
    CREATE POLICY "reservations_staff"    ON reservations FOR SELECT USING (is_staff());
    CREATE POLICY "reservations_create"   ON reservations FOR INSERT WITH CHECK (customer_id = auth.uid() OR is_staff());
    CREATE POLICY "reservations_update"   ON reservations FOR UPDATE USING (is_staff());
  END IF;

  -- Payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'payments_staff') THEN
    CREATE POLICY "payments_customer" ON payments FOR SELECT
      USING (reservation_id IN (SELECT id FROM reservations WHERE customer_id = auth.uid()));
    CREATE POLICY "payments_staff" ON payments FOR ALL USING (is_staff());
  END IF;

  -- Notifications
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_self') THEN
    CREATE POLICY "notifications_self" ON notifications FOR ALL USING (profile_id = auth.uid());
  END IF;

  -- Reviews
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'reviews_read') THEN
    CREATE POLICY "reviews_read"  ON reviews FOR SELECT USING (true);
    CREATE POLICY "reviews_write" ON reviews FOR ALL    USING (customer_id = auth.uid());
  END IF;

  -- Condition reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicle_condition_reports' AND policyname = 'condition_reports_staff') THEN
    CREATE POLICY "condition_reports_staff" ON vehicle_condition_reports FOR ALL USING (is_staff());
  END IF;

END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Verify — run this to confirm everything looks right
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  'vehicles.is_active exists' AS check_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'is_active'
  ) AS passed
UNION ALL
SELECT
  'audit_logs view exists',
  EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_name = 'audit_logs'
  )
UNION ALL
SELECT
  'is_staff() function exists',
  EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_staff'
  )
UNION ALL
SELECT
  'handle_new_user trigger exists',
  EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  );

-- =============================================================================
-- DONE ✓  Your existing data is untouched.
-- =============================================================================
