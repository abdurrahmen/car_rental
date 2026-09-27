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
 * Client container for the Admin App Shell:
 * - Coordinates mobile sidebar open/close state
 * - Uses soft neutral canvas (#F6F7F9)
 * - Standard gutters px-6 md:px-8 and vertical rhythm py-6 md:py-8
 * - Dedicated app-shell topbar with zero marketing links
 */
export function AdminShellClient({
  children,
  locale,
  dictionary,
  user,
}: AdminShellClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-neutral-900 flex flex-col">
      <AdminTopbar
        locale={locale}
        user={user}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8 w-full items-start">
        <AdminSidebar
          locale={locale}
          dictionary={dictionary}
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
