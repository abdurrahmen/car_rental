'use server';

import { createClient } from '@/lib/supabase/server';
import { vehicleSchema, vehicleStatusSchema } from '@/lib/validations/vehicle';
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
  try {
    await supabase.from('audit_log').insert({
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      actor_id,
    });
  } catch (err) {
    console.warn('[AuditLog] Failed to insert audit log entry:', err);
  }
}

export async function createVehicle(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  delete data.id; // Ensure client-side id is never validated or passed to insert

  const result = vehicleSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid fields' };
  }

  const appUser = await getAuthUser();
  if (!appUser || !['staff', 'branch_manager', 'admin'].includes(appUser.role)) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert(result.data)
    .select()
    .single();
  if (error) return { error: error.message };

  const photoUrl = formData.get('photo_url') as string;
  if (photoUrl && photoUrl.trim()) {
    try {
      await supabase.from('vehicle_photos').insert({
        vehicle_id: vehicle.id,
        storage_path: photoUrl.trim(),
        is_primary: true,
        sort_order: 0,
      });
    } catch (e) {
      console.warn('[VehiclePhoto] Failed to insert photo:', e);
    }
  }

  await writeAuditLog(
    supabase,
    'vehicle.created',
    'vehicle',
    vehicle.id,
    null,
    vehicle as unknown as Record<string, unknown>,
    appUser.id,
  );

  revalidatePath('/vehicles');
  revalidatePath('/staff/vehicles');
  revalidatePath('/admin/vehicles');
  return { success: true, vehicleId: vehicle.id };
}

export async function updateVehicle(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing vehicle ID' };
  delete data.id; // Do not validate or overwrite PK in payload

  const result = vehicleSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid fields' };
  }

  const appUser = await getAuthUser();
  if (!appUser || !['staff', 'branch_manager', 'admin'].includes(appUser.role)) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();
  if (!existing) return { error: 'Vehicle not found' };

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .update(result.data)
    .eq('id', id)
    .select()
    .single();
  if (error) return { error: error.message };

  const photoUrl = formData.get('photo_url') as string;
  if (photoUrl && photoUrl.trim()) {
    try {
      const { data: existingPhoto } = await supabase
        .from('vehicle_photos')
        .select('id')
        .eq('vehicle_id', id)
        .eq('is_primary', true)
        .single();

      if (existingPhoto) {
        await supabase
          .from('vehicle_photos')
          .update({ storage_path: photoUrl.trim() })
          .eq('id', existingPhoto.id);
      } else {
        await supabase.from('vehicle_photos').insert({
          vehicle_id: id,
          storage_path: photoUrl.trim(),
          is_primary: true,
          sort_order: 0,
        });
      }
    } catch (e) {
      console.warn('[VehiclePhoto] Failed to update photo:', e);
    }
  }

  await writeAuditLog(
    supabase,
    'vehicle.updated',
    'vehicle',
    vehicle.id,
    existing as unknown as Record<string, unknown>,
    vehicle as unknown as Record<string, unknown>,
    appUser.id,
  );

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
  revalidatePath('/staff/vehicles');
  revalidatePath(`/staff/vehicles/${id}`);
  return { success: true };
}

export async function updateVehicleStatus(
  prevState: unknown,
  formData: FormData,
) {
  const data = Object.fromEntries(formData.entries());
  const result = vehicleStatusSchema.safeParse(data);
  const id = (formData.get('id') as string) || result.data?.id;

  if (!id) return { error: 'Missing vehicle ID' };
  if (!result.success) return { error: 'Invalid status' };

  const appUser = await getAuthUser();
  if (!appUser || !['staff', 'branch_manager', 'admin'].includes(appUser.role)) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();
  if (!existing) return { error: 'Vehicle not found' };

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .update({ status: result.data.status })
    .eq('id', id)
    .select()
    .single();
  if (error) return { error: error.message };

  await writeAuditLog(
    supabase,
    'vehicle.status_changed',
    'vehicle',
    vehicle.id,
    existing as unknown as Record<string, unknown>,
    vehicle as unknown as Record<string, unknown>,
    appUser.id,
  );

  revalidatePath('/vehicles');
  revalidatePath('/admin/vehicles');
  revalidatePath('/staff/vehicles');
  return { success: true };
}

export async function deleteVehicle(vehicleId: string) {
  if (!vehicleId) return { error: 'Missing vehicle ID' };

  const appUser = await getAuthUser();
  if (!appUser || !['staff', 'branch_manager', 'admin'].includes(appUser.role)) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .single();

  if (!vehicle) return { error: 'Vehicle not found' };

  // 1. Guard against removing vehicles with active or confirmed bookings
  const { count: activeReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('vehicle_id', vehicleId)
    .in('status', ['pending', 'confirmed', 'deposit_paid', 'active']);

  if (activeReservations && activeReservations > 0) {
    return {
      error:
        'Cannot remove vehicle with active, confirmed, or pending reservations. Complete or cancel those bookings first.',
    };
  }

  // 2. If the vehicle has completed or past reservations, soft-retire it to preserve financial and audit records
  const { count: pastReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('vehicle_id', vehicleId);

  if (pastReservations && pastReservations > 0) {
    const { error: retireError } = await supabase
      .from('vehicles')
      .update({ status: 'retired' })
      .eq('id', vehicleId);

    if (retireError) return { error: retireError.message };

    await writeAuditLog(
      supabase,
      'vehicle.retired',
      'vehicle',
      vehicleId,
      vehicle as unknown as Record<string, unknown>,
      { ...vehicle, status: 'retired' },
      appUser.id,
    );

    revalidatePath('/vehicles');
    revalidatePath('/admin/vehicles');
    revalidatePath('/staff/vehicles');
    return {
      success: true,
      retired: true,
      message: 'Vehicle has past rental history and was safely retired from the fleet.',
    };
  }

  // 3. If no bookings exist at all, perform a clean hard delete
  const { error: deleteError } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId);

  if (deleteError) return { error: deleteError.message };

  await writeAuditLog(
    supabase,
    'vehicle.deleted',
    'vehicle',
    vehicleId,
    vehicle as unknown as Record<string, unknown>,
    null,
    appUser.id,
  );

  revalidatePath('/vehicles');
  revalidatePath('/admin/vehicles');
  revalidatePath('/staff/vehicles');
  return { success: true, retired: false, message: 'Vehicle permanently removed from fleet.' };
}

