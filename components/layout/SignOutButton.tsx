'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'

export function SignOutButton({
  locale,
  variant = 'icon',
  label = 'Sign out',
}: {
  locale: string
  variant?: 'icon' | 'sidebar'
  label?: string
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleSignOut}
        type="button"
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors min-h-[42px] cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      type="button"
      className="apple-press inline-flex items-center justify-center h-9 px-3 rounded-full text-xs font-semibold tracking-tight text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-all min-h-[38px] cursor-pointer"
      title={label}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  )
}
