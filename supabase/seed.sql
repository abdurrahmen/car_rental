-- ===================================================================
-- ALGERIA CAR RENTAL PLATFORM — REALISTIC DEMO DATA SEED
-- ===================================================================
-- This script populates every table with realistic demo data for the
-- Algerian market, including multiple roles, diverse vehicle categories
-- (economy, sedans, 4x4 SUVs, utility vans, heavy machinery/pickups),
-- reservations in all 7 lifecycle states, payments, condition reports
-- (PV d'état des lieux), documents, reviews, notifications, and audit logs.
-- ===================================================================

-- Ensure pgcrypto extension exists for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean previous seed entries gracefully if re-running
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
-- 1. AGENCIES / BRANCHES (6 major Algerian Wilayas)
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
-- 2. AUTH USERS & PROFILES (Multiple roles & realistic personas)
-------------------------------------------------------------------------------
-- Helper macro: create auth user if auth.users exists
DO $$
DECLARE
  pwd_hash text := crypt('password123', gen_salt('bf'));
BEGIN
  -- 1. Admin
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

  -- 2. Branch Managers (Algiers & Oran)
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

  -- 3. Staff Agents
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

  -- 4. Diverse Customers
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

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Notice: Auth users could not be directly inserted (external auth mode). Inserting profiles directly.';
END $$;

-- Populate Profiles Table
INSERT INTO public.profiles (id, full_name, phone, role, branch_id, preferred_language, license_number, license_document_url, license_verified, is_blacklisted, no_show_count)
VALUES
-- Admin
('a0000000-0000-0000-0000-000000000001', 'Samir Belkacem', '+213 550 11 22 33', 'admin', NULL, 'ar', '16/2012/84920', NULL, true, false, 0),

-- Branch Managers
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
('d0000000-0000-0000-0000-000000000004', 'Mourad Tebbani', '+213 552 00 11 22', 'customer', NULL, 'ar', '16/2010/00492', NULL, false, true, 4), -- Blacklisted
('d0000000-0000-0000-0000-000000000005', 'Farid Gherbi', '+213 775 33 44 55', 'customer', NULL, 'ar', '19/2020/55481', NULL, false, false, 2) -- High No-show count
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  is_blacklisted = EXCLUDED.is_blacklisted,
  no_show_count = EXCLUDED.no_show_count;

-------------------------------------------------------------------------------
-- 3. VEHICLE CATEGORIES (Cars, Trucks, Heavy Machinery & Pickups)
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
-- 4. VEHICLES FLEET (15 Realistic Vehicles Across Categories)
-------------------------------------------------------------------------------
INSERT INTO public.vehicles (id, branch_id, category_id, make, model, year, plate_number, transmission, seats, fuel_type, daily_rate, deposit_amount, mileage_limit_km, status)
VALUES
-- Compact Cars
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001', -- Alger
  '20000000-0000-0000-0000-000000000001', -- Compact
  'Dacia', 'Logan Stepway', 2023, '01849-123-16', 'manual', 5, 'petrol', 4200.00, 5000.00, 300, 'available'
),
(
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001', -- Alger
  '20000000-0000-0000-0000-000000000001', -- Compact
  'Renault', 'Symbol Essence', 2022, '04910-122-16', 'manual', 5, 'petrol', 3800.00, 5000.00, NULL, 'available'
),
(
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000002', -- Oran
  '20000000-0000-0000-0000-000000000001', -- Compact
  'Hyundai', 'Grand i10', 2023, '11920-123-31', 'automatic', 5, 'petrol', 4500.00, 5000.00, 350, 'available'
),

-- Executive Sedans
(
  '30000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001', -- Alger
  '20000000-0000-0000-0000-000000000002', -- Sedans
  'Volkswagen', 'Golf 8 R-Line', 2023, '00104-123-16', 'automatic', 5, 'petrol', 12000.00, 15000.00, 250, 'rented'
),
(
  '30000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000002', -- Oran
  '20000000-0000-0000-0000-000000000002', -- Sedans
  'Peugeot', '508 GT', 2023, '20491-123-31', 'automatic', 5, 'diesel', 14000.00, 20000.00, NULL, 'available'
),
(
  '30000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000003', -- Constantine
  '20000000-0000-0000-0000-000000000002', -- Sedans
  'Skoda', 'Octavia Ambition', 2022, '08420-122-25', 'automatic', 5, 'diesel', 9500.00, 10000.00, 300, 'available'
),

