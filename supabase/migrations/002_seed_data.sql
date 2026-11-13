-- =============================================================================
-- DZRent — Seed Data v1.0
-- Run AFTER 001_initial_schema.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. BRANCHES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO branches (id, name_ar, name_fr, name_en, address, city, lat, lng, phone) VALUES
  ('10000000-0000-0000-0000-000000000001', 'وكالة الجزائر وسط - ديدوش مراد',           'Agence Alger Centre - Didouche Mourad',              'Algiers Central Agency',          '142 Rue Didouche Mourad, Alger-Centre',          'Alger',          36.7683,  3.0543,   '+213 21 74 12 30'),
  ('10000000-0000-0000-0000-000000000002', 'وكالة مطار وهران الدولي - أحمد بن بلة',    'Agence Aéroport Oran - Ahmed Ben Bella',             'Oran International Airport',      'Terminal Arrivées, Aéroport Es Sénia, Oran',     'Oran',           35.6238, -0.6212,  '+213 41 59 10 20'),
  ('10000000-0000-0000-0000-000000000003', 'وكالة قسنطينة - مطار محمد بوضياف',         'Agence Constantine - Aéroport Mohamed Boudiaf',      'Constantine Airport Agency',      'Zone Aéroportuaire, Constantine',                'Constantine',    36.2761,  6.6203,   '+213 31 81 22 45'),
  ('10000000-0000-0000-0000-000000000004', 'وكالة عنابة - المحطة البحرية والميناء',    'Agence Annaba - Gare Maritime & Port',               'Annaba Port Agency',              'Boulevard de la Révolution, Port d''Annaba',     'Annaba',         36.9028,  7.7667,   '+213 38 45 67 89'),
  ('10000000-0000-0000-0000-000000000005', 'وكالة سطيف - القطب التجاري العلمي',        'Agence Sétif - Pôle Commercial El Eulma',            'Setif Commercial Agency',         'Rue de Dubaï, El Eulma, Sétif',                  'Sétif',          36.1528,  5.6908,   '+213 36 87 34 12'),
  ('10000000-0000-0000-0000-000000000006', 'وكالة حاسي مسعود - قاعدة الحياة البترولية','Agence Hassi Messaoud - Base Logistique Pétrolière', 'Hassi Messaoud Oil Base Agency', 'Zone Industrielle Ouest, BP 12, Hassi Messaoud', 'Hassi Messaoud', 31.6804,  6.0728,   '+213 29 73 80 00');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. VEHICLE CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO vehicle_categories (id, name_ar, name_fr, name_en, description_ar, description_fr, description_en) VALUES
  ('20000000-0000-0000-0000-000000000001',
   'سيارات اقتصادية وسياحية', 'Citadines & Économiques', 'Compact & Economy Cars',
   'مركبات اقتصادية مثالية للتنقل اليومي داخل شوارع المدن.',
   'Parfaites pour la ville et les trajets économiques.',
   'Fuel-efficient and agile vehicles ideal for city navigation.'),
  ('20000000-0000-0000-0000-000000000002',
   'سيارات عائلية وبرلين راقية', 'Berlines & Routières', 'Sedans & Executive Cars',
   'مساحات واسعة وراحة متناهية للرحلات الطويلة بين الولايات.',
   'Confort supérieur et grand coffre pour vos voyages interwilayas.',
   'Maximum comfort for interstate travel.'),
  ('20000000-0000-0000-0000-000000000003',
   'سيارات دفع رباعي SUV 4x4', 'SUVs & Tout-Terrain 4x4', 'SUVs & 4x4 All-Terrain',
   'قوة وتحمل للمسارات الوعرة والجبال والتنقلات الصحراوية.',
   'Robustesse et motricité intégrale pour le Sud et les reliefs difficiles.',
   'Powerful all-wheel capability for challenging terrain.'),
  ('20000000-0000-0000-0000-000000000004',
   'شاحنات نقل وبضائع نفعية', 'Utilitaires & Fourgons', 'Utility & Cargo Vans',
   'حلول لوجستية ونقل تجاري لنقل البضائع والمعدات.',
   'Idéal pour déménagements, transports commerciaux et marchandises.',
   'Optimized commercial cargo haulers.'),
  ('20000000-0000-0000-0000-000000000005',
   'مركبات ثقيلة وبيك آب متخصصة', 'Engins Lourds & Pick-ups', 'Heavy Machinery & Pickups',
   'شاحنات مزدوجة وآلات للمشاريع الإنشائية والصناعية.',
   'Véhicules renforcés pour chantiers de BTP, forages et carrières.',
   'Heavy-duty pickups for field operations.');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. DEMO AUTH USERS  (create via Supabase Auth then set UUIDs to match our IDs)
-- Note: In Supabase, go to Authentication → Users → "Add User" for each,
-- using these exact UUIDs is not possible via UI; instead the trigger will
-- create their profiles automatically.  These INSERTs are for local dev only.
-- For Supabase cloud: use the SQL below after creating users in Auth.
-- ─────────────────────────────────────────────────────────────────────────────

