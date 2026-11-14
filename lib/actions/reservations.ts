'use server';

import { createClient } from '@/lib/supabase/server';
import { reservationRequestSchema, conditionReportSchema } from '@/lib/validations/reservation';
import { revalidatePath } from 'next/cache';
import { getAuthUser } from '@/lib/auth';
import { sendNotification, notifyBranchStaffAndAdmins } from '@/lib/actions/notifications';

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  entity_type: string,
  entity_id: string,
  old_values: Record<string, unknown> | null,
  new_values: Record<string, unknown> | null,
  actor_id: string,
) {
  try {
    const oldStatus = old_values?.status ?? 'none';
    const newStatus = new_values?.status ?? 'unknown';
    console.log(
      `[STATE MACHINE] transition: ${oldStatus} -> ${newStatus} (reservation_id: ${entity_id}, actor: ${actor_id}, action: ${action})`,
    );

    // Only attempt insert if entity_id is a valid UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entity_id)) {
      await supabase.from('audit_log').insert({
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        actor_id,
      });
    }
  } catch (err) {
    console.warn('[AuditLog] Failed to write audit log in reservations:', err);
  }
}

/**
 * 1. CREATE RESERVATION (Customer)
 */
export async function createReservation(
  prevState: unknown,
  formData: FormData,
) {
  const data = Object.fromEntries(formData.entries());
  const result = reservationRequestSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid fields' };
  }

  const appUser = await getAuthUser();
  if (!appUser) {
    return { error: 'Please sign in to make a reservation.' };
  }

  const supabase = await createClient();

  const { data: vehicle, error: vErr } = await supabase
    .from('vehicles')
    .select('daily_rate, deposit_amount, make, model')
    .eq('id', result.data.vehicle_id)
    .single();

  if (vErr || !vehicle) return { error: 'Vehicle not found' };

  const startMs = new Date(result.data.start_date).getTime();
  const endMs = new Date(result.data.end_date).getTime();
  const days = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const total_price = (vehicle.daily_rate || 0) * days;
  const deposit_amount = vehicle.deposit_amount || 5000;

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      customer_id: appUser.id,
      vehicle_id: result.data.vehicle_id,
      pickup_branch_id: result.data.pickup_branch_id,
      dropoff_branch_id: result.data.dropoff_branch_id,
      start_date: result.data.start_date,
      end_date: result.data.end_date,
      notes: result.data.notes || null,
      status: 'pending',
      total_price,
      deposit_amount,
    })
    .select()
    .single();

  if (error) {
    // Check if double-booking exclusion constraint was triggered
    if (error.code === '23P01' || error.message?.includes('prevent_double_booking')) {
      return { error: 'This vehicle is already reserved for the selected dates.' };
    }
    return { error: error.message };
  }

  await writeAuditLog(
    supabase,
    'reservation.created',
    'reservation',
    reservation.id,
    null,
    reservation as unknown as Record<string, unknown>,
    appUser.id,
  );

  // Notify customer
  await sendNotification({
    profile_id: appUser.id,
    type: 'reservation_created',
    title_ar: 'تم إرسال طلب الحجز بنجاح',
    title_fr: 'Demande de réservation envoyée',
    title_en: 'Reservation Request Submitted',
    message_ar: `طلبك لحجز ${vehicle.make} ${vehicle.model} قيد المراجعة من طرف فريق الوكالة.`,
    message_fr: `Votre demande pour ${vehicle.make} ${vehicle.model} est en cours de vérification par notre agence.`,
    message_en: `Your request for ${vehicle.make} ${vehicle.model} is being reviewed by branch staff.`,
    metadata: { reservation_id: reservation.id },
  });

  // Notify branch staff & admin
  await notifyBranchStaffAndAdmins(result.data.pickup_branch_id, {
    type: 'new_booking_request',
    title_ar: 'طلب حجز جديد في انتظار المراجعة',
    title_fr: 'Nouvelle demande de réservation',
    title_en: 'New Reservation Request',
    message_ar: `طلب حجز جديد للمركبة ${vehicle.make} ${vehicle.model} من ${result.data.start_date} إلى ${result.data.end_date}.`,
    message_fr: `Nouvelle demande pour ${vehicle.make} ${vehicle.model} du ${result.data.start_date} au ${result.data.end_date}.`,
    message_en: `New booking request for ${vehicle.make} ${vehicle.model} from ${result.data.start_date} to ${result.data.end_date}.`,
    metadata: { reservation_id: reservation.id },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/reservations');
  revalidatePath('/staff');
  revalidatePath('/admin/reservations');
  return { success: true, reservationId: reservation.id };
}

/**
 * 2. CANCEL RESERVATION (Customer or Staff)
 */
export async function cancelReservation(
  prevStateOrFormData: unknown,
  maybeFormData?: FormData,
) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
        ? prevStateOrFormData
        : new FormData();

  const reservationId = formData.get('id') as string;
  if (!reservationId) return { error: 'Missing reservation ID' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(make, model)')
    .eq('id', reservationId)
    .single();

  if (!existing || (existing.customer_id !== user.id && user.id !== existing.confirmed_by)) {
    // Check if user is staff/admin
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!prof || !['staff', 'branch_manager', 'admin'].includes(prof.role)) {
      return { error: 'Unauthorized' };
    }
  }

  if (existing.status !== 'pending' && existing.status !== 'confirmed') {
    return { error: 'Cannot cancel reservation in its current status' };
  }

  const reason = (formData.get('reason') as string) || 'Customer requested cancellation';

  const { data: updated, error } = await supabase
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_by: user.id,
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason,
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(
    supabase,
    'reservation.cancelled',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    user.id,
  );

  // Notify branch staff if cancelled by customer
  if (existing.customer_id === user.id) {
    await notifyBranchStaffAndAdmins(existing.pickup_branch_id, {
      type: 'reservation_cancelled',
      title_ar: 'تم إلغاء حجز من قبل الزبون',
      title_fr: 'Réservation annulée par le client',
      title_en: 'Reservation Cancelled by Customer',
      message_ar: `قام الزبون بإلغاء الحجز #${reservationId.slice(0, 8)} (${reason}). تم تحرير المركبة.`,
      message_fr: `Le client a annulé la réservation #${reservationId.slice(0, 8)} (${reason}). Véhicule libéré.`,
      message_en: `Customer cancelled reservation #${reservationId.slice(0, 8)} (${reason}). Vehicle released.`,
      metadata: { reservation_id: reservationId },
    });
  } else {
    // Notify customer if cancelled by staff
    await sendNotification({
      profile_id: existing.customer_id,
      type: 'reservation_cancelled',
      title_ar: 'تم إلغاء طلب الحجز',
      title_fr: 'Réservation annulée',
      title_en: 'Reservation Cancelled',
      message_ar: `تم إلغاء حجزك #${reservationId.slice(0, 8)}. السبب: ${reason}`,
      message_fr: `Votre réservation #${reservationId.slice(0, 8)} a été annulée. Motif: ${reason}`,
      message_en: `Your reservation #${reservationId.slice(0, 8)} has been cancelled. Reason: ${reason}`,
      metadata: { reservation_id: reservationId },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/reservations');
  revalidatePath(`/dashboard/reservations/${reservationId}`);
  revalidatePath('/staff');
  revalidatePath('/admin/reservations');
  return { success: true };
}

/**
 * 3. CONFIRM RESERVATION (Staff / Admin)
 */
export async function confirmReservation(
  prevState: unknown,
  formData: FormData,
) {
  const reservationId = formData.get('id') as string;
  const staffNotes = (formData.get('staff_notes') as string) || null;
  if (!reservationId) return { error: 'Missing reservation ID' };

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reservationId)) {
    return { error: 'Invalid reservation ID: must be a valid UUID' };
  }

  const appUser = await getAuthUser();
  if (!appUser || !['staff', 'branch_manager', 'admin'].includes(appUser.role)) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(make, model)')
    .eq('id', reservationId)
    .single();

  if (!existing) return { error: 'Reservation not found' };

  if (appUser.role !== 'admin' && appUser.branch_id) {
    if (existing.pickup_branch_id !== appUser.branch_id) {
      return { error: 'Unauthorized: reservation belongs to another branch' };
    }
  }

  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 48);

  const { data: updated, error } = await supabase
    .from('reservations')
    .update({
      status: 'confirmed',
      deposit_deadline: deadline.toISOString(),
      confirmed_by: appUser.id,
      confirmed_at: new Date().toISOString(),
      staff_notes: staffNotes,
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (error) {
    if (error.code === '23P01' || error.message?.includes('prevent_double_booking')) {
      return { error: 'Cannot confirm: double booking conflict for this vehicle.' };
    }
    return { error: error.message };
  }

  await writeAuditLog(
    supabase,
    'reservation.confirmed',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    appUser.id,
  );

  // Notify customer that reservation is confirmed and deposit is due
  await sendNotification({
    profile_id: existing.customer_id,
    type: 'reservation_confirmed',
    title_ar: 'تم تأكيد حجزك! يرجى دفع العربون',
    title_fr: 'Réservation confirmée ! Acompte requis',
    title_en: 'Reservation Confirmed! Deposit Required',
    message_ar: `تم قبول طلبك للمركبة ${existing.vehicle?.make} ${existing.vehicle?.model}. يرجى دفع مبلغ الضمان (${existing.deposit_amount} دج) خلال 48 ساعة لتثبيت الحجز.`,
    message_fr: `Votre demande pour ${existing.vehicle?.make} ${existing.vehicle?.model} a été validée. Merci de régler l'acompte (${existing.deposit_amount} DZD) sous 48h.`,
    message_en: `Your booking for ${existing.vehicle?.make} ${existing.vehicle?.model} was approved. Please pay the deposit (${existing.deposit_amount} DZD) within 48 hours to secure your car.`,
    metadata: { reservation_id: reservationId },
  });

  revalidatePath('/staff');
  revalidatePath('/staff/reservations');
  revalidatePath(`/staff/reservations/${reservationId}`);
  revalidatePath(`/dashboard/reservations/${reservationId}`);
  revalidatePath('/admin/reservations');
  return { success: true };
}

/**
 * 4. REJECT RESERVATION (Staff / Admin)
 */
export async function rejectReservation(
  prevState: unknown,
  formData: FormData,
) {
  const reservationId = formData.get('id') as string;
  const reason = (formData.get('reason') as string) || 'Rejected by staff';
  if (!reservationId) return { error: 'Missing reservation ID' };

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reservationId)) {
    return { error: 'Invalid reservation ID: must be a valid UUID' };
  }

  const appUser = await getAuthUser();
  if (!appUser || !['staff', 'branch_manager', 'admin'].includes(appUser.role)) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(make, model)')
    .eq('id', reservationId)
    .single();

  if (!existing) return { error: 'Not found' };

  const { data: updated, error } = await supabase
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_by: appUser.id,
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason,
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(
    supabase,
    'reservation.rejected',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    appUser.id,
  );

  // Notify customer
  await sendNotification({
    profile_id: existing.customer_id,
    type: 'reservation_rejected',
    title_ar: 'تم رفض طلب الحجز',
    title_fr: 'Demande de réservation refusée',
    title_en: 'Reservation Request Declined',
    message_ar: `نعتذر، تم رفض طلب حجز ${existing.vehicle?.make} ${existing.vehicle?.model}. السبب: ${reason}`,
    message_fr: `Votre demande pour ${existing.vehicle?.make} ${existing.vehicle?.model} a été déclinée. Motif: ${reason}`,
    message_en: `Your request for ${existing.vehicle?.make} ${existing.vehicle?.model} was declined. Reason: ${reason}`,
    metadata: { reservation_id: reservationId },
  });

  revalidatePath('/staff');
  revalidatePath('/staff/reservations');
  revalidatePath(`/staff/reservations/${reservationId}`);
  revalidatePath(`/dashboard/reservations/${reservationId}`);
  revalidatePath('/admin/reservations');
  return { success: true };
}

