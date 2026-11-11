'use client'

import React, { useState } from 'react'
import { AdminTopbar } from './AdminTopbar'
import { AdminSidebar } from './AdminSidebar'
import type { Language, Dictionary } from '@/types'

export interface AdminShellClientProps {
  children: React.ReactNode
  locale: Language
  dictionary: Dictionary
  user: {
    full_name?: string
    email?: string
    role?: string
  }
}

/**
 * DZRent Admin Control Room Container:
 * - Coordinates mobile drawer state
 * - Warm Algerian sand canvas (#FBF7F0) with deep ink dark mode (#0B1320)
 * - Fluid wide layout with gutters for the 12-column bento grid
 */
export function AdminShellClient({
  children,
  locale,
  dictionary,
  user,
}: AdminShellClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FBF7F0] dark:bg-[#0B1320] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors selection:bg-brand-500/20 selection:text-brand-900">
      <AdminTopbar
        locale={locale}
        dictionary={dictionary}
        user={user}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-7 flex flex-col md:flex-row gap-5 md:gap-7 w-full items-start">
        <AdminSidebar
          locale={locale}
          dictionary={dictionary}
          userRole={user.role}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
