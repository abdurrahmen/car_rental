-- ===================================================================
-- ALGERIA CAR RENTAL PLATFORM — COMPLETE SEED + RLS FIX SCRIPT
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-------------------------------------------------------------------------------
-- STEP 1: NON-RECURSIVE RLS HELPER FUNCTIONS (SECURITY DEFINER)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((public.get_user_role() = 'admin'), false);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((public.get_user_role() IN ('staff', 'branch_manager', 'admin')), false);
$$;

-------------------------------------------------------------------------------
-- STEP 2: FIX PROFILES & RESERVATIONS RLS POLICIES (PREVENT RECURSION)
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff SELECT customers with reservations at branch" ON public.profiles;
DROP POLICY IF EXISTS "Customers SELECT/UPDATE own row" ON public.profiles;
DROP POLICY IF EXISTS "Users SELECT own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users UPDATE own safe fields" ON public.profiles;
DROP POLICY IF EXISTS "Staff and Admin SELECT profiles" ON public.profiles;

CREATE POLICY "Users SELECT own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users UPDATE own safe fields" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff and Admin SELECT profiles" ON public.profiles
FOR SELECT USING (public.is_staff());

CREATE POLICY "Admin full access profiles" ON public.profiles
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access reservations" ON public.reservations;
DROP POLICY IF EXISTS "Staff SELECT/UPDATE branch reservations" ON public.reservations;
DROP POLICY IF EXISTS "Customer SELECT own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Customer INSERT own reservations (pending only)" ON public.reservations;
DROP POLICY IF EXISTS "Customer UPDATE own reservations to cancel" ON public.reservations;
DROP POLICY IF EXISTS "Staff and Admin full access reservations" ON public.reservations;

CREATE POLICY "Customer SELECT own reservations" ON public.reservations
FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customer INSERT own reservations (pending only)" ON public.reservations
FOR INSERT WITH CHECK (customer_id = auth.uid() AND status = 'pending');

CREATE POLICY "Customer UPDATE own reservations to cancel" ON public.reservations
FOR UPDATE USING (customer_id = auth.uid() AND status = 'pending')
WITH CHECK (status = 'cancelled');

CREATE POLICY "Staff and Admin full access reservations" ON public.reservations
FOR ALL USING (public.is_staff());

-- Vehicles & Photos (public read, staff/admin manage)
DROP POLICY IF EXISTS "Public SELECT unretired vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Anyone authenticated SELECT unretired vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admin full access vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Staff UPDATE branch vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Staff INSERT vehicles for own branch" ON public.vehicles;
DROP POLICY IF EXISTS "Staff and Admin manage vehicles" ON public.vehicles;

CREATE POLICY "Public SELECT unretired vehicles" ON public.vehicles
FOR SELECT USING (status != 'retired' OR public.is_staff());

CREATE POLICY "Staff and Admin manage vehicles" ON public.vehicles
FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Public SELECT vehicle photos" ON public.vehicle_photos;
DROP POLICY IF EXISTS "Anyone authenticated SELECT vehicle photos" ON public.vehicle_photos;
DROP POLICY IF EXISTS "Admin full access vehicle photos" ON public.vehicle_photos;
DROP POLICY IF EXISTS "Staff modify branch vehicle photos" ON public.vehicle_photos;
DROP POLICY IF EXISTS "Staff and Admin manage vehicle photos" ON public.vehicle_photos;

CREATE POLICY "Public SELECT vehicle photos" ON public.vehicle_photos
FOR SELECT USING (true);

CREATE POLICY "Staff and Admin manage vehicle photos" ON public.vehicle_photos
FOR ALL USING (public.is_staff());

-- Branches & Categories (public read)
DROP POLICY IF EXISTS "Public SELECT active branches" ON public.branches;
DROP POLICY IF EXISTS "Admin full access branches" ON public.branches;
CREATE POLICY "Public SELECT active branches" ON public.branches
FOR SELECT USING (is_active = true OR public.is_staff());
CREATE POLICY "Admin full access branches" ON public.branches
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public SELECT categories" ON public.vehicle_categories;
DROP POLICY IF EXISTS "Admin full access categories" ON public.vehicle_categories;
CREATE POLICY "Public SELECT categories" ON public.vehicle_categories
FOR SELECT USING (true);
CREATE POLICY "Admin full access categories" ON public.vehicle_categories
FOR ALL USING (public.is_admin());

