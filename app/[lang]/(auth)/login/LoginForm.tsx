'use client'

import { useActionState, useEffect, useTransition } from 'react'
import { signIn, loginAsDemo, type AuthState } from '@/lib/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { Shield, Building2, User } from 'lucide-react'
import type { Language } from '@/types'

export function LoginForm({ lang, redirectTo }: { lang: string; redirectTo?: string }) {
  const [isDemoPending, startDemoTransition] = useTransition()
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signIn,
    null
  )

  useEffect(() => {
    if (state?.success) {
      const target = redirectTo || state.redirectPath || '/dashboard'
      window.location.href = target.startsWith(`/${lang}`) ? target : `/${lang}${target}`
    }
  }, [state, lang, redirectTo])

  const handleDemoClick = (role: 'admin' | 'manager' | 'customer') => {
    const roleVal = role === 'manager' ? 'branch_manager' : role
    document.cookie = `dzrent_demo_role=${roleVal}; path=/; max-age=86400; SameSite=Lax`
    startDemoTransition(async () => {
      try {
        const res = await loginAsDemo(role, lang)
        console.log('Demo login response:', res)
        if (res.success && res.redirectPath) {
          console.log('Redirecting to:', res.redirectPath)
          window.location.href = res.redirectPath
        } else {
          console.error('Demo login failed:', res)
          alert(`Login failed. Check console for details.`)
        }
      } catch (error) {
        console.error('Demo login error:', error)
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  const isArabic = lang === 'ar'

  return (
    <div className="w-full bg-white p-8 sm:p-10 rounded-3xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)] border border-black/[0.06] animate-apple-fade-up">
      {/* Brand logo */}
      <div className="flex justify-center mb-6">
        <Logo variant="vertical" size="lg" locale={lang as Language} href={`/${lang}`} />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-center text-neutral-900 mb-2">
        {isArabic ? 'مرحبًا بك مجددًا' : lang === 'fr' ? 'Connexion' : 'Sign In to DZ Rent'}
      </h1>
      <p className="text-xs text-neutral-400 text-center mb-6">
        {isArabic
          ? 'أدخل بياناتك لمتابعة حجوزاتك وإدارتها'
          : 'Enter your credentials to access and manage your reservations'}
      </p>

      {/* 1-Click Fast Role Bypass Demo Buttons */}
      <div className="mb-6 p-4 rounded-3xl bg-neutral-50/80 border border-black/[0.04] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {isArabic ? 'الدخول السريع (تجاوز المصادقة)' : 'Instant Demo Access (Bypass Auth)'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-500/10 text-brand-700">
            {isDemoPending ? 'Loading...' : '1-Click'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Admin Bypass */}
          <button
            type="button"
            disabled={isDemoPending}
            onClick={() => handleDemoClick('admin')}
            className="apple-press flex flex-col items-start p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200/60 text-start transition-all disabled:opacity-60 min-h-[52px]"
          >
            <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>{isArabic ? 'المسؤول' : 'Admin'}</span>
            </span>
            <span className="text-[10px] text-blue-600/80 mt-0.5 font-medium">
              {isArabic ? 'لوحة التحكم المركزية' : 'Admin Console'}
            </span>
          </button>

          {/* Manager Bypass */}
          <button
            type="button"
            disabled={isDemoPending}
            onClick={() => handleDemoClick('manager')}
            className="apple-press flex flex-col items-start p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-start transition-all disabled:opacity-60 min-h-[52px]"
          >
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>{isArabic ? 'مدير فرع' : 'Manager'}</span>
            </span>
            <span className="text-[10px] text-amber-600/70 mt-0.5 font-medium">
              {isArabic ? 'بوابة وكالة الجزائر' : 'Staff Agency Portal'}
            </span>
          </button>

          {/* Customer Bypass */}
          <button
            type="button"
            disabled={isDemoPending}
            onClick={() => handleDemoClick('customer')}
            className="apple-press flex flex-col items-start p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-start transition-all disabled:opacity-60 min-h-[52px]"
          >
            <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{isArabic ? 'زبون' : 'Customer'}</span>
            </span>
            <span className="text-[10px] text-blue-600/70 mt-0.5 font-medium">
              {isArabic ? 'الحجوزات والملف' : 'Client Bookings'}
            </span>
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-6">
        <div className="border-t border-neutral-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-medium text-neutral-400 absolute">
          {isArabic ? 'أو تسجيل الدخول اليدوي' : 'Or manual credentials'}
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="p-3.5 bg-rose-500/10 text-rose-700 border border-rose-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            {isArabic
              ? 'تم تسجيل الدخول بنجاح! جاري التحويل...'
              : lang === 'fr'
              ? 'Connexion réussie ! Redirection...'
              : 'Login successful! Redirecting...'}
          </div>
        )}

        <input type="hidden" name="redirect" value={redirectTo || ''} />

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

      <div className="mt-8 pt-6 border-t border-black/[0.05] text-center">
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
