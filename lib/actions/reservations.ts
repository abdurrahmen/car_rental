'use server';

import { createClient } from '@/lib/supabase/server';
import { reservationRequestSchema } from '@/lib/validations/reservation';
import { revalidatePath } from 'next/cache';
import { getAuthUser } from '@/lib/auth';

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  entity_type: string,
  entity_id: string,
  old_values: Record<string, unknown> | null,
  new_values: Record<string, unknown> | null,
  actor_id: string,
) {
  const oldStatus = old_values?.status ?? 'none';
  const newStatus = new_values?.status ?? 'unknown';
  console.log(
    `[STATE MACHINE] transition: ${oldStatus} -> ${newStatus} (reservation_id: ${entity_id}, actor: ${actor_id}, action: ${action})`,
  );

  await supabase.from('audit_log').insert({
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    actor_id,
  });
}

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
    .select('daily_rate, deposit_amount')
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

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/reservations');
  return { success: true, reservationId: reservation.id };
}

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
    .select('*')
    .eq('id', reservationId)
    .single();

  if (!existing || existing.customer_id !== user.id) return { error: 'Not found' };
  if (existing.status !== 'pending' && existing.status !== 'confirmed') {
    return { error: 'Cannot cancel reservation in its current status' };
  }

  const { data: updated, error } = await supabase
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_by: user.id,
      cancelled_at: new Date().toISOString(),
      cancelled_reason: (formData.get('reason') as string) || 'Customer requested cancellation',
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

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/reservations');
  revalidatePath(`/dashboard/reservations/${reservationId}`);
  return { success: true };
}

export async function confirmReservation(
  prevState: unknown,
  formData: FormData,
) {
  const reservationId = formData.get('id') as string;
  const staffNotes = (formData.get('staff_notes') as string) || null;
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
    .select('*')
    .eq('id', reservationId)
    .single();

  if (!existing) return { error: 'Not found' };

  if (profile.role !== 'admin' && profile.branch_id) {
    if (existing.pickup_branch_id !== profile.branch_id) {
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
      confirmed_by: user.id,
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
    user.id,
  );

  revalidatePath('/staff');
  revalidatePath('/staff/reservations');
  revalidatePath(`/staff/reservations/${reservationId}`);
  revalidatePath('/admin/reservations');
  return { success: true };
}

export async function rejectReservation(
  prevState: unknown,
  formData: FormData,
) {
  const reservationId = formData.get('id') as string;
  const reason = (formData.get('reason') as string) || 'Rejected by staff';
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
    .select('*')
    .eq('id', reservationId)
    .single();

  if (!existing) return { error: 'Not found' };

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
    'reservation.rejected',
    'reservation',
    reservationId,
    existing as unknown as Record<string, unknown>,
    updated as unknown as Record<string, unknown>,
    user.id,
  );

  revalidatePath('/staff');
  revalidatePath('/staff/reservations');
  revalidatePath(`/staff/reservations/${reservationId}`);
  revalidatePath('/admin/reservations');
  return { success: true };
}
