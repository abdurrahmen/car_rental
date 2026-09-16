'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, type AuthState } from '@/lib/actions/auth';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SignupForm({ lang }: { lang: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUp,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/${lang}/dashboard`);
    }
  }, [state, router, lang]);

  return (
    <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-neutral-200">
      <h1 className="text-2xl font-heading font-bold mb-6 text-center text-brand-900">
        {lang === 'ar' ? 'إنشاء حساب' : lang === 'fr' ? 'Inscription' : 'Sign Up'}
      </h1>
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3 bg-danger-50 text-danger-700 border border-danger-200 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3 bg-success-50 text-success-700 border border-success-200 rounded-lg text-sm">
            {lang === 'ar'
              ? 'تم إنشاء الحساب بنجاح! جاري التحويل...'
              : lang === 'fr'
                ? 'Compte créé avec succès ! Redirection...'
                : 'Account created successfully! Redirecting...'}
          </div>
        )}

        <Input
          type="text"
          name="full_name"
          label={
            lang === 'ar'
              ? 'الاسم الكامل'
              : lang === 'fr'
                ? 'Nom complet'
                : 'Full Name'
          }
          required
        />

        <Input
          type="email"
          name="email"
          label={
            lang === 'ar'
              ? 'البريد الإلكتروني'
              : lang === 'fr'
                ? 'E-mail'
                : 'Email'
          }
          required
        />

        <Input
          type="tel"
          name="phone"
          label={
            lang === 'ar'
              ? 'رقم الهاتف'
              : lang === 'fr'
                ? 'Téléphone'
                : 'Phone'
          }
          required
        />

        <Input
          type="password"
          name="password"
          label={
            lang === 'ar'
              ? 'كلمة المرور'
              : lang === 'fr'
                ? 'Mot de passe'
                : 'Password'
          }
          required
        />

        <Input
          type="password"
          name="confirm_password"
          label={
            lang === 'ar'
              ? 'تأكيد كلمة المرور'
              : lang === 'fr'
                ? 'Confirmer le mot de passe'
                : 'Confirm Password'
          }
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={pending}
          disabled={pending}
          className="mt-6"
        >
          {lang === 'ar'
            ? 'تسجيل'
            : lang === 'fr'
              ? "S'inscrire"
              : 'Sign Up'}
        </Button>

        <div className="text-center mt-4 text-sm text-neutral-600">
          <Link
            href={`/${lang}/login`}
            className="text-brand-800 font-semibold hover:underline"
          >
            {lang === 'ar'
              ? 'لديك حساب؟ سجل دخول'
              : lang === 'fr'
                ? 'Déjà un compte ? Se connecter'
                : 'Already have an account? Login'}
          </Link>
        </div>
      </form>
    </div>
  );
}
