-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Required for GiST indexes on UUIDs for the exclusion constraint

-- Function to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-------------------------------------------------------------------------------
-- 1. branches
-------------------------------------------------------------------------------
CREATE TABLE public.branches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar text NOT NULL,
    name_fr text NOT NULL,
    name_en text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    lat double precision,
    lng double precision,
    phone text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_branches_modtime BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-------------------------------------------------------------------------------
-- 2. profiles (extends auth.users)
-------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    phone text,
    role text CHECK (role IN ('customer', 'staff', 'branch_manager', 'admin')) DEFAULT 'customer',
    branch_id uuid REFERENCES public.branches(id),
    preferred_language text CHECK (preferred_language IN ('ar', 'fr', 'en')) DEFAULT 'ar',
    license_number text,
    license_document_url text,
    license_verified boolean DEFAULT false,
    is_blacklisted boolean DEFAULT false,
    no_show_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-------------------------------------------------------------------------------
-- 3. vehicle_categories
-------------------------------------------------------------------------------
CREATE TABLE public.vehicle_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar text NOT NULL,
    name_fr text NOT NULL,
    name_en text NOT NULL,
    description_ar text,
    description_fr text,
    description_en text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_vehicle_categories_modtime BEFORE UPDATE ON public.vehicle_categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-------------------------------------------------------------------------------
-- 4. vehicles
-------------------------------------------------------------------------------
CREATE TABLE public.vehicles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id uuid NOT NULL REFERENCES public.branches(id),
    category_id uuid NOT NULL REFERENCES public.vehicle_categories(id),
    make text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    plate_number text UNIQUE NOT NULL,
    transmission text CHECK (transmission IN ('manual', 'automatic')),
    seats integer NOT NULL,
    fuel_type text CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
    daily_rate numeric(10,2) NOT NULL,
    deposit_amount numeric(10,2) NOT NULL DEFAULT 5000, -- DZD
    mileage_limit_km integer, -- null means unlimited
    status text CHECK (status IN ('available', 'rented', 'maintenance', 'retired')) DEFAULT 'available',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_vehicles_modtime BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-------------------------------------------------------------------------------
-- 5. vehicle_photos
-------------------------------------------------------------------------------
CREATE TABLE public.vehicle_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    storage_path text NOT NULL,
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-------------------------------------------------------------------------------
-- 6. reservations
-------------------------------------------------------------------------------
CREATE TABLE public.reservations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES public.profiles(id),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id),
    pickup_branch_id uuid NOT NULL REFERENCES public.branches(id),
    dropoff_branch_id uuid NOT NULL REFERENCES public.branches(id),
    start_date date NOT NULL,
    end_date date NOT NULL,
    date_range daterange GENERATED ALWAYS AS (daterange(start_date, end_date, '[]')) STORED,
    status text CHECK (status IN ('pending', 'confirmed', 'deposit_paid', 'active', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
    total_price numeric(10,2) NOT NULL,
    deposit_amount numeric(10,2) NOT NULL,
    deposit_paid_at timestamptz,
    deposit_deadline timestamptz,
    confirmed_by uuid REFERENCES public.profiles(id),
    confirmed_at timestamptz,
    cancelled_by uuid REFERENCES public.profiles(id),
    cancelled_reason text,
    cancelled_at timestamptz,
    notes text,
    staff_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CHECK (end_date > start_date),
    
    -- EXCLUSION CONSTRAINT: Prevents double-booking at the DB level.
    -- Uses btree_gist extension to allow '=' on uuid, and '&&' on daterange.
    -- Only active and confirmed reservations block others.
    CONSTRAINT prevent_double_booking EXCLUDE USING gist (
        vehicle_id WITH =, 
        date_range WITH &&
    ) WHERE (status IN ('confirmed', 'deposit_paid', 'active'))
);

CREATE TRIGGER update_reservations_modtime BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-------------------------------------------------------------------------------
-- 7. payments
-------------------------------------------------------------------------------
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id uuid NOT NULL REFERENCES public.reservations(id),
    amount numeric(10,2) NOT NULL,
    type text CHECK (type IN ('deposit', 'final', 'refund')),
    method text CHECK (method IN ('edahabia', 'cib', 'ccp', 'baridimob', 'cash', 'bank_transfer')),
    status text CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    reference text,
    recorded_by uuid REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-------------------------------------------------------------------------------
-- 8. vehicle_condition_reports
-------------------------------------------------------------------------------
CREATE TABLE public.vehicle_condition_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id uuid NOT NULL REFERENCES public.reservations(id),
    stage text CHECK (stage IN ('pickup', 'return')),
    odometer_reading integer NOT NULL,
    fuel_level text CHECK (fuel_level IN ('empty', 'quarter', 'half', 'three_quarter', 'full')),
    photos text[] DEFAULT '{}',
    notes text,
    damage_noted boolean DEFAULT false,
    staff_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now()
);