-- Demo profiles (upsert so re-runs are safe)
INSERT INTO profiles (id, full_name, phone, role, branch_id, preferred_language, license_verified) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Samir Belkacem',  '+213 555 00 11 00', 'admin',          NULL,                                           'ar', true),
  ('b0000000-0000-0000-0000-000000000001', 'Rachid Haddad',   '+213 555 00 22 00', 'branch_manager', '10000000-0000-0000-0000-000000000001',          'ar', true),
  ('c0000000-0000-0000-0000-000000000001', 'Youcef Mansouri', '+213 555 00 33 00', 'staff',          '10000000-0000-0000-0000-000000000002',          'ar', true),
  ('d0000000-0000-0000-0000-000000000001', 'Karim Benali',    '+213 550 12 34 56', 'customer',       NULL,                                           'ar', true),
  ('d0000000-0000-0000-0000-000000000002', 'Amira Brahimi',   '+213 550 65 43 21', 'customer',       NULL,                                           'fr', true),
  ('d0000000-0000-0000-0000-000000000003', 'Sofiane Kerroum', '+213 550 77 88 99', 'customer',       NULL,                                           'ar', true),
  ('d0000000-0000-0000-0000-000000000004', 'Nadia Oussama',   '+213 550 11 22 33', 'customer',       NULL,                                           'fr', false)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone     = EXCLUDED.phone,
  role      = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. VEHICLES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO vehicles (id, branch_id, category_id, make, model, year, plate_number, transmission, seats, fuel_type, daily_rate, deposit_amount, mileage_limit_km, status) VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Renault',  'Clio V Intens',           2024, '01423-124-16', 'manual',    5, 'petrol',  6500,  5000, 300,  'available'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Dacia',    'Sandero Stepway TCe',     2024, '03891-124-31', 'manual',    5, 'petrol',  6000,  5000, 350,  'rented'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Peugeot',  '208 GT Line',             2024, '02314-124-16', 'automatic', 5, 'petrol',  7500,  5000, NULL, 'rented'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Skoda',    'Octavia Style TDI',       2023, '05621-123-16', 'automatic', 5, 'diesel',  11000, 5000, 400,  'rented'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Hyundai',  'Elantra Premium',         2024, '09234-124-19', 'automatic', 5, 'petrol',  9000,  5000, NULL, 'available'),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Toyota',   'Corolla Prestige',        2024, '07122-124-25', 'automatic', 5, 'hybrid',  9500,  5000, NULL, 'available'),
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'Toyota',   'Land Cruiser Prado TX-L', 2024, '08945-124-30', 'automatic', 7, 'diesel',  24000, 10000,500,  'rented'),
  ('40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'Hyundai',  'Tucson N-Line 4WD',       2024, '01844-124-16', 'automatic', 5, 'diesel',  16000, 5000, 400,  'maintenance'),
  ('40000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Mitsubishi','Pajero Sport GLS',       2023, '03017-123-31', 'automatic', 7, 'diesel',  18000, 7000, 500,  'available'),
  ('40000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Renault',  'Master Fourgon GV',       2023, '04129-123-23', 'manual',    3, 'diesel',  13000, 5000, 400,  'available'),
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'Peugeot',  'Expert Traveller L2',     2024, '02801-124-16', 'manual',    9, 'diesel',  14000, 6000, 350,  'available'),
  ('40000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Ford',     'Ranger Raptor 4x4',       2024, '05512-124-19', 'automatic', 5, 'diesel',  19000, 8000, 600,  'available'),
  ('40000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', 'Toyota',   'Hilux Double Cabine 4x4', 2024, '06711-124-30', 'manual',    5, 'diesel',  17000, 5000, 500,  'available');

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. VEHICLE PHOTOS (using Unsplash for demo)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO vehicle_photos (vehicle_id, storage_path, is_primary, sort_order) VALUES
  ('40000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&q=80', true,  0),
  ('40000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80', true,  0),
  ('40000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80', true,  0),
  ('40000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1619767886558-efdc259b6e09?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1570733117311-d990c3816c47?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', true, 0),
  ('40000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&q=80', true, 0);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RESERVATIONS  (dates use NOW() offsets so the dashboard always shows live data)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO reservations (id, customer_id, vehicle_id, pickup_branch_id, dropoff_branch_id, start_date, end_date, status, total_price, deposit_amount, deposit_paid_at, confirmed_by, confirmed_at, notes, staff_notes) VALUES

  -- Active rentals (currently on the road)
  ('50000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '2 days', NOW() + INTERVAL '2 days',
   'active', 24000, 25000, NOW() - INTERVAL '2 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days',
   'Airport terminal delivery requested', 'Biometric license verified'),

  ('50000000-0000-0000-0000-000000000002',
   'd0000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days',
   'active', 37500, 30000, NOW() - INTERVAL '1 day',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days',
   'GPS navigation package added', 'Clean handover'),

  ('50000000-0000-0000-0000-000000000003',
   'd0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days',
   'active', 66000, 40000, NOW() - INTERVAL '1 day',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day 2 hours',
   'Interstate highway travel', 'Full fuel tank confirmed'),

  ('50000000-0000-0000-0000-000000000004',
   'd0000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006',
   NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days',
   'active', 168000, 50000, NOW() - INTERVAL '3 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days',
   'Oil company desert exploration mission', 'Satellite tracker activated'),

  -- Pending requests (awaiting staff approval)
  ('50000000-0000-0000-0000-000000000005',
   'd0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days',
   'pending', 19500, 25000, NULL, NULL, NULL,
   'Customer requesting baby seat', NULL),

  ('50000000-0000-0000-0000-000000000006',
   'd0000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '7 days',
   'pending', 38000, 30000, NULL, NULL, NULL,
   'Flight arriving Constantine at 08:30', NULL),

  ('50000000-0000-0000-0000-000000000007',
   'd0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000010',
   '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004',
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days',
   'pending', 26000, 35000, NULL, NULL, NULL,
   'Commercial hardware transport Annaba', NULL),

  -- Overdue return (end_date in the past, still active)
  ('50000000-0000-0000-0000-000000000008',
   'd0000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000009',
   '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day',
   'active', 90000, 35000, NOW() - INTERVAL '5 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days',
   'Should have returned yesterday', NULL),

  -- Completed reservations (last 30 days for revenue chart)
  ('50000000-0000-0000-0000-000000000009',
   'd0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days',
   'completed', 32500, 25000, NOW() - INTERVAL '20 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '21 days',
   NULL, 'Deposit fully released'),

  ('50000000-0000-0000-0000-000000000010',
   'd0000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005',
   NOW() - INTERVAL '18 days', NOW() - INTERVAL '12 days',
   'completed', 54000, 25000, NOW() - INTERVAL '18 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '19 days',
   'Business trip Sétif', 'All clear'),

  ('50000000-0000-0000-0000-000000000011',
   'd0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003',
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days',
   'completed', 66500, 30000, NOW() - INTERVAL '15 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '16 days',
   'Constantine business summit', 'All paperwork verified'),

  ('50000000-0000-0000-0000-000000000012',
   'd0000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '17 days',
   'completed', 312000, 50000, NOW() - INTERVAL '30 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '31 days',
   'Sahara pipeline site survey', 'Returned in pristine condition'),

  ('50000000-0000-0000-0000-000000000013',
   'd0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000011',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days',
   'completed', 42000, 30000, NOW() - INTERVAL '10 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '11 days',
   'Group transfer for a wedding', NULL),

  ('50000000-0000-0000-0000-000000000014',
   'd0000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000012',
   '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005',
   NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days',
   'completed', 95000, 40000, NOW() - INTERVAL '8 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '9 days',
   'Adventure tour Chréa', NULL),

  -- Handovers and returns scheduled TODAY
  ('50000000-0000-0000-0000-000000000015',
   'd0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005',
   NOW()::date + INTERVAL '10 hours', NOW()::date + INTERVAL '4 days 18 hours',
   'deposit_paid', 36000, 25000, NOW() - INTERVAL '2 hours',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 hours',
   NULL, NULL),

  ('50000000-0000-0000-0000-000000000016',
   'd0000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000013',
   '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006',
   NOW() - INTERVAL '6 days', NOW()::date + INTERVAL '16 hours',
   'active', 102000, 25000, NOW() - INTERVAL '6 days',
   'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days',
   'Oil field logistics run', 'Due for return this afternoon');

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO payments (reservation_id, amount, type, method, status, reference, recorded_by) VALUES
  ('50000000-0000-0000-0000-000000000001', 25000, 'deposit', 'cash',       'completed', 'DEP-2026-001', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', 30000, 'deposit', 'baridimob',  'completed', 'BRD-2026-002', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000003', 40000, 'deposit', 'ccp',        'completed', 'CCP-2026-003', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000004', 50000, 'deposit', 'bank_transfer','completed','BNK-2026-004', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000008', 35000, 'deposit', 'cash',       'completed', 'DEP-2026-008', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000009', 25000, 'deposit', 'edahabia',   'completed', 'EDH-2026-009', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000009', 32500, 'final',   'cash',       'completed', 'FIN-2026-009', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000010', 25000, 'deposit', 'baridimob',  'completed', 'BRD-2026-010', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000010', 54000, 'final',   'cash',       'completed', 'FIN-2026-010', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000011', 30000, 'deposit', 'ccp',        'completed', 'CCP-2026-011', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000011', 66500, 'final',   'baridimob',  'completed', 'BRD-2026-011', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000012', 50000, 'deposit', 'bank_transfer','completed','BNK-2026-012', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000012', 312000,'final',   'bank_transfer','completed','BNK-FIN-2026-012','c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000015', 25000, 'deposit', 'baridimob',  'completed', 'BRD-2026-015', 'c0000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000016', 25000, 'deposit', 'cash',       'completed', 'DEP-2026-016', 'c0000000-0000-0000-0000-000000000001');

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE ✓
-- ─────────────────────────────────────────────────────────────────────────────
