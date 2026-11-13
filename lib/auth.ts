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

import { cache } from 'react';

/**
 * Returns the currently authenticated user, with full support for demo role bypass.
 * Cached per-request to avoid redundant roundtrips in Layout, Page, and Header.
 */
export const getAuthUser = cache(async function getAuthUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  
  // Check demo cookies (works in all environments for easy testing)
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

  // If demo cookies exist, use them (priority over Supabase)
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

  // Check if any Supabase session cookies exist before making network calls
  const allCookies = cookieStore.getAll();
  const hasAuthToken = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );

  if (!hasAuthToken) {
    return null;
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

    let role = (profile?.role || 'customer') as Role;
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
      branch_id: profile?.branch_id || null,
      full_name: profile?.full_name || user.email,
      isDemo: false,
    };
  }

  return null;
});

/**
 * Asserts the current user has one of the allowed roles.
 * Throws if not authenticated or role doesn't match.
 */
export async function assertRole(allowedRoles: Role[]): Promise<AppUser> {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');
  if (!allowedRoles.includes(user.role)) throw new Error('Forbidden');
  return user;
}