-------------------------------------------------------------------------------
-- 9. documents
-------------------------------------------------------------------------------
CREATE TABLE public.documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id),
    type text CHECK (type IN ('license', 'national_id', 'passport')),
    storage_path text NOT NULL,
    verified boolean DEFAULT false,
    verified_by uuid REFERENCES public.profiles(id),
    verified_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-------------------------------------------------------------------------------
-- 10. reviews
-------------------------------------------------------------------------------
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id uuid NOT NULL UNIQUE REFERENCES public.reservations(id),
    customer_id uuid NOT NULL REFERENCES public.profiles(id),
    rating integer CHECK (rating BETWEEN 1 AND 5),
    comment text,
    created_at timestamptz DEFAULT now()
);

-------------------------------------------------------------------------------
-- 11. notifications
-------------------------------------------------------------------------------
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id),
    type text NOT NULL,
    title_ar text,
    title_fr text,
    title_en text,
    message_ar text,
    message_fr text,
    message_en text,
    is_read boolean DEFAULT false,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

-------------------------------------------------------------------------------
-- 12. audit_log
-------------------------------------------------------------------------------
CREATE TABLE public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES public.profiles(id),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    old_values jsonb,
    new_values jsonb,
    metadata jsonb,
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-------------------------------------------------------------------------------
-- INDEXES
-------------------------------------------------------------------------------
CREATE INDEX idx_vehicles_branch_status ON public.vehicles(branch_id, status);
CREATE INDEX idx_vehicles_category_id ON public.vehicles(category_id);
CREATE INDEX idx_reservations_customer_status ON public.reservations(customer_id, status);
CREATE INDEX idx_reservations_vehicle_status ON public.reservations(vehicle_id, status);
CREATE INDEX idx_reservations_pickup_status ON public.reservations(pickup_branch_id, status);
CREATE INDEX idx_reservations_status_deadline ON public.reservations(status, deposit_deadline);
CREATE INDEX idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX idx_notifications_profile_read ON public.notifications(profile_id, is_read);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON public.audit_log(actor_id);
CREATE INDEX idx_documents_profile_id ON public.documents(profile_id);

-------------------------------------------------------------------------------
-- ENABLE RLS
-------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_condition_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- RLS POLICIES
-------------------------------------------------------------------------------

-- profiles
CREATE POLICY "Customers SELECT/UPDATE own row" ON public.profiles FOR ALL
USING (auth.uid() = id);

CREATE POLICY "Staff SELECT customers with reservations at branch" ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.profiles staff ON staff.id = auth.uid()
    WHERE r.customer_id = profiles.id 
    AND (r.pickup_branch_id = staff.branch_id OR r.dropoff_branch_id = staff.branch_id)
    AND staff.role IN ('staff', 'branch_manager')
  )
);

CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- branches
CREATE POLICY "Anyone authenticated SELECT active branches" ON public.branches FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admin full access branches" ON public.branches FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- vehicle_categories
CREATE POLICY "Anyone authenticated SELECT categories" ON public.vehicle_categories FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access categories" ON public.vehicle_categories FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- vehicles
CREATE POLICY "Anyone authenticated SELECT unretired vehicles" ON public.vehicles FOR SELECT
USING (auth.role() = 'authenticated' AND status != 'retired');

CREATE POLICY "Staff UPDATE branch vehicles" ON public.vehicles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND branch_id = vehicles.branch_id 
    AND role IN ('staff', 'branch_manager')
  )
);

CREATE POLICY "Admin full access vehicles" ON public.vehicles FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- vehicle_photos
CREATE POLICY "Anyone authenticated SELECT vehicle photos" ON public.vehicle_photos FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Staff modify branch vehicle photos" ON public.vehicle_photos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.profiles p ON p.branch_id = v.branch_id
    WHERE v.id = vehicle_photos.vehicle_id
    AND p.id = auth.uid()
    AND p.role IN ('staff', 'branch_manager')
  )
);

