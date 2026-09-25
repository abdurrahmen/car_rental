'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { assertRole } from '@/lib/auth'

export async function createStaffAccount(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const branch_id = formData.get('branch_id') as string

  try { await assertRole(['admin']) } catch { return { error: 'Forbidden: admin access required' } }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  if (data.user) {
    await supabase.from('profiles').update({ role, branch_id }).eq('id', data.user.id)
  }

  revalidatePath('/admin/staff')
  return { success: true }
}

export async function updateStaffRole(prevState: unknown, formData: FormData) {
  const id = formData.get('id') as string
  const role = formData.get('role') as string
  const branch_id = formData.get('branch_id') as string

  try { await assertRole(['admin']) } catch { return { error: 'Forbidden: admin access required' } }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role, branch_id }).eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/admin/staff')
  return { success: true }
}
