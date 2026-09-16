'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, type AuthState } from '@/lib/actions/auth';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm({ lang }: { lang: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signIn,
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
        {lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Login'}
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
              ? 'تم تسجيل الدخول بنجاح! جاري التحويل...'
              : lang === 'fr'
                ? 'Connexion réussie ! Redirection...'
                : 'Login successful! Redirecting...'}
          </div>
        )}

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

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={pending}
          disabled={pending}
          className="mt-6"
        >
          {lang === 'ar'
            ? 'دخول'
            : lang === 'fr'
              ? 'Se connecter'
              : 'Sign In'}
        </Button>

        <div className="text-center mt-4 text-sm text-neutral-600">
          <Link
            href={`/${lang}/signup`}
            className="text-brand-800 font-semibold hover:underline"
          >
            {lang === 'ar'
              ? 'ليس لديك حساب؟ سجل الآن'
              : lang === 'fr'
                ? "Pas de compte ? S'inscrire"
                : 'Need an account? Sign up'}
          </Link>
        </div>
      </form>
    </div>
  );
}
