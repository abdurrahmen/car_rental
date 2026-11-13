-- =============================================================================
-- DZRent — Initial Schema v1.0
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CUSTOM ENUM TYPES  (match types/database.ts exactly)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE user_role            AS ENUM ('customer', 'staff', 'branch_manager', 'admin');
CREATE TYPE vehicle_status       AS ENUM ('available', 'rented', 'maintenance', 'retired');
CREATE TYPE reservation_status   AS ENUM ('pending', 'confirmed', 'deposit_paid', 'active', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_type         AS ENUM ('deposit', 'final', 'refund');
CREATE TYPE payment_method_type  AS ENUM ('edahabia', 'cib', 'ccp', 'baridimob', 'cash', 'bank_transfer');
CREATE TYPE payment_status_type  AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transmission_type    AS ENUM ('manual', 'automatic');
CREATE TYPE fuel_type            AS ENUM ('petrol', 'diesel', 'hybrid', 'electric');
CREATE TYPE fuel_level_type      AS ENUM ('empty', 'quarter', 'half', 'three_quarter', 'full');
CREATE TYPE document_type        AS ENUM ('license', 'national_id', 'passport');
CREATE TYPE condition_stage_type AS ENUM ('pickup', 'return');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. BRANCHES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE branches (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar    TEXT NOT NULL,
  name_fr    TEXT NOT NULL,
  name_en    TEXT NOT NULL,
  address    TEXT NOT NULL DEFAULT '',
  city       TEXT NOT NULL,
  lat        NUMERIC(9,6),
  lng        NUMERIC(9,6),
  phone      TEXT NOT NULL DEFAULT '',
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_branches_city      ON branches(city);
CREATE INDEX idx_branches_is_active ON branches(is_active);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROFILES  (extends auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT,
  phone                TEXT,
  role                 user_role NOT NULL DEFAULT 'customer',
  branch_id            UUID REFERENCES branches(id) ON DELETE SET NULL,
  preferred_language   TEXT NOT NULL DEFAULT 'ar',
  license_number       TEXT,
  license_document_url TEXT,
  license_verified     BOOLEAN NOT NULL DEFAULT false,
  is_blacklisted       BOOLEAN NOT NULL DEFAULT false,
  no_show_count        INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role      ON profiles(role);
CREATE INDEX idx_profiles_branch_id ON profiles(branch_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. VEHICLE CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE vehicle_categories (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar        TEXT NOT NULL,
  name_fr        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  description_en TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. VEHICLES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE vehicles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id         UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  category_id       UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE RESTRICT,
  make              TEXT NOT NULL,
  model             TEXT NOT NULL,
  year              INTEGER NOT NULL,
  plate_number      TEXT NOT NULL UNIQUE,
  transmission      transmission_type NOT NULL DEFAULT 'manual',
  seats             INTEGER NOT NULL DEFAULT 5,
  fuel_type         fuel_type NOT NULL DEFAULT 'petrol',
  daily_rate        NUMERIC(10,2) NOT NULL,
  deposit_amount    NUMERIC(10,2) NOT NULL,
  mileage_limit_km  INTEGER,          -- NULL = unlimited
  status            vehicle_status NOT NULL DEFAULT 'available',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_branch_id   ON vehicles(branch_id);
CREATE INDEX idx_vehicles_category_id ON vehicles(category_id);
CREATE INDEX idx_vehicles_status      ON vehicles(status);
CREATE INDEX idx_vehicles_plate       ON vehicles(plate_number);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. VEHICLE PHOTOS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE vehicle_photos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  is_primary   BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_photos_vehicle_id ON vehicle_photos(vehicle_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RESERVATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE reservations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  pickup_branch_id  UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  dropoff_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  start_date        TIMESTAMPTZ NOT NULL,
  end_date          TIMESTAMPTZ NOT NULL,
  status            reservation_status NOT NULL DEFAULT 'pending',
  total_price       NUMERIC(10,2) NOT NULL,
  deposit_amount    NUMERIC(10,2) NOT NULL,
  deposit_paid_at   TIMESTAMPTZ,
  deposit_deadline  TIMESTAMPTZ,
  confirmed_by      UUID REFERENCES profiles(id),
  confirmed_at      TIMESTAMPTZ,
  cancelled_by      UUID REFERENCES profiles(id),
  cancelled_reason  TEXT,
  cancelled_at      TIMESTAMPTZ,
  notes             TEXT,
  staff_notes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_reservations_customer_id      ON reservations(customer_id);
CREATE INDEX idx_reservations_vehicle_id       ON reservations(vehicle_id);
CREATE INDEX idx_reservations_pickup_branch    ON reservations(pickup_branch_id);
CREATE INDEX idx_reservations_status           ON reservations(status);
CREATE INDEX idx_reservations_start_date       ON reservations(start_date);
CREATE INDEX idx_reservations_end_date         ON reservations(end_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  type           payment_type NOT NULL,
  method         payment_method_type NOT NULL,
  status         payment_status_type NOT NULL DEFAULT 'pending',
  reference      TEXT,
  recorded_by    UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_payment_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX idx_payments_status         ON payments(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. VEHICLE CONDITION REPORTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE vehicle_condition_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id   UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  stage            condition_stage_type NOT NULL,
  odometer_reading INTEGER NOT NULL,
  fuel_level       fuel_level_type NOT NULL DEFAULT 'full',
  photos           TEXT[] NOT NULL DEFAULT '{}',
  notes            TEXT,
  damage_noted     BOOLEAN NOT NULL DEFAULT false,
  staff_id         UUID NOT NULL REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_condition_reports_reservation ON vehicle_condition_reports(reservation_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. DOCUMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         document_type NOT NULL,
  storage_path TEXT NOT NULL,
  verified     BOOLEAN NOT NULL DEFAULT false,
  verified_by  UUID REFERENCES profiles(id),
  verified_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_profile_id ON documents(profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title_ar   TEXT NOT NULL DEFAULT '',
  title_fr   TEXT NOT NULL DEFAULT '',
  title_en   TEXT NOT NULL DEFAULT '',
  message_ar TEXT NOT NULL DEFAULT '',
  message_fr TEXT NOT NULL DEFAULT '',
  message_en TEXT NOT NULL DEFAULT '',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX idx_notifications_is_read    ON notifications(is_read);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. REVIEWS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  customer_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_reservation_id ON reviews(reservation_id);
CREATE INDEX idx_reviews_customer_id    ON reviews(customer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. AUDIT LOG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID NOT NULL,
  old_values  JSONB,
  new_values  JSONB,
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id    ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at  ON audit_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. AUTO-UPDATED updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_branches_updated_at             BEFORE UPDATE ON branches             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_updated_at             BEFORE UPDATE ON profiles             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vehicle_categories_updated_at   BEFORE UPDATE ON vehicle_categories   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vehicles_updated_at             BEFORE UPDATE ON vehicles             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reservations_updated_at         BEFORE UPDATE ON reservations         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at             BEFORE UPDATE ON payments             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_documents_updated_at            BEFORE UPDATE ON documents            FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
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
ALTER TABLE audit_logs                ENABLE ROW LEVEL SECURITY;

-- Helper: is the caller a staff-level user or above?
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('staff', 'branch_manager', 'admin')
  );
$$;

-- Helper: is the caller an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Branches: readable by all authenticated users, writable only by admins
CREATE POLICY "branches_read"   ON branches FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "branches_write"  ON branches FOR ALL    USING (is_admin());

-- Vehicle categories: readable by all, writable only by admins
CREATE POLICY "categories_read"  ON vehicle_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_write" ON vehicle_categories FOR ALL    USING (is_admin());

-- Vehicles: staff can read all, public can read available only
CREATE POLICY "vehicles_read_staff"   ON vehicles FOR SELECT USING (is_staff());
CREATE POLICY "vehicles_read_public"  ON vehicles FOR SELECT USING (status = 'available');
CREATE POLICY "vehicles_write_admin"  ON vehicles FOR ALL    USING (is_admin());
CREATE POLICY "vehicles_write_staff"  ON vehicles FOR UPDATE USING (is_staff());

-- Vehicle photos: same as vehicles
CREATE POLICY "vehicle_photos_read"  ON vehicle_photos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "vehicle_photos_write" ON vehicle_photos FOR ALL    USING (is_staff());

-- Profiles: users see their own row; staff see all
CREATE POLICY "profiles_self"       ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_staff_read" ON profiles FOR SELECT USING (is_staff());
CREATE POLICY "profiles_self_write" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_admin"      ON profiles FOR ALL    USING (is_admin());

-- Reservations: customers see their own; staff see all
CREATE POLICY "reservations_customer"  ON reservations FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "reservations_staff"     ON reservations FOR SELECT USING (is_staff());
CREATE POLICY "reservations_create"    ON reservations FOR INSERT WITH CHECK (customer_id = auth.uid() OR is_staff());
CREATE POLICY "reservations_update"    ON reservations FOR UPDATE USING (is_staff());

-- Payments: customers see payments for their reservations; staff see all
CREATE POLICY "payments_customer" ON payments FOR SELECT
  USING (reservation_id IN (SELECT id FROM reservations WHERE customer_id = auth.uid()));
CREATE POLICY "payments_staff"    ON payments FOR ALL USING (is_staff());

-- Notifications: each user sees only their own
CREATE POLICY "notifications_self" ON notifications FOR ALL USING (profile_id = auth.uid());

-- Reviews: customers manage their own; everyone can read
CREATE POLICY "reviews_read"   ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_write"  ON reviews FOR ALL    USING (customer_id = auth.uid());

-- Documents: users manage their own; staff can read
CREATE POLICY "documents_self"  ON documents FOR ALL    USING (profile_id = auth.uid());
CREATE POLICY "documents_staff" ON documents FOR SELECT USING (is_staff());

-- Condition reports & audit logs: staff only
CREATE POLICY "condition_reports_staff" ON vehicle_condition_reports FOR ALL USING (is_staff());
CREATE POLICY "audit_logs_admin"        ON audit_logs FOR SELECT USING (is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. NEW PROFILE TRIGGER (auto-create on signup)
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE ✓
-- ─────────────────────────────────────────────────────────────────────────────
