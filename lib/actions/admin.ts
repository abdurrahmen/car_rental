'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getAuthUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

function getIsolatedAuthClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Superadmin: Create staff account anywhere
 */
export async function createStaffAccount(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = (formData.get('full_name') as string) || null
  const phone = (formData.get('phone') as string) || null
  const role = (formData.get('role') as string) || 'staff'
  const branch_id = (formData.get('branch_id') as string) || null

  const currentUser = await getAuthUser()
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Forbidden: Superadmin access required' }
  }

  let createdUserId: string | null = null

  // 1. If service role key is present, use admin auth API (does not touch cookies)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminClient = createAdminClient()
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
          branch_id,
          phone,
        },
      })
      if (error) return { error: error.message }
      createdUserId = data.user?.id || null
    } catch (e: unknown) {
      console.warn('Admin client creation error:', e)
    }
  }

  // 2. If admin API was not used or failed, use isolated client (no cookie persistence)
  if (!createdUserId) {
    const isolatedAuth = getIsolatedAuthClient()
    const { data, error } = await isolatedAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          branch_id,
          phone,
        },
      },
    })
    if (error) return { error: error.message }
    createdUserId = data.user?.id || null
  }

  if (!createdUserId) {
    return { error: 'Failed to create user account' }
  }

  // 3. Ensure profile has the assigned role and branch
  const supabase = await createClient()

  // Try RPC first (SECURITY DEFINER, bypasses RLS)
  const { error: rpcError } = await supabase.rpc('admin_set_user_role', {
    p_user_id: createdUserId,
    p_role: role,
    p_branch_id: branch_id || null,
    p_full_name: fullName,
    p_phone: phone,
  })

  if (rpcError) {
    // If service role key exists, use admin client to update profile directly
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminClient = createAdminClient()
        await adminClient
          .from('profiles')
          .update({
            role,
            branch_id,
            full_name: fullName,
            phone,
          })
          .eq('id', createdUserId)
      } catch (adminErr) {
        console.warn('Admin client profile update error:', adminErr)
      }
    } else {
      // Direct update fallback
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role,
          branch_id,
          full_name: fullName,
          phone,
        })
        .eq('id', createdUserId)

      if (profileError) {
        console.warn('Profile update error on staff create:', profileError.message)
      }
    }
  }

  revalidatePath('/admin/staff')
  return { success: true }
}

/**
 * Branch Manager: Create staff account for their own branch
 */
export async function createBranchStaffAccount(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = (formData.get('full_name') as string) || null
  const phone = (formData.get('phone') as string) || null
  const role = (formData.get('role') as string) || 'staff'

  const currentUser = await getAuthUser()
  if (!currentUser || !['branch_manager', 'admin'].includes(currentUser.role)) {
    return { error: 'Forbidden: Branch Manager access required' }
  }

  if (role === 'admin') {
    return { error: 'Branch Manager cannot assign Superadmin role' }
  }

  const branch_id = currentUser.role === 'admin' 
    ? (formData.get('branch_id') as string) || null
    : currentUser.branch_id

  if (!branch_id) {
    return { error: 'No branch assigned to your account' }
  }

  let createdUserId: string | null = null

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminClient = createAdminClient()
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
          branch_id,
          phone,
        },
      })
      if (error) return { error: error.message }
      createdUserId = data.user?.id || null
    } catch (e: unknown) {
      console.warn('Admin client creation error:', e)
    }
  }

  if (!createdUserId) {
    const isolatedAuth = getIsolatedAuthClient()
    const { data, error } = await isolatedAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          branch_id,
          phone,
        },
      },
    })
    if (error) return { error: error.message }
    createdUserId = data.user?.id || null
  }

  if (!createdUserId) {
    return { error: 'Failed to create user account' }
  }

  const supabase = await createClient()

  // Try RPC first (SECURITY DEFINER)
  const { error: rpcError } = await supabase.rpc('admin_set_user_role', {
    p_user_id: createdUserId,
    p_role: role,
    p_branch_id: branch_id,
    p_full_name: fullName,
    p_phone: phone,
  })

  if (rpcError) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminClient = createAdminClient()
        await adminClient
          .from('profiles')
          .update({
            role,
            branch_id,
            full_name: fullName,
            phone,
          })
          .eq('id', createdUserId)
      } catch (adminErr) {
        console.warn('Admin client profile update error:', adminErr)
      }
    } else {
      await supabase
        .from('profiles')
        .update({
          role,
          branch_id,
          full_name: fullName,
          phone,
        })
        .eq('id', createdUserId)
    }
  }

  revalidatePath('/staff/staff')
  revalidatePath('/admin/staff')
  return { success: true }
}

