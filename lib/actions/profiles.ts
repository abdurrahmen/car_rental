'use server';

import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/validations/profile';
import { revalidatePath } from 'next/cache';

export async function updateProfile(prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const result = profileUpdateSchema.safeParse(data);
  if (!result.success) return { error: 'Invalid fields' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('profiles')
    .update(result.data)
    .eq('id', user.id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/profile');
  return { success: true };
}

export async function uploadLicense(prevState: unknown, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { error: 'No file' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/license_${Date.now()}.${ext}`;

  // Upload to private 'documents' bucket
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file);
  if (uploadError) return { error: uploadError.message };

  // Store storage path (private, not public URL)
  await supabase
    .from('profiles')
    .update({ license_document_url: path })
    .eq('id', user.id);

  await supabase.from('documents').insert({
    profile_id: user.id,
    type: 'license',
    storage_path: path,
  });

  revalidatePath('/dashboard/profile');
  return { success: true };
}
