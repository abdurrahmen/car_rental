'use server';

import { createClient } from '@/lib/supabase/server';
import { vehicleSchema, vehicleStatusSchema } from '@/lib/validations/vehicle';
import { revalidatePath } from 'next/cache';

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  entity_type: string,
  entity_id: string,
  old_values: Record<string, unknown> | null,
  new_values: Record<string, unknown> | null,
  actor_id: string,
) {
  await supabase.from('audit_log').insert({
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    actor_id,
  });
}

export async function createVehicle(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const result = vehicleSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid fields' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['staff', 'branch_manager', 'admin'].includes(profile.role)) {
    return { error: 'Unauthorized' };
  }

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert(result.data)
    .select()
    .single();
  if (error) return { error: error.message };

  await writeAuditLog(
    supabase,
    'vehicle.created',
    'vehicle',
    vehicle.id,
    null,
    vehicle as unknown as Record<string, unknown>,
    user.id,
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

  const result = vehicleSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid fields' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

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

  await writeAuditLog(
    supabase,
    'vehicle.updated',
    'vehicle',
    vehicle.id,
    existing as unknown as Record<string, unknown>,
    vehicle as unknown as Record<string, unknown>,
    user.id,
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

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
    user.id,
  );

  revalidatePath('/vehicles');
  revalidatePath('/staff/vehicles');
  return { success: true };
}
