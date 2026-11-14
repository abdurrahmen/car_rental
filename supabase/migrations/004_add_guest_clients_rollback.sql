-- =============================================================================
-- Rollback script for guest_clients migration
-- Run this ONLY if you need to revert the changes
-- =============================================================================

-- Drop new RLS policies
DROP POLICY IF EXISTS "Customers can view own reservations v2" ON reservations;
DROP POLICY IF EXISTS "Staff can update own guest clients" ON guest_clients;
DROP POLICY IF EXISTS "Staff can create guest clients" ON guest_clients;
DROP POLICY IF EXISTS "Staff can view guest clients" ON guest_clients;

-- Drop constraint on reservations
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_customer_xor_guest;

-- Drop guest_client_id column
ALTER TABLE reservations DROP COLUMN IF EXISTS guest_client_id;

-- Make customer_id NOT NULL again
ALTER TABLE reservations ALTER COLUMN customer_id SET NOT NULL;

-- Drop guest_clients table
DROP TABLE IF EXISTS guest_clients CASCADE;

-- Drop enum type
DROP TYPE IF EXISTS client_source;

-- Restore old policy
CREATE POLICY IF NOT EXISTS "Customers can view own reservations"
  ON reservations FOR SELECT
  USING (customer_id = auth.uid());