CREATE POLICY "Admin full access vehicle photos" ON public.vehicle_photos FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- reservations
CREATE POLICY "Customer SELECT own reservations" ON public.reservations FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Customer INSERT own reservations (pending only)" ON public.reservations FOR INSERT
WITH CHECK (
  customer_id = auth.uid() AND 
  status = 'pending'
);

CREATE POLICY "Customer UPDATE own reservations to cancel" ON public.reservations FOR UPDATE
USING (
  customer_id = auth.uid() AND 
  status = 'pending'
);

CREATE POLICY "Staff SELECT/UPDATE branch reservations" ON public.reservations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (branch_id = reservations.pickup_branch_id OR branch_id = reservations.dropoff_branch_id)
    AND role IN ('staff', 'branch_manager')
  )
);

CREATE POLICY "Admin full access reservations" ON public.reservations FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- payments
CREATE POLICY "Customer SELECT own payments" ON public.payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r 
    WHERE r.id = payments.reservation_id 
    AND r.customer_id = auth.uid()
  )
);

CREATE POLICY "Staff SELECT/INSERT branch payments" ON public.payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE r.id = payments.reservation_id 
    AND (r.pickup_branch_id = p.branch_id OR r.dropoff_branch_id = p.branch_id)
    AND p.role IN ('staff', 'branch_manager')
  )
);

CREATE POLICY "Admin full access payments" ON public.payments FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- vehicle_condition_reports
CREATE POLICY "Customer SELECT own reports" ON public.vehicle_condition_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r 
    WHERE r.id = vehicle_condition_reports.reservation_id 
    AND r.customer_id = auth.uid()
  )
);

CREATE POLICY "Staff SELECT/INSERT branch reports" ON public.vehicle_condition_reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE r.id = vehicle_condition_reports.reservation_id 
    AND (r.pickup_branch_id = p.branch_id OR r.dropoff_branch_id = p.branch_id)
    AND p.role IN ('staff', 'branch_manager')
  )
);

CREATE POLICY "Admin full access reports" ON public.vehicle_condition_reports FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- documents
CREATE POLICY "Customer SELECT/INSERT own documents" ON public.documents FOR ALL
USING (profile_id = auth.uid());

CREATE POLICY "Staff SELECT branch customer documents" ON public.documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE r.customer_id = documents.profile_id 
    AND (r.pickup_branch_id = p.branch_id OR r.dropoff_branch_id = p.branch_id)
    AND p.role IN ('staff', 'branch_manager')
  )
);

CREATE POLICY "Admin full access documents" ON public.documents FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- reviews
CREATE POLICY "Anyone authenticated SELECT reviews" ON public.reviews FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Customer INSERT review for completed reservation" ON public.reviews FOR INSERT
WITH CHECK (
  customer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.reservations r 
    WHERE r.id = reservation_id 
    AND r.status = 'completed'
  )
);

-- notifications
CREATE POLICY "User SELECT/UPDATE own notifications" ON public.notifications FOR ALL
USING (profile_id = auth.uid());

-- audit_log
CREATE POLICY "Admin SELECT audit log" ON public.audit_log FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-------------------------------------------------------------------------------
-- POSTGRES FUNCTIONS (SECURITY DEFINER)
-------------------------------------------------------------------------------