-- Payments & Condition Reports
DROP POLICY IF EXISTS "Staff SELECT/INSERT branch payments" ON public.payments;
DROP POLICY IF EXISTS "Admin full access payments" ON public.payments;
DROP POLICY IF EXISTS "Customer SELECT own payments" ON public.payments;
DROP POLICY IF EXISTS "Staff and Admin manage payments" ON public.payments;

CREATE POLICY "Customer SELECT own payments" ON public.payments
FOR SELECT USING (EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = payments.reservation_id AND r.customer_id = auth.uid()));

CREATE POLICY "Staff and Admin manage payments" ON public.payments
FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Staff SELECT/INSERT branch reports" ON public.vehicle_condition_reports;
DROP POLICY IF EXISTS "Admin full access reports" ON public.vehicle_condition_reports;
DROP POLICY IF EXISTS "Customer SELECT own reports" ON public.vehicle_condition_reports;
DROP POLICY IF EXISTS "Staff and Admin manage reports" ON public.vehicle_condition_reports;

CREATE POLICY "Customer SELECT own reports" ON public.vehicle_condition_reports
FOR SELECT USING (EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = vehicle_condition_reports.reservation_id AND r.customer_id = auth.uid()));

CREATE POLICY "Staff and Admin manage reports" ON public.vehicle_condition_reports
FOR ALL USING (public.is_staff());

-------------------------------------------------------------------------------
-- STEP 3: CLEAN PREVIOUS DEMO DATA
-------------------------------------------------------------------------------
DELETE FROM public.audit_log WHERE entity_type IN ('reservation', 'vehicle', 'branch');
DELETE FROM public.reviews;
DELETE FROM public.vehicle_condition_reports;
DELETE FROM public.payments;
DELETE FROM public.reservations;
DELETE FROM public.vehicle_photos;
DELETE FROM public.vehicles;
DELETE FROM public.vehicle_categories;
DELETE FROM public.documents;
DELETE FROM public.notifications;

DELETE FROM public.profiles WHERE id IN (
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000005'
);

DELETE FROM public.branches WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006'
);

