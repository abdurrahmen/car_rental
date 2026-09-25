'use server';

import { createClient } from '@/lib/supabase/server';
import { branchSchema } from '@/lib/validations/branch';
import { revalidatePath } from 'next/cache';
import { assertRole } from '@/lib/auth';

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

export async function createBranch(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const result = branchSchema.safeParse(data);
  if (!result.success) return { error: 'Invalid fields' };

  let appUser;
  try { appUser = await assertRole(['admin']); } catch { return { error: 'Forbidden: admin access required' }; }
  const supabase = await createClient();

  const { data: branch, error } = await supabase
    .from('branches')
    .insert(result.data)
    .select()
    .single();
  if (error) return { error: error.message };

  await writeAuditLog(
    supabase,
    'create',
    'branch',
    branch.id,
    null,
    branch as unknown as Record<string, unknown>,
    appUser.id,
  );
  revalidatePath('/admin/branches');
  return { success: true };
}

export async function updateBranch(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const id = formData.get('id') as string;
  const result = branchSchema.safeParse(data);
  if (!result.success) return { error: 'Invalid fields' };

  let appUser;
  try { appUser = await assertRole(['admin']); } catch { return { error: 'Forbidden: admin access required' }; }
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
    .single();

  const { data: branch, error } = await supabase
    .from('branches')
    .update(result.data)
    .eq('id', id)
    .select()
    .single();
  if (error) return { error: error.message };

  await writeAuditLog(
    supabase,
    'update',
    'branch',
    branch.id,
    existing as unknown as Record<string, unknown>,
    branch as unknown as Record<string, unknown>,
    appUser.id,
  );
  revalidatePath('/admin/branches');
  return { success: true };
}
