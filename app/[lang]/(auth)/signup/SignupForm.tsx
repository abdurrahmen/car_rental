'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, type AuthState } from '@/lib/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function SignupForm({ lang }: { lang: string }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUp,
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
      {/* Brand icon */}
      <div className="flex justify-center mb-6">
        <span className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          DZ
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-center text-neutral-900 dark:text-white mb-2">
        {isArabic ? 'إنشاء حساب جديد' : lang === 'fr' ? 'Créer un compte' : 'Join DZ Rent'}
      </h1>
      <p className="text-xs text-neutral-400 text-center mb-8">
        {isArabic
          ? 'احجز سيارتك المفضلة واستمتع بتجربة كراء مرنة وموثوقة'
          : 'Create your account to unlock instant vehicle reservations across Algeria'}
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
            isArabic ? 'الاسم الكامل' : lang === 'fr' ? 'Nom complet' : 'Full Name'
          }
          placeholder={isArabic ? 'محمد أمين' : 'Mohamed Amine'}
          required
        />

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
          type="tel"
          name="phone"
          label={
            isArabic
              ? 'رقم الهاتف (الجزائر)'
              : lang === 'fr'
              ? 'Numéro de téléphone'
              : 'Phone number (Algeria)'
          }
          placeholder="0550 12 34 56"
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

        <Input
          type="password"
          name="confirm_password"
          label={
            isArabic
              ? 'تأكيد كلمة المرور'
              : lang === 'fr'
              ? 'Confirmer le mot de passe'
              : 'Confirm Password'
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
          {isArabic ? 'تأكيد وإنشاء الحساب' : lang === 'fr' ? "S'inscrire" : 'Create Account'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-black/[0.05] dark:border-white/[0.06] text-center">
        <p className="text-xs text-neutral-500">
          {isArabic
            ? 'لديك حساب بالفعل؟ '
            : lang === 'fr'
            ? 'Vous avez déjà un compte ? '
            : 'Already have an account? '}
          <Link
            href={`/${lang}/login`}
            className="text-brand-500 hover:text-brand-600 font-semibold inline-flex items-center"
          >
            {isArabic ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  )
}
