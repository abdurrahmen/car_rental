-- =============================================================================
-- RLS Security Patch: Fix privilege escalation vulnerabilities
-- Applied: 2026-09-25
-- =============================================================================

-- 1. Fix profiles RLS: prevent customers from updating role, is_blacklisted, no_show_count
-- The old policy used FOR ALL with no WITH CHECK, allowing users to self-promote to admin.

DROP POLICY IF EXISTS "Customers SELECT/UPDATE own row" ON public.profiles;

-- Separate SELECT policy: users can always read their own profile
CREATE POLICY "Users SELECT own profile" ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Restricted UPDATE policy: users can only update safe personal fields
-- The WITH CHECK ensures role, is_blacklisted, no_show_count, and license_verified cannot be changed
CREATE POLICY "Users UPDATE own safe fields" ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  -- Ensure sensitive fields remain unchanged by comparing to current values
  role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND
  is_blacklisted = (SELECT p.is_blacklisted FROM public.profiles p WHERE p.id = auth.uid()) AND
  no_show_count = (SELECT p.no_show_count FROM public.profiles p WHERE p.id = auth.uid()) AND
  license_verified = (SELECT p.license_verified FROM public.profiles p WHERE p.id = auth.uid())
);

-- 2. Fix reservations RLS: add WITH CHECK to prevent customers from setting arbitrary status
-- The old policy allowed customers to update pending reservations to any status including 'confirmed'

DROP POLICY IF EXISTS "Customer UPDATE own reservations to cancel" ON public.reservations;

CREATE POLICY "Customer UPDATE own reservations to cancel" ON public.reservations FOR UPDATE
USING (
  customer_id = auth.uid() AND 
  status = 'pending'
)
WITH CHECK (
  -- Customers can only change their pending reservations to cancelled
  status = 'cancelled'
);

-- 3. Add missing INSERT policy for staff on vehicles
-- Staff and branch managers need to be able to create vehicles for their branch

CREATE POLICY "Staff INSERT vehicles for own branch" ON public.vehicles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND branch_id = vehicles.branch_id
    AND role IN ('staff', 'branch_manager')
  )
);

-- 4. Add index on vehicle_photos(vehicle_id) for join performance
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON public.vehicle_photos (vehicle_id);

-- 5. Add index on reservations(created_at DESC) for dashboard ordering
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations (created_at DESC);

-- 6. Add index on audit_log(created_at DESC) for admin dashboard
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);
