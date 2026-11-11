-- =============================================================================
-- Migration: Complete Features (Notifications, Staff Management, Payments RLS)
-- Date: 2026-10-13
-- Run this in your Supabase SQL Editor.
-- =============================================================================

-- 1. Helper function to create notifications safely (SECURITY DEFINER)
-- Bypasses caller RLS so staff can notify customers and customers can notify staff
CREATE OR REPLACE FUNCTION public.create_notification(
  p_profile_id uuid,
  p_type text,
  p_title_ar text,
  p_title_fr text,
  p_title_en text,
  p_message_ar text,
  p_message_fr text,
  p_message_en text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_notif_id uuid;
BEGIN
  INSERT INTO public.notifications (
    profile_id, type,
    title_ar, title_fr, title_en,
    message_ar, message_fr, message_en,
    metadata
  ) VALUES (
    p_profile_id, p_type,
    p_title_ar, p_title_fr, p_title_en,
    p_message_ar, p_message_fr, p_message_en,
    p_metadata
  ) RETURNING id INTO v_notif_id;

  RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow authenticated users to INSERT notifications directly as well
DROP POLICY IF EXISTS "Authenticated INSERT notifications" ON public.notifications;
CREATE POLICY "Authenticated INSERT notifications" ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Allow Admin and Branch Managers to UPDATE staff profiles
-- Admin can update any profile; Branch Manager can update staff in their branch
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Branch managers UPDATE branch staff" ON public.profiles;
CREATE POLICY "Branch managers UPDATE branch staff" ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles m
    WHERE m.id = auth.uid()
    AND m.role = 'branch_manager'
    AND m.branch_id IS NOT NULL
    AND m.branch_id = profiles.branch_id
    AND profiles.role IN ('staff', 'branch_manager')
  )
)
WITH CHECK (
  -- Branch manager cannot assign 'admin' role
  role IN ('staff', 'branch_manager')
);

-- 4. Ensure payments can be inserted by customer for deposit or by staff
DROP POLICY IF EXISTS "Customer INSERT deposit payments" ON public.payments;
CREATE POLICY "Customer INSERT deposit payments" ON public.payments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.id = payments.reservation_id
    AND r.customer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Staff SELECT/INSERT branch payments" ON public.payments;
CREATE POLICY "Staff SELECT/INSERT branch payments" ON public.payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE r.id = payments.reservation_id
    AND (r.pickup_branch_id = p.branch_id OR r.dropoff_branch_id = p.branch_id OR p.role = 'admin')
    AND p.role IN ('staff', 'branch_manager', 'admin')
  )
);

-- 5. Mark deposit paid function update (allow both staff and customer submit flow)
CREATE OR REPLACE FUNCTION public.customer_submit_deposit(
  p_reservation_id uuid,
  p_payment_method text,
  p_payment_reference text
) RETURNS void AS $$
DECLARE
  v_res RECORD;
BEGIN
  SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id;
  
  IF v_res IS NULL THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  IF auth.uid() != v_res.customer_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_res.status != 'confirmed' THEN
    RAISE EXCEPTION 'Reservation is not awaiting deposit';
  END IF;

  UPDATE public.reservations
  SET status = 'deposit_paid',
      deposit_paid_at = now()
  WHERE id = p_reservation_id;

  INSERT INTO public.payments (
    reservation_id, amount, type, method, status, reference, recorded_by
  ) VALUES (
    p_reservation_id, v_res.deposit_amount, 'deposit', p_payment_method, 'completed', p_payment_reference, auth.uid()
  );

  PERFORM public.log_audit(
    'reservation.deposit_submitted', 'reservation', p_reservation_id,
    jsonb_build_object('status', 'confirmed'),
    jsonb_build_object('status', 'deposit_paid', 'reference', p_payment_reference, 'method', p_payment_method)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
