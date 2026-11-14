-- =============================================================================
-- Add guest_clients table for walk-in customers without auth accounts
-- Database: PostgreSQL (Supabase)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Create client_source enum if it doesn't exist
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE client_source AS ENUM ('walk_in', 'phone', 'online');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create guest_clients table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_clients (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name  TEXT NOT NULL,
  phone      TEXT NOT NULL,
  source     client_source NOT NULL DEFAULT 'walk_in',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes      TEXT,
  
  CONSTRAINT guest_clients_full_name_min_length CHECK (char_length(trim(full_name)) >= 2),
  CONSTRAINT guest_clients_phone_not_empty CHECK (char_length(trim(phone)) > 0)
);

-- Index for phone lookups (non-unique to allow duplicate handling in app)
CREATE INDEX IF NOT EXISTS idx_guest_clients_phone ON guest_clients(phone);

-- Index for name search
CREATE INDEX IF NOT EXISTS idx_guest_clients_full_name ON guest_clients USING gin (full_name gin_trgm_ops);

-- Index for created_by (staff tracking)
CREATE INDEX IF NOT EXISTS idx_guest_clients_created_by ON guest_clients(created_by);

-- Index for recent clients query
CREATE INDEX IF NOT EXISTS idx_guest_clients_created_at ON guest_clients(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Modify reservations table to support guest clients
-- ─────────────────────────────────────────────────────────────────────────────

-- Make customer_id nullable (will be NULL for guest clients)
ALTER TABLE reservations 
  ALTER COLUMN customer_id DROP NOT NULL;

-- Add guest_client_id column
ALTER TABLE reservations 
  ADD COLUMN IF NOT EXISTS guest_client_id UUID REFERENCES guest_clients(id) ON DELETE RESTRICT;

-- Add constraint: must have either customer_id OR guest_client_id (but not both)
ALTER TABLE reservations 
  ADD CONSTRAINT IF NOT EXISTS reservations_customer_xor_guest 
  CHECK (
    (customer_id IS NOT NULL AND guest_client_id IS NULL) OR
    (customer_id IS NULL AND guest_client_id IS NOT NULL)
  );

-- Index for guest_client_id lookups
CREATE INDEX IF NOT EXISTS idx_reservations_guest_client_id ON reservations(guest_client_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RLS Policies for guest_clients table
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE guest_clients ENABLE ROW LEVEL SECURITY;

-- Policy: Staff/branch_manager/admin can view all guest clients
CREATE POLICY IF NOT EXISTS "Staff can view guest clients"
  ON guest_clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'branch_manager', 'admin')
    )
  );

-- Policy: Staff/branch_manager/admin can create guest clients
CREATE POLICY IF NOT EXISTS "Staff can create guest clients"
  ON guest_clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'branch_manager', 'admin')
    )
    AND created_by = auth.uid()
  );

-- Policy: Staff/branch_manager/admin can update guest clients they created
CREATE POLICY IF NOT EXISTS "Staff can update own guest clients"
  ON guest_clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'branch_manager', 'admin')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Update existing RLS policies for reservations to support guest clients
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop old customer-only policies if they exist
DROP POLICY IF EXISTS "Customers can view own reservations" ON reservations;

-- New policy: Customers can view their own reservations (profile-based or guest-based)
CREATE POLICY IF NOT EXISTS "Customers can view own reservations v2"
  ON reservations FOR SELECT
  USING (
    -- Authenticated customer viewing their own reservation
    (customer_id = auth.uid() AND customer_id IS NOT NULL)
    OR
    -- Staff/admin viewing any reservation
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'branch_manager', 'admin')
    )
  );
