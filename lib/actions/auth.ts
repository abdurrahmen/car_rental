'use server';

import { createClient } from '@/lib/supabase/server';
import { signupSchema, loginSchema } from '@/lib/validations/auth';
import { cookies } from 'next/headers';

export type AuthState = { error?: string; success?: boolean; redirectPath?: string } | null;

export async function signUp(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData.entries());
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid fields' };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.full_name,
        phone: result.data.phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (authData.user) {
    // Ensure profile row exists with details
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: result.data.full_name,
      phone: result.data.phone,
      role: 'customer',
      preferred_language: 'ar',
    });
  }

  return { success: true, redirectPath: '/dashboard' };
}

export async function signIn(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData.entries());
  const redirectTo = data.redirect as string | undefined;
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid fields' };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Determine intelligent redirect based on user role
  let redirectPath = '/dashboard';
  if (authData.user) {
    const cookieStore = await cookies();
    let role = 'customer';

    if (result.data.email === 'admin@dzrent.dz') {
      role = 'admin';
    } else if (result.data.email === 'manager.algiers@dzrent.dz') {
      role = 'branch_manager';
    } else if (result.data.email === 'staff.oran@dzrent.dz') {
      role = 'staff';
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();
      if (profile?.role) {
        role = profile.role;
      }
    }

    if (role === 'admin') {
      redirectPath = '/admin';
      if (process.env.NODE_ENV !== 'production') {
        cookieStore.set('dzrent_demo_role', 'admin', {
          path: '/',
          maxAge: 60 * 60 * 24,
          sameSite: 'lax',
        });
      }
    } else if (role === 'staff' || role === 'branch_manager') {
      redirectPath = '/staff';
      if (process.env.NODE_ENV !== 'production') {
        cookieStore.set('dzrent_demo_role', role, {
          path: '/',
          maxAge: 60 * 60 * 24,
          sameSite: 'lax',
        });
      }
    }
  }

  return { success: true, redirectPath: redirectTo || redirectPath };
}

export async function loginAsDemo(role: 'admin' | 'manager' | 'customer', lang: string = 'en') {
  const cookieStore = await cookies();

  const demoAccounts = {
    admin: {
      email: 'admin@dzrent.dz',
      password: 'password123',
      id: 'a0000000-0000-0000-0000-000000000001',
      full_name: 'Samir Belkacem (Superadmin)',
      role: 'admin',
      target: `/${lang}/admin`,
    },
    manager: {
      email: 'manager.algiers@dzrent.dz',
      password: 'password123',
      id: 'b0000000-0000-0000-0000-000000000001',
      full_name: 'Rachid Haddad (Manager Alger)',
      role: 'branch_manager',
      branch_id: '10000000-0000-0000-0000-000000000001',
      target: `/${lang}/staff`,
    },
    customer: {
      email: 'karim.b@gmail.com',
      password: 'password123',
      id: 'd0000000-0000-0000-0000-000000000001',
      full_name: 'Karim Benali (Customer)',
      role: 'customer',
      target: `/${lang}/dashboard`,
    },
  };

  const account = demoAccounts[role];

  // Set demo bypass cookies (these work in both production and development)
  cookieStore.set('dzrent_demo_role', account.role, {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: 'lax',
  });

  cookieStore.set(
    'dzrent_demo_user',
    JSON.stringify({
      id: account.id,
      email: account.email,
      full_name: account.full_name,
      role: account.role,
      branch_id: 'branch_id' in account ? account.branch_id : null,
    }),
    {
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    }
  );

  console.log(`[Demo Login] Set cookies for role: ${account.role}, redirecting to: ${account.target}`);

  return { success: true, redirectPath: account.target };
}

export async function signOut(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete('dzrent_demo_role');
  cookieStore.delete('dzrent_demo_user');

  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