/**
 * 5. SUBMIT CUSTOMER DEPOSIT (Customer Flow)
 * When status is 'confirmed', customer provides payment method and reference code/receipt.
 */
export async function submitCustomerDeposit(
  prevState: unknown,
  formData: FormData,
) {
  const reservationId = formData.get('reservation_id') as string;
  const paymentMethod = (formData.get('payment_method') as string) || 'edahabia';
  const paymentReference = (formData.get('payment_reference') as string) || '';

  if (!reservationId) return { error: 'Missing reservation ID' };
  if (!paymentReference.trim()) {
    return { error: 'Please enter a valid payment transaction reference or receipt number' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(make, model)')
    .eq('id', reservationId)
    .single();

  if (!existing || existing.customer_id !== user.id) {
    return { error: 'Reservation not found or unauthorized' };
  }

  if (existing.status !== 'confirmed') {
    return { error: `Reservation is currently in status '${existing.status}', deposit cannot be submitted` };
  }

  // Update reservation status to deposit_paid
  const { data: updated, error: resError } = await supabase
    .from('reservations')
    .update({
      status: 'deposit_paid',
      deposit_paid_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (resError) return { error: resError.message };

  // Insert payment record
  await supabase.from('payments').insert({
    reservation_id: reservationId,
    amount: existing.deposit_amount,
    type: 'deposit',
    method: paymentMethod,
    status: 'completed',
    reference: paymentReference.trim(),
    recorded_by: user.id,
  });

  await writeAuditLog(
    supabase,
    'reservation.deposit_submitted',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    user.id,
  );

  // Notify customer
  await sendNotification({
    profile_id: user.id,
    type: 'deposit_paid',
    title_ar: 'تم تسجيل دفع العربون بنجاح!',
    title_fr: 'Acompte enregistré avec succès !',
    title_en: 'Deposit Payment Recorded!',
    message_ar: `تم تسجيل دفع العربون للمركبة ${existing.vehicle?.make} ${existing.vehicle?.model}. حجزك مؤكد بالكامل!`,
    message_fr: `Le règlement de l'acompte pour ${existing.vehicle?.make} ${existing.vehicle?.model} a été enregistré. Réservation garantie !`,
    message_en: `Deposit for ${existing.vehicle?.make} ${existing.vehicle?.model} recorded. Your car is secured for pickup!`,
    metadata: { reservation_id: reservationId },
  });

  // Notify branch staff
  await notifyBranchStaffAndAdmins(existing.pickup_branch_id, {
    type: 'deposit_received',
    title_ar: 'تم دفع العربون لحجز مؤكد',
    title_fr: 'Acompte reçu pour réservation',
    title_en: 'Deposit Received',
    message_ar: `قام الزبون بدفع العربون للحجز #${reservationId.slice(0, 8)} (${paymentMethod.toUpperCase()} - مرجع: ${paymentReference.trim()}).`,
    message_fr: `Acompte reçu pour la réservation #${reservationId.slice(0, 8)} (${paymentMethod.toUpperCase()} - Réf: ${paymentReference.trim()}).`,
    message_en: `Deposit received for reservation #${reservationId.slice(0, 8)} (${paymentMethod.toUpperCase()} - Ref: ${paymentReference.trim()}).`,
    metadata: { reservation_id: reservationId },
  });

  revalidatePath(`/dashboard/reservations/${reservationId}`);
  revalidatePath('/dashboard/reservations');
  revalidatePath('/staff');
  revalidatePath('/admin/reservations');
  return { success: true };
}

/**
 * 6. MARK DEPOSIT PAID (Staff / Admin Direct Action)
 */
export async function markDepositPaid(
  prevState: unknown,
  formData: FormData,
) {
  const reservationId = formData.get('id') as string;
  const paymentMethod = (formData.get('payment_method') as string) || 'cash';
  const paymentReference = (formData.get('payment_reference') as string) || 'Agency Cash Desk';

  if (!reservationId) return { error: 'Missing reservation ID' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['staff', 'branch_manager', 'admin'].includes(profile.role)) {
    return { error: 'Unauthorized' };
  }

  const { data: existing } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(make, model)')
    .eq('id', reservationId)
    .single();

  if (!existing) return { error: 'Reservation not found' };

  const { data: updated, error: resError } = await supabase
    .from('reservations')
    .update({
      status: 'deposit_paid',
      deposit_paid_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (resError) return { error: resError.message };

  await supabase.from('payments').insert({
    reservation_id: reservationId,
    amount: existing.deposit_amount,
    type: 'deposit',
    method: paymentMethod,
    status: 'completed',
    reference: paymentReference,
    recorded_by: user.id,
  });

  await writeAuditLog(
    supabase,
    'reservation.deposit_paid',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    user.id,
  );

  // Notify customer
  await sendNotification({
    profile_id: existing.customer_id,
    type: 'deposit_verified',
    title_ar: 'تم تأكيد استلام العربون بالوكالة',
    title_fr: 'Acompte validé par l’agence',
    title_en: 'Deposit Verified by Agency',
    message_ar: `تم التحقق من استلام العربون للمركبة ${existing.vehicle?.make} ${existing.vehicle?.model}. حجزك مؤكد بالكامل!`,
    message_fr: `La réception de votre acompte pour ${existing.vehicle?.make} ${existing.vehicle?.model} a été validée. Véhicule garanti !`,
    message_en: `Your deposit for ${existing.vehicle?.make} ${existing.vehicle?.model} was confirmed by branch staff.`,
    metadata: { reservation_id: reservationId },
  });

  revalidatePath('/staff');
  revalidatePath(`/staff/reservations/${reservationId}`);
  revalidatePath(`/dashboard/reservations/${reservationId}`);
  revalidatePath('/admin/reservations');
  return { success: true };
}

/**
 * 7. START RENTAL / HANDOVER INSPECTION PV (Staff / Admin)
 */
export async function startRental(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const reservationId = data.reservation_id as string;
  if (!reservationId) return { error: 'Missing reservation ID' };

  const result = conditionReportSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid handover report fields' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['staff', 'branch_manager', 'admin'].includes(profile.role)) {
    return { error: 'Unauthorized' };
  }

  const { data: existing } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*)')
    .eq('id', reservationId)
    .single();

  if (!existing) return { error: 'Reservation not found' };
  if (!['confirmed', 'deposit_paid'].includes(existing.status)) {
    return { error: `Cannot start rental from status: ${existing.status}` };
  }

  // 1. Insert vehicle condition report for pickup
  const { error: reportError } = await supabase
    .from('vehicle_condition_reports')
    .insert({
      reservation_id: reservationId,
      stage: 'pickup',
      odometer_reading: result.data.odometer_reading,
      fuel_level: result.data.fuel_level,
      notes: result.data.notes || null,
      damage_noted: result.data.damage_noted,
      staff_id: user.id,
    });

  if (reportError) return { error: reportError.message };

  // 2. Update reservation status to 'active'
  const { data: updated, error: resError } = await supabase
    .from('reservations')
    .update({
      status: 'active',
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (resError) return { error: resError.message };

  // 3. Update vehicle status to 'rented'
  if (existing.vehicle_id) {
    await supabase
      .from('vehicles')
      .update({ status: 'rented' })
      .eq('id', existing.vehicle_id);
  }

  await writeAuditLog(
    supabase,
    'reservation.activated',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    user.id,
  );

  // Notify customer
  await sendNotification({
    profile_id: existing.customer_id,
    type: 'rental_activated',
    title_ar: 'تم تسليم المركبة وتفعيل الكراء',
    title_fr: 'Véhicule remis - Location active',
    title_en: 'Vehicle Handed Over - Rental Active',
    message_ar: `تم توثيق محضر تسليم ${existing.vehicle?.make} ${existing.vehicle?.model} بنجاح. نتمنى لكم رحلة آمنة ومريحة!`,
    message_fr: `PV de mise à disposition pour ${existing.vehicle?.make} ${existing.vehicle?.model} validé. Bonne route !`,
    message_en: `Handover inspection PV for ${existing.vehicle?.make} ${existing.vehicle?.model} completed. Have a safe journey!`,
    metadata: { reservation_id: reservationId },
  });

  revalidatePath('/staff');
  revalidatePath('/staff/reservations');
  revalidatePath(`/staff/reservations/${reservationId}`);
  revalidatePath(`/dashboard/reservations/${reservationId}`);
  revalidatePath('/admin/reservations');
  revalidatePath('/vehicles');
  return { success: true };
}

/**
 * 8. COMPLETE RENTAL / RETURN INSPECTION PV (Staff / Admin)
 */
export async function completeRental(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const reservationId = data.reservation_id as string;
  if (!reservationId) return { error: 'Missing reservation ID' };

  const result = conditionReportSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid return report fields' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['staff', 'branch_manager', 'admin'].includes(profile.role)) {
    return { error: 'Unauthorized' };
  }

  const { data: existing } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*)')
    .eq('id', reservationId)
    .single();

  if (!existing) return { error: 'Reservation not found' };
  if (existing.status !== 'active') {
    return { error: `Cannot complete rental from status: ${existing.status}` };
  }

  // 1. Insert vehicle condition report for return
  const { error: reportError } = await supabase
    .from('vehicle_condition_reports')
    .insert({
      reservation_id: reservationId,
      stage: 'return',
      odometer_reading: result.data.odometer_reading,
      fuel_level: result.data.fuel_level,
      notes: result.data.notes || null,
      damage_noted: result.data.damage_noted,
      staff_id: user.id,
    });

  if (reportError) return { error: reportError.message };

  // 2. Update reservation status to 'completed'
  const { data: updated, error: resError } = await supabase
    .from('reservations')
    .update({
      status: 'completed',
    })
    .eq('id', reservationId)
    .select()
    .single();

  if (resError) return { error: resError.message };

  // 3. Update vehicle status to 'available'
  if (existing.vehicle_id) {
    await supabase
      .from('vehicles')
      .update({ status: 'available' })
      .eq('id', existing.vehicle_id);
  }

  await writeAuditLog(
    supabase,
    'reservation.completed',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    user.id,
  );

  // Notify customer
  await sendNotification({
    profile_id: existing.customer_id,
    type: 'rental_completed',
    title_ar: 'تم إرجاع المركبة وإكمال الكراء بنجاح',
    title_fr: 'Restitution validée - Location clôturée',
    title_en: 'Rental Completed Successfully',
    message_ar: `تم فحص وإرجاع المركبة ${existing.vehicle?.make} ${existing.vehicle?.model} وتحرير ضمان العربون. شكراً لاختياركم DZRent!`,
    message_fr: `Contrôle de retour validé pour ${existing.vehicle?.make} ${existing.vehicle?.model}. Caution débloquée. Merci d'avoir choisi DZRent !`,
    message_en: `Vehicle ${existing.vehicle?.make} ${existing.vehicle?.model} returned and deposit hold released. Thank you for choosing DZRent!`,
    metadata: { reservation_id: reservationId },
  });

  revalidatePath('/staff');
  revalidatePath('/staff/reservations');
  revalidatePath(`/staff/reservations/${reservationId}`);
  revalidatePath(`/dashboard/reservations/${reservationId}`);
  revalidatePath('/admin/reservations');
  revalidatePath('/vehicles');
  return { success: true };
}

/**
 * 9. CREATE WALK-IN RESERVATION (Staff / Admin)
 * Staff creates reservation on behalf of customer (walk-in at branch)
 * Can optionally auto-confirm and mark deposit as paid in one step
 */
export async function createWalkInReservation(
  prevState: unknown,
  formData: FormData,
) {
  const data = Object.fromEntries(formData.entries());
  
  const customerId = data.customer_id as string;
  const vehicleId = data.vehicle_id as string;
  const startDate = data.start_date as string;
  const endDate = data.end_date as string;
  const pickupBranchId = data.pickup_branch_id as string;
  const dropoffBranchId = data.dropoff_branch_id as string;
  const notes = (data.notes as string) || null;
  const staffNotes = (data.staff_notes as string) || null;
  const autoConfirm = data.auto_confirm === 'true';
  const depositPaidCash = data.deposit_paid_cash === 'true';
  const paymentMethod = (data.payment_method as string) || 'cash';

  if (!customerId || !vehicleId || !startDate || !endDate || !pickupBranchId || !dropoffBranchId) {
    return { error: 'Missing required fields' };
  }

  const appUser = await getAuthUser();
  if (!appUser || !['staff', 'branch_manager', 'admin'].includes(appUser.role)) {
    return { error: 'Unauthorized: only staff can create walk-in reservations' };
  }

  const supabase = await createClient();

  // 1. Get vehicle details for pricing
  const { data: vehicle, error: vErr } = await supabase
    .from('vehicles')
    .select('daily_rate, deposit_amount, make, model, branch_id')
    .eq('id', vehicleId)
    .single();

  if (vErr || !vehicle) return { error: 'Vehicle not found' };

  // 2. Check branch authorization
  if (appUser.role !== 'admin' && appUser.branch_id) {
    if (vehicle.branch_id !== appUser.branch_id) {
      return { error: 'Unauthorized: vehicle belongs to another branch' };
    }
  }

  // 3. Calculate pricing
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const days = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const total_price = (vehicle.daily_rate || 0) * days;
  const deposit_amount = vehicle.deposit_amount || 5000;

  // 4. Create reservation
  const initialStatus = autoConfirm ? 'confirmed' : 'pending';
  
  const reservationData: Record<string, unknown> = {
    customer_id: customerId,
    vehicle_id: vehicleId,
    pickup_branch_id: pickupBranchId,
    dropoff_branch_id: dropoffBranchId,
    start_date: startDate,
    end_date: endDate,
    notes,
    staff_notes: staffNotes,
    status: initialStatus,
    total_price,
    deposit_amount,
  };

  if (autoConfirm) {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);
    reservationData.deposit_deadline = deadline.toISOString();
    reservationData.confirmed_by = appUser.id;
    reservationData.confirmed_at = new Date().toISOString();
  }

  if (depositPaidCash && autoConfirm) {
    reservationData.status = 'deposit_paid';
    reservationData.deposit_paid_at = new Date().toISOString();
  }

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert(reservationData)
    .select()
    .single();

  if (error) {
    if (error.code === '23P01' || error.message?.includes('prevent_double_booking')) {
      return { error: 'This vehicle is already reserved for the selected dates.' };
    }
    return { error: error.message };
  }

  // 5. Record cash payment if collected immediately
  if (depositPaidCash && autoConfirm) {
    await supabase.from('payments').insert({
      reservation_id: reservation.id,
      amount: deposit_amount,
      type: 'deposit',
      method: paymentMethod,
      status: 'completed',
      reference: 'Walk-in cash payment at branch',
      recorded_by: appUser.id,
    });
  }

  await writeAuditLog(
    supabase,
    'reservation.walk_in_created',
    'reservation',
    reservation.id,
    null,
    reservation as unknown as Record<string, unknown>,
    appUser.id,
  );

  // 6. Notify customer
  if (autoConfirm && depositPaidCash) {
    await sendNotification({
      profile_id: customerId,
      type: 'reservation_confirmed',
      title_ar: 'تم تأكيد حجزك في الوكالة',
      title_fr: 'Réservation confirmée en agence',
      title_en: 'Reservation Confirmed at Branch',
      message_ar: `تم تأكيد حجزك للمركبة ${vehicle.make} ${vehicle.model} من ${startDate} إلى ${endDate}. مرحباً بكم في DZRent!`,
      message_fr: `Votre réservation pour ${vehicle.make} ${vehicle.model} du ${startDate} au ${endDate} est confirmée. Bienvenue chez DZRent !`,
      message_en: `Your booking for ${vehicle.make} ${vehicle.model} from ${startDate} to ${endDate} is confirmed. Welcome to DZRent!`,
      metadata: { reservation_id: reservation.id },
    });
  } else if (autoConfirm) {
    await sendNotification({
      profile_id: customerId,
      type: 'reservation_confirmed',
      title_ar: 'تم تأكيد حجزك! يرجى دفع العربون',
      title_fr: 'Réservation confirmée ! Acompte requis',
      title_en: 'Reservation Confirmed! Deposit Required',
      message_ar: `تم تأكيد حجزك للمركبة ${vehicle.make} ${vehicle.model}. يرجى دفع مبلغ الضمان (${deposit_amount} دج) خلال 48 ساعة.`,
      message_fr: `Réservation confirmée pour ${vehicle.make} ${vehicle.model}. Merci de régler l'acompte (${deposit_amount} DZD) sous 48h.`,
      message_en: `Booking confirmed for ${vehicle.make} ${vehicle.model}. Please pay deposit (${deposit_amount} DZD) within 48 hours.`,
      metadata: { reservation_id: reservation.id },
    });
  } else {
    await sendNotification({
      profile_id: customerId,
      type: 'reservation_created',
      title_ar: 'تم إنشاء حجز جديد لك',
      title_fr: 'Nouvelle réservation créée',
      title_en: 'New Reservation Created',
      message_ar: `تم إنشاء حجز للمركبة ${vehicle.make} ${vehicle.model} من ${startDate} إلى ${endDate}.`,
      message_fr: `Réservation créée pour ${vehicle.make} ${vehicle.model} du ${startDate} au ${endDate}.`,
      message_en: `Reservation created for ${vehicle.make} ${vehicle.model} from ${startDate} to ${endDate}.`,
      metadata: { reservation_id: reservation.id },
    });
  }

  revalidatePath('/staff');
  revalidatePath('/staff/reservations');
  revalidatePath('/admin/reservations');
  revalidatePath('/dashboard/reservations');
  return { success: true, reservationId: reservation.id };
}