-- 1. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. log_audit
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_values, p_new_values);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. confirm_reservation
CREATE OR REPLACE FUNCTION public.confirm_reservation(p_reservation_id uuid, p_staff_notes text DEFAULT NULL)
RETURNS void AS $$
DECLARE
  v_role text;
  v_old_status text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role NOT IN ('staff', 'branch_manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT status INTO v_old_status FROM public.reservations WHERE id = p_reservation_id;
  
  UPDATE public.reservations 
  SET status = 'confirmed',
      deposit_deadline = now() + interval '24 hours',
      confirmed_by = auth.uid(),
      confirmed_at = now(),
      staff_notes = COALESCE(p_staff_notes, staff_notes)
  WHERE id = p_reservation_id AND status = 'pending';

  PERFORM public.log_audit('reservation.confirmed', 'reservation', p_reservation_id, jsonb_build_object('status', v_old_status), jsonb_build_object('status', 'confirmed'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. reject_reservation
CREATE OR REPLACE FUNCTION public.reject_reservation(p_reservation_id uuid, p_reason text)
RETURNS void AS $$
DECLARE
  v_role text;
  v_old_status text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role NOT IN ('staff', 'branch_manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT status INTO v_old_status FROM public.reservations WHERE id = p_reservation_id;

  UPDATE public.reservations 
  SET status = 'cancelled',
      cancelled_by = auth.uid(),
      cancelled_reason = p_reason,
      cancelled_at = now()
  WHERE id = p_reservation_id;

  PERFORM public.log_audit('reservation.rejected', 'reservation', p_reservation_id, jsonb_build_object('status', v_old_status), jsonb_build_object('status', 'cancelled'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. mark_deposit_paid
CREATE OR REPLACE FUNCTION public.mark_deposit_paid(p_reservation_id uuid, p_payment_reference text, p_payment_method text)
RETURNS void AS $$
DECLARE
  v_role text;
  v_old_status text;
  v_deposit_amount numeric;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role NOT IN ('staff', 'branch_manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT status, deposit_amount INTO v_old_status, v_deposit_amount 
  FROM public.reservations WHERE id = p_reservation_id;

  UPDATE public.reservations 
  SET status = 'deposit_paid',
      deposit_paid_at = now()
  WHERE id = p_reservation_id AND status = 'confirmed';

  INSERT INTO public.payments (reservation_id, amount, type, method, status, reference, recorded_by)
  VALUES (p_reservation_id, v_deposit_amount, 'deposit', p_payment_method, 'completed', p_payment_reference, auth.uid());

  PERFORM public.log_audit('reservation.deposit_paid', 'reservation', p_reservation_id, jsonb_build_object('status', v_old_status), jsonb_build_object('status', 'deposit_paid'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. cancel_reservation
CREATE OR REPLACE FUNCTION public.cancel_reservation(p_reservation_id uuid, p_reason text)
RETURNS void AS $$
DECLARE
  v_customer_id uuid;
  v_role text;
  v_old_status text;
BEGIN
  SELECT customer_id, status INTO v_customer_id, v_old_status FROM public.reservations WHERE id = p_reservation_id;
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

  IF auth.uid() != v_customer_id AND v_role NOT IN ('staff', 'branch_manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.reservations 
  SET status = 'cancelled',
      cancelled_by = auth.uid(),
      cancelled_reason = p_reason,
      cancelled_at = now()
  WHERE id = p_reservation_id;

  PERFORM public.log_audit('reservation.cancelled', 'reservation', p_reservation_id, jsonb_build_object('status', v_old_status), jsonb_build_object('status', 'cancelled'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. activate_reservation
CREATE OR REPLACE FUNCTION public.activate_reservation(p_reservation_id uuid)
RETURNS void AS $$
DECLARE
  v_role text;
  v_old_status text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role NOT IN ('staff', 'branch_manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT status INTO v_old_status FROM public.reservations WHERE id = p_reservation_id;

  UPDATE public.reservations 
  SET status = 'active'
  WHERE id = p_reservation_id AND status = 'deposit_paid';

  PERFORM public.log_audit('reservation.activated', 'reservation', p_reservation_id, jsonb_build_object('status', v_old_status), jsonb_build_object('status', 'active'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. complete_reservation
CREATE OR REPLACE FUNCTION public.complete_reservation(p_reservation_id uuid)
RETURNS void AS $$
DECLARE
  v_role text;
  v_old_status text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role NOT IN ('staff', 'branch_manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT status INTO v_old_status FROM public.reservations WHERE id = p_reservation_id;

  UPDATE public.reservations 
  SET status = 'completed'
  WHERE id = p_reservation_id AND status = 'active';

  PERFORM public.log_audit('reservation.completed', 'reservation', p_reservation_id, jsonb_build_object('status', v_old_status), jsonb_build_object('status', 'completed'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. process_expired_deposits (cron job target)
CREATE OR REPLACE FUNCTION public.process_expired_deposits()
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT id, customer_id, status FROM public.reservations 
    WHERE status = 'confirmed' AND deposit_deadline < now()
  LOOP
    UPDATE public.reservations SET status = 'no_show' WHERE id = r.id;
    UPDATE public.profiles SET no_show_count = no_show_count + 1 WHERE id = r.customer_id;
    PERFORM public.log_audit('reservation.no_show', 'reservation', r.id, jsonb_build_object('status', r.status), jsonb_build_object('status', 'no_show'));
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