-------------------------------------------------------------------------------
-- STEP 4: INSERT BRANCHES (6 WILAYAS)
-------------------------------------------------------------------------------
INSERT INTO public.branches (id, name_ar, name_fr, name_en, address, city, lat, lng, phone, is_active)
VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'وكالة الجزائر وسط - ديدوش مراد',
  'Agence Alger Centre - Didouche Mourad',
  'Algiers Central Agency - Didouche Mourad',
  '142 Rue Didouche Mourad, Alger-Centre',
  'Alger',
  36.7683, 3.0543,
  '+213 21 74 12 30',
  true
),
(
  '10000000-0000-0000-0000-000000000002',
  'وكالة مطار وهران السانية الدولي',
  'Agence Aéroport Oran Es-Sénia',
  'Oran Es-Senia Airport Agency',
  'Terminal 1, Hall des Arrivées, Aéroport Ahmed Ben Bella',
  'Oran',
  35.6239, -0.6212,
  '+213 41 59 88 40',
  true
),
(
  '10000000-0000-0000-0000-000000000003',
  'وكالة قسنطينة - عين الباي',
  'Agence Constantine - Ain El Bey',
  'Constantine Agency - Ain El Bey',
  'Boulevard Zighoud Youcef, Cité Universitaire',
  'Constantine',
  36.3650, 6.6147,
  '+213 31 88 45 12',
  true
),
(
  '10000000-0000-0000-0000-000000000004',
  'وكالة عنابة - الميناء',
  'Agence Annaba - Port Commercial',
  'Annaba Port Commercial Agency',
  'Avenue de l''ALN, Face Gare Maritime',
  'Annaba',
  36.9000, 7.7667,
  '+213 38 45 67 89',
  true
),
(
  '10000000-0000-0000-0000-000000000005',
  'وكالة سطيف - قطب العلمة التجاري',
  'Agence Sétif - Pôle Commercial El Eulma',
  'Setif Agency - El Eulma Commercial Hub',
  'Route Nationale 5, Zone Industrielle',
  'Sétif',
  36.1900, 5.4100,
  '+213 36 62 10 20',
  true
),
(
  '10000000-0000-0000-0000-000000000006',
  'وكالة حاسي مسعود - القاعدة النفطية ورقلة',
  'Agence Hassi Messaoud - Base Pétrolière Ouargla',
  'Hassi Messaoud Petroleum Base Agency',
  'Zone Industrielle Ouest, Base Sonatrach',
  'Ouargla',
  31.6800, 6.0700,
  '+213 29 73 50 00',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en;

-------------------------------------------------------------------------------
-- STEP 5: AUTH USERS & PROFILES
-------------------------------------------------------------------------------
DO $$
DECLARE
  pwd_hash text := crypt('password123', gen_salt('bf'));
BEGIN
  DELETE FROM auth.users WHERE email IN (
    'admin@dzrent.dz',
    'manager.algiers@dzrent.dz',
    'manager.oran@dzrent.dz',
    'agent.algiers@dzrent.dz',
    'agent.constantine@dzrent.dz',
    'agent.ouargla@dzrent.dz',
    'karim.b@gmail.com',
    'amina.k@yahoo.fr',
    'yacine.m@gmail.com',
    'bad.client@outlook.com',
    'no.show.test@gmail.com'
  );

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@dzrent.dz', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Samir Belkacem (Admin)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'b0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'manager.algiers@dzrent.dz', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rachid Haddad (Manager Alger)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'b0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'manager.oran@dzrent.dz', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Nadia Mansouri (Manager Oran)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'c0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'agent.algiers@dzrent.dz', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Amine Khelif (Staff Alger)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'c0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'agent.constantine@dzrent.dz', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sofiane Bouzid (Staff Constantine)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'c0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'agent.ouargla@dzrent.dz', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Tarik Larbi (Staff Ouargla)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'd0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'karim.b@gmail.com', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Karim Benali"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'd0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'amina.k@yahoo.fr', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Amina Kadri"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'd0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'yacine.m@gmail.com', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Yacine Meziane"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'd0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'bad.client@outlook.com', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mourad Tebbani (Blacklisted)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    'd0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'no.show.test@gmail.com', pwd_hash, now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Farid Gherbi (Repeated No-Show)"}',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

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
  WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000005'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Notice: Auth users could not be directly inserted. Inserting profiles directly.';
END $$;

-- Profiles Table
INSERT INTO public.profiles (id, full_name, phone, role, branch_id, preferred_language, license_number, license_document_url, license_verified, is_blacklisted, no_show_count)
VALUES
-- Admin
('a0000000-0000-0000-0000-000000000001', 'Samir Belkacem', '+213 550 11 22 33', 'admin', NULL, 'ar', '16/2012/84920', NULL, true, false, 0),

-- Managers
('b0000000-0000-0000-0000-000000000001', 'Rachid Haddad', '+213 661 44 55 66', 'branch_manager', '10000000-0000-0000-0000-000000000001', 'fr', '16/2014/19284', NULL, true, false, 0),
('b0000000-0000-0000-0000-000000000002', 'Nadia Mansouri', '+213 770 77 88 99', 'branch_manager', '10000000-0000-0000-0000-000000000002', 'fr', '31/2016/55201', NULL, true, false, 0),

-- Staff Agents
('c0000000-0000-0000-0000-000000000001', 'Amine Khelif', '+213 540 12 34 56', 'staff', '10000000-0000-0000-0000-000000000001', 'ar', '16/2019/33219', NULL, true, false, 0),
('c0000000-0000-0000-0000-000000000002', 'Sofiane Bouzid', '+213 551 23 45 67', 'staff', '10000000-0000-0000-0000-000000000003', 'ar', '25/2018/77401', NULL, true, false, 0),
('c0000000-0000-0000-0000-000000000003', 'Tarik Larbi', '+213 662 34 56 78', 'staff', '10000000-0000-0000-0000-000000000006', 'ar', '30/2020/99102', NULL, true, false, 0),

-- Customers
('d0000000-0000-0000-0000-000000000001', 'Karim Benali', '+213 555 88 99 00', 'customer', NULL, 'ar', '16/2015/48201', 'licenses/karim_benali_license.jpg', true, false, 0),
('d0000000-0000-0000-0000-000000000002', 'Amina Kadri', '+213 772 11 22 44', 'customer', NULL, 'fr', '31/2021/66542', 'licenses/amina_kadri_license.jpg', true, false, 0),
('d0000000-0000-0000-0000-000000000003', 'Yacine Meziane', '+213 660 99 88 77', 'customer', NULL, 'en', '25/2017/12984', 'licenses/yacine_meziane_license.jpg', true, false, 0),
('d0000000-0000-0000-0000-000000000004', 'Mourad Tebbani', '+213 552 00 11 22', 'customer', NULL, 'ar', '16/2010/00492', NULL, false, true, 4),
('d0000000-0000-0000-0000-000000000005', 'Farid Gherbi', '+213 775 33 44 55', 'customer', NULL, 'ar', '19/2020/55481', NULL, false, false, 2)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  is_blacklisted = EXCLUDED.is_blacklisted,
  no_show_count = EXCLUDED.no_show_count;

-------------------------------------------------------------------------------
-- STEP 6: VEHICLE CATEGORIES
-------------------------------------------------------------------------------
INSERT INTO public.vehicle_categories (id, name_ar, name_fr, name_en, description_ar, description_fr, description_en)
VALUES
(
  '20000000-0000-0000-0000-000000000001',
  'سيارات اقتصادية ومدمجة',
  'Compactes & Économiques',
  'Compact & Economy Cars',
  'سيارات منخفضة استهلاك الوقود ومثالية للتنقل داخل المدن الجزائرية المزدحمة.',
  'Idéales pour la circulation urbaine à Alger, Oran et Constantine à faible consommation.',
  'Fuel-efficient vehicles perfect for bustling urban city travel across Algeria.'
),
(
  '20000000-0000-0000-0000-000000000002',
  'سيارات سيدان فاخرة ورجال أعمال',
  'Berlines & Affaires',
  'Executive & Business Sedans',
  'راحة فائقة ومظهر احترافي لرحلات العمل والمناسبات الرسمية والتنقل بين الولايات.',
  'Grand confort, insonorisation et espace pour vos déplacements inter-wilayas et rendez-vous professionnels.',
  'High comfort and professional style for inter-wilaya business trips.'
),
(
  '20000000-0000-0000-0000-000000000003',
  'سيارات دفع رباعي وعائلية SUV',
  'SUV & 4x4 Tout-Terrain',
  'SUVs & 4x4 Off-Road',
  'قوة متكاملة مناسبة للمرتفعات الجبلية، المسالك الوعرة والرحلات العائلية الطويلة.',
  'Puissance et motricité 4x4 adaptées aux routes de montagne de Kabylie, Aurès et grands trajets.',
  'Full all-terrain capability for mountainous routes and long family voyages.'
),
(
  '20000000-0000-0000-0000-000000000004',
  'شاحنات وفورغونات تجارية نفعية',
  'Fourgons & Véhicules Utilitaires',
  'Commercial Utility Vans & Cargo Trucks',
  'مركبات شحن وحمولة لنقل البضائع والمعدات والمؤسسات التجارية والتموين.',
  'Fourgons de livraison avec grand volume utile pour artisans, commerçants et transport de marchandises.',
  'High-capacity cargo vans and delivery trucks for commercial supply and logistics.'
),
(
  '20000000-0000-0000-0000-000000000005',
  'بيك أب وآليات صناعية ثقيلة',
  'Pick-up & Engins Lourds Industriels',
  'Pickups & Heavy Industrial Equipment',
  'مركبات الخدمة الشاقة وقواعد النفط، ومركبات العمل في صحراء حاسي مسعود والمشاريع الكبرى.',
  'Véhicules renforcés pour les bases pétrolières du Sud et le BTP (Hassi Messaoud, In Salah).',
  'Heavy-duty pickups and construction equipment tailored for Saharan oilfields and infrastructure.'
)
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en;

-------------------------------------------------------------------------------
-- STEP 7: 15 REALISTIC VEHICLES
-------------------------------------------------------------------------------
INSERT INTO public.vehicles (id, branch_id, category_id, make, model, year, plate_number, transmission, seats, fuel_type, daily_rate, deposit_amount, mileage_limit_km, status)
VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Dacia', 'Logan Stepway', 2023, '01849-123-16', 'manual', 5, 'petrol', 4200.00, 5000.00, 300, 'available'
),
(
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Renault', 'Symbol Essence', 2022, '04910-122-16', 'manual', 5, 'petrol', 3800.00, 5000.00, NULL, 'available'
),
(
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Hyundai', 'Grand i10', 2023, '11920-123-31', 'automatic', 5, 'petrol', 4500.00, 5000.00, 350, 'available'
),
(
  '30000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  'Volkswagen', 'Golf 8 R-Line', 2023, '00104-123-16', 'automatic', 5, 'petrol', 12000.00, 15000.00, 250, 'rented'
),
(
  '30000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'Peugeot', '508 GT', 2023, '20491-123-31', 'automatic', 5, 'diesel', 14000.00, 20000.00, NULL, 'available'
),
(
  '30000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'Skoda', 'Octavia Ambition', 2022, '08420-122-25', 'automatic', 5, 'diesel', 9500.00, 10000.00, 300, 'available'
),
(
  '30000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000003',
  'Hyundai', 'Tucson CRDi 4WD', 2024, '00481-124-16', 'automatic', 5, 'diesel', 11000.00, 15000.00, 300, 'available'
),
(
  '30000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000003',
  'Toyota', 'Land Cruiser Prado TX-L', 2023, '00912-123-30', 'automatic', 7, 'diesel', 24000.00, 35000.00, NULL, 'available'
),
(
  '30000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000003',
  'Dacia', 'Duster Prestige 4x4', 2023, '14002-123-25', 'manual', 5, 'diesel', 7500.00, 8000.00, 350, 'available'
),
(
  '30000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000004',
  'Peugeot', 'Boxer Fourgon L3H2', 2023, '02819-123-23', 'manual', 3, 'diesel', 10500.00, 15000.00, 400, 'available'
),
(
  '30000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000004',
  'Renault', 'Master Grand Volume 13m³', 2022, '18402-122-19', 'manual', 3, 'diesel', 12000.00, 20000.00, 350, 'available'
),
(
  '30000000-0000-0000-0000-000000000012',
  '10000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000004',
  'Hyundai', 'H-100 Camion Plateau', 2023, '09124-123-19', 'manual', 3, 'diesel', 8500.00, 10000.00, 300, 'maintenance'
),
(
  '30000000-0000-0000-0000-000000000013',
  '10000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000005',
  'Toyota', 'Hilux Double Cab 4x4 Sahara Edition', 2023, '04812-123-30', 'manual', 5, 'diesel', 16000.00, 25000.00, 400, 'available'
),
(
  '30000000-0000-0000-0000-000000000014',
  '10000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000005',
  'Isuzu', 'D-Max 4x4 Crew Cab', 2022, '07194-122-30', 'manual', 5, 'diesel', 14500.00, 20000.00, 350, 'available'
),
(
  '30000000-0000-0000-0000-000000000015',
  '10000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000005',
  'JCB', '3CX Chargeuse-Pelleteuse (Tractopelle)', 2021, 'ENGIN-0021-30', 'manual', 1, 'diesel', 38000.00, 50000.00, 100, 'available'
)
ON CONFLICT (id) DO UPDATE SET
  make = EXCLUDED.make,
  model = EXCLUDED.model,
  daily_rate = EXCLUDED.daily_rate,
  status = EXCLUDED.status;