-- SUVs & 4x4
(
  '30000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000001', -- Alger
  '20000000-0000-0000-0000-000000000003', -- SUV
  'Hyundai', 'Tucson CRDi 4WD', 2024, '00481-124-16', 'automatic', 5, 'diesel', 11000.00, 15000.00, 300, 'available'
),
(
  '30000000-0000-0000-0000-000000000008',
  '10000000-0000-0000-0000-000000000006', -- Hassi Messaoud
  '20000000-0000-0000-0000-000000000003', -- SUV
  'Toyota', 'Land Cruiser Prado TX-L', 2023, '00912-123-30', 'automatic', 7, 'diesel', 24000.00, 35000.00, NULL, 'available'
),
(
  '30000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000003', -- Constantine
  '20000000-0000-0000-0000-000000000003', -- SUV
  'Dacia', 'Duster Prestige 4x4', 2023, '14002-123-25', 'manual', 5, 'diesel', 7500.00, 8000.00, 350, 'available'
),

-- Utility Cargo Vans & Commercial Trucks
(
  '30000000-0000-0000-0000-000000000010',
  '10000000-0000-0000-0000-000000000004', -- Annaba
  '20000000-0000-0000-0000-000000000004', -- Utility
  'Peugeot', 'Boxer Fourgon L3H2', 2023, '02819-123-23', 'manual', 3, 'diesel', 10500.00, 15000.00, 400, 'available'
),
(
  '30000000-0000-0000-0000-000000000011',
  '10000000-0000-0000-0000-000000000005', -- Setif
  '20000000-0000-0000-0000-000000000004', -- Utility
  'Renault', 'Master Grand Volume 13m³', 2022, '18402-122-19', 'manual', 3, 'diesel', 12000.00, 20000.00, 350, 'available'
),
(
  '30000000-0000-0000-0000-000000000012',
  '10000000-0000-0000-0000-000000000005', -- Setif
  '20000000-0000-0000-0000-000000000004', -- Utility
  'Hyundai', 'H-100 Camion Plateau', 2023, '09124-123-19', 'manual', 3, 'diesel', 8500.00, 10000.00, 300, 'maintenance'
),

-- Pickups & Heavy Machinery / Industrial Fleet
(
  '30000000-0000-0000-0000-000000000013',
  '10000000-0000-0000-0000-000000000006', -- Hassi Messaoud
  '20000000-0000-0000-0000-000000000005', -- Heavy/Pickups
  'Toyota', 'Hilux Double Cab 4x4 Sahara Edition', 2023, '04812-123-30', 'manual', 5, 'diesel', 16000.00, 25000.00, 400, 'available'
),
(
  '30000000-0000-0000-0000-000000000014',
  '10000000-0000-0000-0000-000000000006', -- Hassi Messaoud
  '20000000-0000-0000-0000-000000000005', -- Heavy/Pickups
  'Isuzu', 'D-Max 4x4 Crew Cab', 2022, '07194-122-30', 'manual', 5, 'diesel', 14500.00, 20000.00, 350, 'available'
),
(
  '30000000-0000-0000-0000-000000000015',
  '10000000-0000-0000-0000-000000000006', -- Hassi Messaoud
  '20000000-0000-0000-0000-000000000005', -- Heavy/Pickups
  'JCB', '3CX Chargeuse-Pelleteuse (Tractopelle)', 2021, 'ENGIN-0021-30', 'manual', 1, 'diesel', 38000.00, 50000.00, 100, 'available'
)
ON CONFLICT (id) DO UPDATE SET
  make = EXCLUDED.make,
  model = EXCLUDED.model,
  daily_rate = EXCLUDED.daily_rate,
  status = EXCLUDED.status;

