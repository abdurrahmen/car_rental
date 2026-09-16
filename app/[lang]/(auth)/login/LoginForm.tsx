'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, type AuthState } from '@/lib/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import type { Language } from '@/types'

export function LoginForm({ lang }: { lang: string }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signIn,
    null
  )

  useEffect(() => {
    if (state?.success) {
      router.push(`/${lang}/dashboard`)
    }
  }, [state, router, lang])

  const isArabic = lang === 'ar'

  return (
    <div className="w-full bg-white dark:bg-neutral-900 p-8 sm:p-10 rounded-3xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)] border border-black/[0.06] dark:border-white/[0.08] animate-apple-fade-up">
      {/* Brand logo */}
      <div className="flex justify-center mb-6">
        <Logo variant="vertical" size="lg" locale={lang as Language} href={`/${lang}`} />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-center text-neutral-900 dark:text-white mb-2">
        {isArabic ? 'مرحبًا بك مجددًا' : lang === 'fr' ? 'Connexion' : 'Sign In to DZ Rent'}
      </h1>
      <p className="text-xs text-neutral-400 text-center mb-8">
        {isArabic
          ? 'أدخل بياناتك لمتابعة حجوزاتك وإدارتها'
          : 'Enter your credentials to access and manage your reservations'}
      </p>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            {isArabic
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
            isArabic ? 'البريد الإلكتروني' : lang === 'fr' ? 'E-mail' : 'Email address'
          }
          placeholder="name@example.com"
          required
        />

        <Input
          type="password"
          name="password"
          label={
            isArabic ? 'كلمة المرور' : lang === 'fr' ? 'Mot de passe' : 'Password'
          }
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={pending}
          disabled={pending}
          className="mt-4"
        >
          {isArabic ? 'تسجيل الدخول' : lang === 'fr' ? 'Se connecter' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-black/[0.05] dark:border-white/[0.06] text-center">
        <p className="text-xs text-neutral-500">
          {isArabic
            ? 'ليس لديك حساب بعد؟ '
            : lang === 'fr'
            ? "Vous n'avez pas de compte ? "
            : "Don't have an account? "}
          <Link
            href={`/${lang}/signup`}
            className="text-brand-500 hover:text-brand-600 font-semibold inline-flex items-center"
          >
            {isArabic
              ? 'إنشاء حساب جديد'
              : lang === 'fr'
              ? "S'inscrire"
              : 'Create one now'}
          </Link>
        </p>
      </div>
    </div>
  )
}