-------------------------------------------------------------------------------
-- STEP 8: VEHICLE PHOTOS
-------------------------------------------------------------------------------
INSERT INTO public.vehicle_photos (id, vehicle_id, storage_path, is_primary, sort_order)
VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&auto=format&fit=crop&q=80', true, 0),
('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=1200&auto=format&fit=crop&q=80', true, 0)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- STEP 9: RESERVATIONS (ALL 7 LIFECYCLE STATES)
-------------------------------------------------------------------------------
INSERT INTO public.reservations (
  id, customer_id, vehicle_id, pickup_branch_id, dropoff_branch_id,
  start_date, end_date, status, total_price, deposit_amount,
  deposit_paid_at, deposit_deadline, confirmed_by, confirmed_at,
  cancelled_by, cancelled_reason, cancelled_at, notes, staff_notes
)
VALUES
(
  '50000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '9 days',
  'pending',
  16800.00, 5000.00,
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  'Voyage familial à Tipaza, besoin d''un siège enfant si disponible.',
  NULL
),
(
  '50000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '6 days',
  'confirmed',
  18000.00, 5000.00,
  NULL,
  now() + INTERVAL '36 hours',
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '12 hours',
  NULL, NULL, NULL,
  'Arrivée vol AH1002 d''Alger à 14h.',
  'Permis vérifié conforme. En attente paiement acompte CIB/Edahabia.'
),
(
  '50000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '4 days',
  'deposit_paid',
  33000.00, 15000.00,
  now() - INTERVAL '6 hours',
  now() + INTERVAL '42 hours',
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '18 hours',
  NULL, NULL, NULL,
  'Déplacement de mission vers Constantine. Restitution à l''agence Ain El Bey.',
  'Acompte de 15000 DZD réglé par BaridiMob. Reste 18000 DZD en espèces à la prise en charge.'
),
(
  '50000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '3 days',
  'active',
  60000.00, 15000.00,
  CURRENT_DATE - INTERVAL '4 days',
  CURRENT_DATE - INTERVAL '2 days',
  'c0000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '3 days',
  NULL, NULL, NULL,
  'Location hebdomadaire.',
  'Véhicule remis le 14/09 à 10h. PV de départ signé sans réserve.'
),
(
  '50000000-0000-0000-0000-000000000005',
  'd0000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE - INTERVAL '7 days',
  'completed',
  11400.00, 5000.00,
  CURRENT_DATE - INTERVAL '12 days',
  CURRENT_DATE - INTERVAL '10 days',
  'c0000000-0000-0000-0000-000000000001',
  CURRENT_DATE - INTERVAL '11 days',
  NULL, NULL, NULL,
  'Séjour à Alger.',
  'Véhicule restitué propre dans les temps, acompte de garantie libéré.'
),
(
  '50000000-0000-0000-0000-000000000006',
  'd0000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE - INTERVAL '12 days',
  'cancelled',
  28500.00, 10000.00,
  NULL, NULL, NULL, NULL,
  'd0000000-0000-0000-0000-000000000002',
  'Annulation pour imprévu professionnel et changement de vol.',
  CURRENT_DATE - INTERVAL '16 days',
  NULL, NULL
),
(
  '50000000-0000-0000-0000-000000000007',
  'd0000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000006',
  CURRENT_DATE - INTERVAL '8 days',
  CURRENT_DATE - INTERVAL '5 days',
  'no_show',
  72000.00, 35000.00,
  NULL,
  CURRENT_DATE - INTERVAL '9 days',
  'c0000000-0000-0000-0000-000000000003',
  CURRENT_DATE - INTERVAL '11 days',
  NULL,
  'Délai de paiement d''acompte de 48h dépassé sans réponse du client.',
  CURRENT_DATE - INTERVAL '9 days',
  NULL,
  'Tentative de contact téléphonique vaine. Statut basculé en no-show par le cron.'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  total_price = EXCLUDED.total_price;

-------------------------------------------------------------------------------
-- STEP 10: PAYMENTS
-------------------------------------------------------------------------------
INSERT INTO public.payments (id, reservation_id, amount, type, method, status, reference, recorded_by)
VALUES
(
  '60000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000003',
  15000.00, 'deposit', 'baridimob', 'completed', 'BMO-20240915-89410',
  'c0000000-0000-0000-0000-000000000001'
),
(
  '60000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000004',
  15000.00, 'deposit', 'edahabia', 'completed', 'SATIM-EDH-993201',
  'c0000000-0000-0000-0000-000000000001'
),
(
  '60000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000004',
  45000.00, 'final', 'cash', 'completed', 'REC-CASH-DZ-04192',
  'c0000000-0000-0000-0000-000000000001'
),
(
  '60000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000005',
  5000.00, 'deposit', 'cib', 'completed', 'SATIM-CIB-552019',
  'c0000000-0000-0000-0000-000000000001'
),
(
  '60000000-0000-0000-0000-000000000005',
  '50000000-0000-0000-0000-000000000005',
  6400.00, 'final', 'cash', 'completed', 'REC-CASH-DZ-03891',
  'c0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- STEP 11: VEHICLE CONDITION REPORTS (PVs)
-------------------------------------------------------------------------------
INSERT INTO public.vehicle_condition_reports (id, reservation_id, stage, odometer_reading, fuel_level, photos, notes, damage_noted, staff_id)
VALUES
(
  '70000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000004',
  'pickup',
  42150,
  'full',
  ARRAY[
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'
  ],
  'Véhicule remis propre intérieur et extérieur. Roue de secours et trousse de secours présentes. Plein de carburant effectué.',
  false,
  'c0000000-0000-0000-0000-000000000001'
),
(
  '70000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000005',
  'pickup',
  58900,
  'full',
  ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'],
  'Départ agence Alger centre. Aucun dommage carrosserie.',
  false,
  'c0000000-0000-0000-0000-000000000001'
),
(
  '70000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000005',
  'return',
  59420,
  'full',
  ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'],
  'Restitution effectuée à l''heure. Légère micro-rayure sur pare-choc arrière sans gravité, couverte par la franchise standard. Caution débloquée.',
  false,
  'c0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- STEP 12: DOCUMENTS, REVIEWS, NOTIFICATIONS, AUDIT LOG
-------------------------------------------------------------------------------
INSERT INTO public.documents (id, profile_id, type, storage_path, verified, verified_by, verified_at)
VALUES
(
  '80000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'license',
  'licenses/karim_benali_license.jpg',
  true,
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '30 days'
),
(
  '80000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  'license',
  'licenses/amina_kadri_license.jpg',
  true,
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '10 days'
),
(
  '80000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000003',
  'national_id',
  'licenses/yacine_meziane_cni.jpg',
  true,
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '60 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, reservation_id, customer_id, rating, comment)
VALUES
(
  '90000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000005',
  'd0000000-0000-0000-0000-000000000003',
  5,
  'Service impeccable à l''agence d''Alger. La voiture était très propre, consommation minime, et la remise des clés a pris moins de 5 minutes. Je recommande vivement !'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, profile_id, type, title_ar, title_fr, title_en, message_ar, message_fr, message_en, is_read)
VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'reservation_confirmed',
  'تم تأكيد طلب الحجز الخاص بك',
  'Votre demande de réservation a été confirmée',
  'Your reservation request has been confirmed',
  'يرجى دفع العربون المسترد بقيمة 5000 دج خلال 48 ساعة لتأكيد سيارتك.',
  'Veuillez régler votre acompte de 5000 DZD sous 48h pour bloquer définitivement le véhicule.',
  'Please pay the 5,000 DZD refundable deposit within 48 hours to lock your car.',
  false
),
(
  'a1000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'deposit_received',
  'تم استلام العربون بنجاح',
  'Acompte reçu avec succès',
  'Deposit successfully received',
  'تم تأكيد حجز سيارة هيونداي توسان بنجاح. ننتظركم غداً للاستلام.',
  'Votre réservation Hyundai Tucson est sécurisée. Nous vous attendons demain pour le départ.',
  'Your Hyundai Tucson booking is secured. We look forward to seeing you tomorrow for pickup.',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, actor_id, action, entity_type, entity_id, old_values, new_values, metadata)
VALUES
(
  'b1000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'reservation.confirmed',
  'reservation',
  '50000000-0000-0000-0000-000000000002',
  '{"status": "pending"}'::jsonb,
  '{"status": "confirmed", "deposit_deadline": "48h"}'::jsonb,
  '{"ip": "105.101.42.12", "source": "staff_portal"}'::jsonb
),
(
  'b1000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'reservation.deposit_paid',
  'reservation',
  '50000000-0000-0000-0000-000000000003',
  '{"status": "confirmed"}'::jsonb,
  '{"status": "deposit_paid", "method": "baridimob"}'::jsonb,
  '{"ip": "105.101.42.12", "payment_ref": "BMO-20240915-89410"}'::jsonb
),
(
  'b1000000-0000-0000-0000-000000000003',
  NULL,
  'reservation.no_show',
  'reservation',
  '50000000-0000-0000-0000-000000000007',
  '{"status": "confirmed"}'::jsonb,
  '{"status": "no_show", "reason": "deposit_deadline_expired"}'::jsonb,
  '{"trigger": "system_cron_job"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- STEP 13: VERIFICATION SUMMARY (Will display in SQL Results table)
-------------------------------------------------------------------------------
SELECT 
  (SELECT count(*) FROM public.branches) AS branches_count,
  (SELECT count(*) FROM public.profiles) AS profiles_count,
  (SELECT count(*) FROM public.vehicle_categories) AS categories_count,
  (SELECT count(*) FROM public.vehicles) AS vehicles_count,
  (SELECT count(*) FROM public.vehicle_photos) AS photos_count,
  (SELECT count(*) FROM public.reservations) AS reservations_count,
  (SELECT count(*) FROM public.payments) AS payments_count,
  (SELECT count(*) FROM public.vehicle_condition_reports) AS pvs_count;
