-- =============================================================================
-- Verification queries for guest_clients migration
-- Run these to verify the migration was successful
-- =============================================================================

-- Check if guest_clients table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'guest_clients'
) AS guest_clients_table_exists;

-- Check if client_source enum exists
SELECT EXISTS (
  SELECT FROM pg_type 
  WHERE typname = 'client_source'
) AS client_source_enum_exists;

-- Check if guest_client_id column exists in reservations
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'reservations' 
  AND column_name = 'guest_client_id'
) AS guest_client_id_column_exists;

-- Check if customer_id is nullable
SELECT is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name = 'customer_id';
-- Should return 'YES'

-- Check if XOR constraint exists
SELECT COUNT(*) 
FROM information_schema.table_constraints 
WHERE table_name = 'reservations' 
AND constraint_name = 'reservations_customer_xor_guest';
-- Should return 1

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'guest_clients';
-- Should show 4 indexes

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'guest_clients';
-- Should show 3 policies

-- Test insert (will fail with data, but tests schema)
-- EXPLAIN INSERT INTO guest_clients (full_name, phone, created_by) 
-- VALUES ('Test', '+213550123456', (SELECT id FROM profiles WHERE role = 'staff' LIMIT 1));
