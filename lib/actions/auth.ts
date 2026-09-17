'use server';

import { createClient } from '@/lib/supabase/server';
import { signupSchema, loginSchema } from '@/lib/validations/auth';

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profile?.role === 'admin') {
      redirectPath = '/admin';
    } else if (profile?.role === 'staff' || profile?.role === 'branch_manager') {
      redirectPath = '/staff';
    }
  }

  return { success: true, redirectPath };
}

export async function signOut(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}