/**
 * Superadmin & Branch Manager: Edit role and data of a staff member
 * - Superadmin can edit any staff member (full_name, phone, role, branch_id).
 * - Branch Manager can only edit staff belonging to their own branch.
 */
export async function updateStaffMember(prevState: unknown, formData: FormData) {
  const id = formData.get('id') as string
  const fullName = (formData.get('full_name') as string) || null
  const phone = (formData.get('phone') as string) || null
  const role = formData.get('role') as string
  const requestedBranchId = formData.get('branch_id') as string

  if (!id) return { error: 'Missing staff member ID' }

  const currentUser = await getAuthUser()
  if (!currentUser || !['admin', 'branch_manager'].includes(currentUser.role)) {
    return { error: 'Forbidden: Admin or Branch Manager access required' }
  }

  const supabase = await createClient()

  // Fetch the target profile to check permissions
  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('id, role, branch_id')
    .eq('id', id)
    .single()

  if (targetError || !targetProfile) {
    return { error: 'Staff member profile not found' }
  }

  // Branch Manager scoping rules
  if (currentUser.role === 'branch_manager') {
    // Cannot edit an admin
    if (targetProfile.role === 'admin') {
      return { error: 'Unauthorized to modify Superadmin account' }
    }

    // Must belong to the same branch
    if (targetProfile.branch_id !== currentUser.branch_id) {
      return { error: 'Unauthorized: staff member belongs to a different branch' }
    }

    // Cannot promote to admin
    if (role === 'admin') {
      return { error: 'Branch Manager cannot assign the Superadmin role' }
    }
  }

  // Determine final branch_id
  const finalBranchId = currentUser.role === 'admin'
    ? (requestedBranchId || null)
    : currentUser.branch_id

  const updatePayload: Record<string, unknown> = {
    full_name: fullName,
    phone,
    role,
    branch_id: finalBranchId,
  }

  // Try RPC first for role update (SECURITY DEFINER)
  const { error: rpcError } = await supabase.rpc('admin_set_user_role', {
    p_user_id: id,
    p_role: role,
    p_branch_id: finalBranchId || null,
    p_full_name: fullName,
    p_phone: phone,
  })

  if (rpcError) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminClient = createAdminClient()
        await adminClient.from('profiles').update(updatePayload).eq('id', id)
      } catch (e) {
        console.warn('Admin client error:', e)
      }
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) {
        return { error: updateError.message }
      }
    }
  }

  // Write audit log safely
  try {
    await supabase.from('audit_log').insert({
      action: 'staff.updated',
      entity_type: 'profile',
      entity_id: id,
      old_values: targetProfile,
      new_values: updatePayload,
      actor_id: currentUser.id,
    })
  } catch (auditErr) {
    console.warn('[AuditLog] Failed to insert staff update audit:', auditErr)
  }

  revalidatePath('/admin/staff')
  revalidatePath('/staff/staff')
  return { success: true }
}

/**
 * Backwards compatibility helper
 */
export async function updateStaffRole(prevState: unknown, formData: FormData) {
  return updateStaffMember(prevState, formData)
}
