import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { Role } from '@/types';

export interface AppUser {
  id: string;
  email?: string;
  role: Role;
  branch_id?: string | null;
  full_name?: string;
  isDemo?: boolean;
}

export const DEMO_PROFILES: Record<string, AppUser> = {
  admin: {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@dzrent.dz',
    full_name: 'Samir Belkacem (Superadmin)',
    role: 'admin',
    branch_id: null,
    isDemo: true,
  },
  branch_manager: {
    id: 'b0000000-0000-0000-0000-000000000001',
    email: 'manager.algiers@dzrent.dz',
    full_name: 'Rachid Haddad (Manager Alger)',
    role: 'branch_manager',
    branch_id: '10000000-0000-0000-0000-000000000001',
    isDemo: true,
  },
  manager: {
    id: 'b0000000-0000-0000-0000-000000000001',
    email: 'manager.algiers@dzrent.dz',
    full_name: 'Rachid Haddad (Manager Alger)',
    role: 'branch_manager',
    branch_id: '10000000-0000-0000-0000-000000000001',
    isDemo: true,
  },
  staff: {
    id: 'c0000000-0000-0000-0000-000000000001',
    email: 'staff.oran@dzrent.dz',
    full_name: 'Youcef Mansouri (Staff Oran)',
    role: 'staff',
    branch_id: '10000000-0000-0000-0000-000000000002',
    isDemo: true,
  },
  customer: {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'karim.b@gmail.com',
    full_name: 'Karim Benali (Customer)',
    role: 'customer',
    branch_id: null,
    isDemo: true,
  },
};

/**
 * Returns the currently authenticated user, with full support for demo role bypass.
 */
export async function getAuthUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get('dzrent_demo_role')?.value;
  const demoUserRaw = cookieStore.get('dzrent_demo_user')?.value;

  let demoUser: AppUser | null = null;
  if (demoUserRaw) {
    try {
      demoUser = JSON.parse(demoUserRaw);
    } catch {
      demoUser = null;
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If Supabase user exists
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, branch_id, full_name')
      .eq('id', user.id)
      .single();

    // If demoRole cookie is explicitly set, prioritize that demo role, otherwise check email / profile role
    let role = (demoRole && demoRole in DEMO_PROFILES ? demoRole : profile?.role || 'customer') as Role;
    if (user.email === 'admin@dzrent.dz') {
      role = 'admin';
    } else if (user.email === 'manager.algiers@dzrent.dz') {
      role = 'branch_manager';
    } else if (user.email === 'staff.oran@dzrent.dz') {
      role = 'staff';
    }

    return {
      id: user.id,
      email: user.email,
      role,
      branch_id: profile?.branch_id || demoUser?.branch_id || null,
      full_name: profile?.full_name || demoUser?.full_name || user.email,
      isDemo: Boolean(demoRole),
    };
  }

  // If no Supabase user, but demoRole is set
  if (demoRole && demoRole in DEMO_PROFILES) {
    const fallback = DEMO_PROFILES[demoRole];
    return {
      id: demoUser?.id || fallback.id,
      email: demoUser?.email || fallback.email,
      role: fallback.role,
      branch_id: demoUser?.branch_id !== undefined ? demoUser.branch_id : fallback.branch_id,
      full_name: demoUser?.full_name || fallback.full_name,
      isDemo: true,
    };
  }

  return null;
}
