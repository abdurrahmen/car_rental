'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/admin/Avatar'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { SignOutButton } from '@/components/layout/SignOutButton'
import { Search, Bell, Menu, X } from 'lucide-react'
import type { Language } from '@/types'

export interface AdminTopbarProps {
  locale: Language
  user: {
    full_name?: string
    email?: string
    role?: string
  }
  onToggleSidebar?: () => void
  isSidebarOpen?: boolean
}

/**
 * Dedicated App-Shell Topbar for DZRent Admin Dashboard (Donezo Target):
 * - Fixed h-16
 * - Small DZRent mark on the start
 * - Rounded-full global search input with ⌘K / Ctrl+K hint
 * - Ghost circular notification bell
 * - User avatar + details with accessible sign-out & language switcher
 */
export function AdminTopbar({
  locale,
  user,
  onToggleSidebar,
  isSidebarOpen = false,
}: AdminTopbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close user menu on click outside
  useEffect(() => {
    if (!isUserMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/${locale}/admin/vehicles?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const isArabic = locale === 'ar'

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/90 backdrop-blur-md border-b border-black/[0.05] px-6 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Start: Mobile Hamburger & Brand Mark */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
            className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Logo
          variant="mark"
          size="sm"
          locale={locale}
          href={`/${locale}/admin`}
        />
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-bold text-sm text-neutral-900 tracking-tight">
            DZ<span className="text-brand-500">Rent</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
            ADMIN
          </span>
        </div>
      </div>

      {/* Center: Search Input */}
      <div className="flex-1 max-w-md mx-2 md:mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 start-0 ps-3.5 flex items-center text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isArabic
                ? 'ابحث عن مركبات، فروع، حجوزات...'
                : 'Search vehicles, branches, reservations…'
            }
            className="w-full h-10 ps-9.5 pe-12 rounded-full bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white text-xs text-neutral-900 placeholder-neutral-400 border border-transparent focus:border-brand-500/30 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          />
          <div className="pointer-events-none absolute inset-y-0 end-0 pe-3 flex items-center">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-neutral-400 bg-white border border-black/[0.08] shadow-2xs">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          </div>
        </form>
      </div>

      {/* End Actions: Notifications, Language, User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => setHasUnreadNotifications(false)}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[1.75]" />
          {hasUnreadNotifications && (
            <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
          )}
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher locale={locale} />

        {/* User Avatar & Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-neutral-100/80 transition-colors cursor-pointer"
            aria-expanded={isUserMenuOpen}
            aria-label="User menu"
          >
            <Avatar name={user.full_name || 'Admin'} size="md" />
            <div className="hidden lg:flex flex-col text-start leading-tight">
              <span className="text-xs font-semibold text-neutral-800 truncate max-w-[130px]">
                {user.full_name || 'Administrator'}
              </span>
              <span className="text-[10px] text-neutral-400 capitalize">
                {user.role || 'Superadmin'}
              </span>
            </div>
          </button>

          {/* User Popover Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute top-full end-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] z-50 animate-apple-fade-in border-0">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-xs font-bold text-neutral-900 truncate">
                  {user.full_name || 'Administrator'}
                </p>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {user.email || 'admin@dzrent.dz'}
                </p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {user.role === 'admin' ? 'Superadmin' : user.role || 'Admin'}
                </span>
              </div>

              <div className="pt-1.5">
                <SignOutButton
                  locale={locale}
                  variant="sidebar"
                  label={locale === 'ar' ? 'تسجيل الخروج' : locale === 'fr' ? 'Déconnexion' : 'Sign Out'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
