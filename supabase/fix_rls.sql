-- ===================================================================
-- FIX ROW LEVEL SECURITY (RLS) FOR PUBLIC BROWSING
-- ===================================================================
-- Run this in your Supabase SQL Editor if you already ran init.sql.
-- This allows visitors who are not yet logged in (role: 'anon') to
-- browse active branches, vehicle categories, available vehicles,
-- vehicle photos, and public reviews.
-- ===================================================================

-- 1. Branches: allow anyone (public/anon + authenticated) to see active branches
DROP POLICY IF EXISTS "Anyone authenticated SELECT active branches" ON public.branches;
DROP POLICY IF EXISTS "Public SELECT active branches" ON public.branches;
CREATE POLICY "Public SELECT active branches" ON public.branches
FOR SELECT USING (is_active = true);

-- 2. Vehicle Categories: allow anyone to see vehicle categories
DROP POLICY IF EXISTS "Anyone authenticated SELECT categories" ON public.vehicle_categories;
DROP POLICY IF EXISTS "Public SELECT categories" ON public.vehicle_categories;
CREATE POLICY "Public SELECT categories" ON public.vehicle_categories
FOR SELECT USING (true);

-- 3. Vehicles: allow anyone to browse unretired vehicles
DROP POLICY IF EXISTS "Anyone authenticated SELECT unretired vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Public SELECT unretired vehicles" ON public.vehicles;
CREATE POLICY "Public SELECT unretired vehicles" ON public.vehicles
FOR SELECT USING (status != 'retired');

-- 4. Vehicle Photos: allow anyone to see vehicle photos
DROP POLICY IF EXISTS "Anyone authenticated SELECT vehicle photos" ON public.vehicle_photos;
DROP POLICY IF EXISTS "Public SELECT vehicle photos" ON public.vehicle_photos;
CREATE POLICY "Public SELECT vehicle photos" ON public.vehicle_photos
FOR SELECT USING (true);

-- 5. Reviews: allow anyone to read customer reviews
DROP POLICY IF EXISTS "Anyone authenticated SELECT reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public SELECT reviews" ON public.reviews;
CREATE POLICY "Public SELECT reviews" ON public.reviews
FOR SELECT USING (true);