-------------------------------------------------------------------------------
-- 5. VEHICLE PHOTOS (High quality Unsplash clean angle URLs)
-------------------------------------------------------------------------------
INSERT INTO public.vehicle_photos (id, vehicle_id, storage_path, is_primary, sort_order)
VALUES
-- Dacia Logan
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Renault Symbol
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Hyundai i10
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&auto=format&fit=crop&q=80', true, 0),
-- VW Golf 8
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Peugeot 508
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Skoda Octavia
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Hyundai Tucson
('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Toyota Land Cruiser Prado
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Dacia Duster 4x4
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Peugeot Boxer Fourgon
('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Renault Master Utility
('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Hyundai H-100 Truck
('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Toyota Hilux 4x4
('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&auto=format&fit=crop&q=80', true, 0),
-- Isuzu D-Max
('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&auto=format&fit=crop&q=80', true, 0),
-- JCB Heavy Equipment
('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=1200&auto=format&fit=crop&q=80', true, 0)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- 6. RESERVATIONS (Covering ALL 7 Lifecycle States)
-------------------------------------------------------------------------------
-- Note: Dates are carefully segregated across vehicles to satisfy the GiST
-- double-booking exclusion constraint.
INSERT INTO public.reservations (
  id, customer_id, vehicle_id, pickup_branch_id, dropoff_branch_id,
  start_date, end_date, status, total_price, deposit_amount,
  deposit_paid_at, deposit_deadline, confirmed_by, confirmed_at,
  cancelled_by, cancelled_reason, cancelled_at, notes, staff_notes
)
VALUES
-- 1. PENDING (Customer submitted, waiting for staff review in Algiers)
(
  '50000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001', -- Karim
  '30000000-0000-0000-0000-000000000001', -- Dacia Logan
  '10000000-0000-0000-0000-000000000001', -- Alger
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

-- 2. CONFIRMED (Staff approved, 48h deadline active, awaiting deposit)
(
  '50000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002', -- Amina
  '30000000-0000-0000-0000-000000000003', -- Hyundai i10
  '10000000-0000-0000-0000-000000000002', -- Oran
  '10000000-0000-0000-0000-000000000002',
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '6 days',
  'confirmed',
  18000.00, 5000.00,
  NULL,
  now() + INTERVAL '36 hours', -- Active deposit window
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '12 hours',
  NULL, NULL, NULL,
  'Arrivée vol AH1002 d''Alger à 14h.',
  'Permis vérifié conforme. En attente paiement acompte CIB/Edahabia.'
),

-- 3. DEPOSIT_PAID (Deposit verified, booked & locked for pickup tomorrow)
(
  '50000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000003', -- Yacine
  '30000000-0000-0000-0000-000000000007', -- Hyundai Tucson
  '10000000-0000-0000-0000-000000000001', -- Alger
  '10000000-0000-0000-0000-000000000003', -- Constantine (inter-branch return)
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

-- 4. ACTIVE (Car currently picked up and on the road)
(
  '50000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000001', -- Karim
  '30000000-0000-0000-0000-000000000004', -- VW Golf 8
  '10000000-0000-0000-0000-000000000001', -- Alger
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

-- 5. COMPLETED (Returned, inspected, final balance settled)
(
  '50000000-0000-0000-0000-000000000005',
  'd0000000-0000-0000-0000-000000000003', -- Yacine
  '30000000-0000-0000-0000-000000000002', -- Renault Symbol
  '10000000-0000-0000-0000-000000000001', -- Alger
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

-- 6. CANCELLED (Customer requested cancellation before deposit)
(
  '50000000-0000-0000-0000-000000000006',
  'd0000000-0000-0000-0000-000000000002', -- Amina
  '30000000-0000-0000-0000-000000000006', -- Skoda Octavia
  '10000000-0000-0000-0000-000000000003', -- Constantine
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

-- 7. NO_SHOW (Deposit deadline expired without payment or pickup ghost)
(
  '50000000-0000-0000-0000-000000000007',
  'd0000000-0000-0000-0000-000000000005', -- Farid (No-show customer)
  '30000000-0000-0000-0000-000000000008', -- Toyota Prado
  '10000000-0000-0000-0000-000000000006', -- Ouargla
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
-- 7. PAYMENTS (Deposits, Cash Balance, Edahabia, CIB)
-------------------------------------------------------------------------------
INSERT INTO public.payments (id, reservation_id, amount, type, method, status, reference, recorded_by)
VALUES
-- Deposit for Yacine (Tucson)
(
  '60000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000003',
  15000.00, 'deposit', 'baridimob', 'completed', 'BMO-20240915-89410',
  'c0000000-0000-0000-0000-000000000001'
),
-- Deposit for Karim (Golf 8)
(
  '60000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000004',
  15000.00, 'deposit', 'edahabia', 'completed', 'SATIM-EDH-993201',
  'c0000000-0000-0000-0000-000000000001'
),
-- Cash balance for Karim (Golf 8)
(
  '60000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000004',
  45000.00, 'final', 'cash', 'completed', 'REC-CASH-DZ-04192',
  'c0000000-0000-0000-0000-000000000001'
),
-- Completed rental payment (Renault Symbol)
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
-- 8. VEHICLE CONDITION REPORTS (PV d'état des lieux au départ et au retour)
-------------------------------------------------------------------------------
INSERT INTO public.vehicle_condition_reports (id, reservation_id, stage, odometer_reading, fuel_level, photos, notes, damage_noted, staff_id)
VALUES
-- Pickup PV for Karim's Golf 8 (Active rental)
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
-- Pickup PV for Yacine's completed Symbol
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
-- Return PV for Yacine's completed Symbol
(
  '70000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000005',
  'return',
  59420, -- 520 km total travel
  'full',
  ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'],
  'Restitution effectuée à l''heure. Légère micro-rayure sur pare-choc arrière sans gravité, couverte par la franchise standard. Caution débloquée.',
  false,
  'c0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- 9. USER DOCUMENTS (Verified & Pending Driving Licenses)
-------------------------------------------------------------------------------
INSERT INTO public.documents (id, profile_id, type, storage_path, verified, verified_by, verified_at)
VALUES
(
  '80000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001', -- Karim
  'license',
  'licenses/karim_benali_license.jpg',
  true,
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '30 days'
),
(
  '80000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002', -- Amina
  'license',
  'licenses/amina_kadri_license.jpg',
  true,
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '10 days'
),
(
  '80000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000003', -- Yacine
  'national_id',
  'licenses/yacine_meziane_cni.jpg',
  true,
  'c0000000-0000-0000-0000-000000000001',
  now() - INTERVAL '60 days'
)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- 10. REVIEWS (Verified completed rentals)
-------------------------------------------------------------------------------
INSERT INTO public.reviews (id, reservation_id, customer_id, rating, comment)
VALUES
(
  '90000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000005', -- Completed Symbol rental
  'd0000000-0000-0000-0000-000000000003', -- Yacine
  5,
  'Service impeccable à l''agence d''Alger. La voiture était très propre, consommation minime, et la remise des clés a pris moins de 5 minutes. Je recommande vivement !'
)
ON CONFLICT (id) DO NOTHING;

-------------------------------------------------------------------------------
-- 11. IN-APP NOTIFICATIONS
-------------------------------------------------------------------------------
INSERT INTO public.notifications (id, profile_id, type, title_ar, title_fr, title_en, message_ar, message_fr, message_en, is_read)
VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002', -- Amina
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
  'd0000000-0000-0000-0000-000000000003', -- Yacine
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

-------------------------------------------------------------------------------
-- 12. AUDIT LOG (Immutable trail of state changes)
-------------------------------------------------------------------------------
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
  NULL, -- Automated system cron
  'reservation.no_show',
  'reservation',
  '50000000-0000-0000-0000-000000000007',
  '{"status": "confirmed"}'::jsonb,
  '{"status": "no_show", "reason": "deposit_deadline_expired"}'::jsonb,
  '{"trigger": "system_cron_job"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- End of seed.sql
