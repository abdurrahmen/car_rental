import React from 'react'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { AdminShellClient } from '@/components/admin/AdminShellClient'
import type { Language } from '@/types'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)

  const user = await getAuthUser()

  if (!user || user.role !== 'admin') {
    redirect(`/${lang}/login`)
  }

  return (
    <AdminShellClient
      locale={locale}
      dictionary={dict}
      user={{
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminShellClient>
  )
}
