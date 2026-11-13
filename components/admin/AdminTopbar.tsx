'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/admin/Avatar'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { SignOutButton } from '@/components/layout/SignOutButton'
import { NotificationBell } from '@/components/layout/NotificationBell'
import {
  Search,
  Menu,
  X,
  Plus,
  Car,
  Calendar,
  FileCheck2,
  ChevronRight,
} from 'lucide-react'

import type { Language, Dictionary } from '@/types'

export interface AdminTopbarProps {
  locale: Language
  dictionary?: Dictionary
  user: {
    full_name?: string
    email?: string
    role?: string
  }
  onToggleSidebar?: () => void
  isSidebarOpen?: boolean
}

/**
 * DZRent Admin Slim Topbar:
 * - Slim height (h-14)
 * - Mobile hamburger & logo mark on small screens
 * - ⌘K Command Palette / Global Search trigger
 * - Notifications popover
 * - Language switcher
 * - User profile dropdown with role chip
 */
export function AdminTopbar({
  locale,
  dictionary,
  user,
  onToggleSidebar,
  isSidebarOpen = false,
}: AdminTopbarProps) {
  const router = useRouter()
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const [searchQuery, setSearchQuery] = useState('')
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const commandInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: ⌘K or Ctrl+K to toggle command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandOpen((prev) => !prev)
      } else if (e.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandOpen])

  // Focus input when command palette opens
  useEffect(() => {
    if (isCommandOpen) {
      setTimeout(() => commandInputRef.current?.focus(), 50)
    }
  }, [isCommandOpen])

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsCommandOpen(false)
    router.push(`/${locale}/admin/vehicles?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const quickActions = [
    {
      title: d?.new_booking || (isArabic ? 'حجز جديد (حضوري)' : 'Nouvelle réservation'),
      subtitle: isArabic ? 'تسجيل حجز مباشر لزبون بالوكالة' : 'Créer un dossier client sur place',
      icon: <Calendar className="w-4 h-4 text-brand-500" />,
      href: `/${locale}/admin/reservations`,
    },
    {
      title: d?.add_car || (isArabic ? 'إضافة مركبة للأسطول' : 'Ajouter un véhicule'),
      subtitle: isArabic ? 'تسجيل ترقيم ووثائق سيارة جديدة' : 'Fiche technique, matricule et photos',
      icon: <Plus className="w-4 h-4 text-emerald-500" />,
      href: `/${locale}/admin/vehicles/new`,
    },
    {
      title: d?.all_bookings || (isArabic ? 'سجل الحجوزات والعمليات' : 'Toutes les réservations'),
      subtitle: isArabic ? 'متابعة العقود، الوصولات والكفالات' : 'Consulter et filtrer les contrats',
      icon: <FileCheck2 className="w-4 h-4 text-amber-500" />,
      href: `/${locale}/admin/reservations`,
    },
    {
      title: d?.all_vehicles || (isArabic ? 'إدارة الأسطول والمحطات' : 'Gestion de la flotte'),
      subtitle: isArabic ? 'حالة المركبات، الجاهزية والصيانة' : 'Disponibilité et localisation',
      icon: <Car className="w-4 h-4 text-sky-500" />,
      href: `/${locale}/admin/vehicles`,
    },
  ]

  const filteredActions = searchQuery.trim()
    ? quickActions.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickActions

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-15 bg-[#FBF7F0]/90 dark:bg-[#0B1320]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
        {/* Mobile View: Hamburger & Brand Mark */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation"
              className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/10 transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="md:hidden">
            <Logo variant="mark" size="sm" locale={locale} href={`/${locale}/admin`} />
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>DZRent Live Control</span>
          </div>
        </div>

        {/* Global Search Button / Trigger */}
        <div className="flex-1 max-w-md mx-2 md:mx-4">
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="w-full h-9.5 ps-3.5 pe-3 rounded-full bg-white dark:bg-[#142032] hover:bg-white/90 text-xs text-neutral-400 dark:text-neutral-400 border border-black/[0.07] dark:border-white/[0.08] shadow-2xs flex items-center justify-between gap-2 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-neutral-400 group-hover:text-brand-500 transition-colors shrink-0" />
              <span className="truncate text-start">
                {d?.search_placeholder || (isArabic ? 'ابحث عن مركبة، ترقيم، أو حجز...' : 'Rechercher véhicule, matricule…')}
              </span>
            </div>

            {/* RTL safe ⌘K badge */}
            <span dir="ltr" className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06]">
              ⌘K
            </span>
          </button>
        </div>

        {/* Actions: Notifications, Language, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notifications Popover */}
          <NotificationBell locale={locale} userRole="admin" />

          {/* Language Switcher */}
          <LanguageSwitcher locale={locale} />

          {/* User Profile Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((p) => !p)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="User menu"
            >
              <Avatar name={user.full_name || 'Admin'} size="sm" />
              <div className="hidden lg:flex flex-col text-start leading-tight pe-1">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">
                  {user.full_name || 'Admin'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {user.role === 'admin' 
                    ? (d?.role_superadmin || (isArabic ? 'مسؤول عام' : 'Superadmin'))
                    : user.role === 'branch_manager'
                    ? (d?.role_branch_manager || (isArabic ? 'مدير فرع' : 'Manager'))
                    : user.role === 'staff'
                    ? (d?.role_staff || (isArabic ? 'موظف' : 'Staff'))
                    : (d?.role_customer || (isArabic ? 'زبون' : 'Client'))}
                </span>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full end-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#142032] p-2 shadow-xl border border-black/[0.08] dark:border-white/[0.08] z-50 animate-apple-fade-in">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-white/5">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {user.full_name || 'Admin DZRent'}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {user.email || 'admin@dzrent.dz'}
                  </p>
                </div>
                <div className="pt-1.5">
                  <SignOutButton
                    locale={locale}
                    variant="sidebar"
                    label={d?.sign_out || (isArabic ? 'تسجيل الخروج' : 'Déconnexion')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ⌘K Command Palette Modal */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-apple-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsCommandOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#142032] shadow-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden z-10 animate-apple-scale-in">
            <form onSubmit={handleSearchSubmit} className="p-3 border-b border-neutral-100 dark:border-white/5 flex items-center gap-2">
              <Search className="w-5 h-5 text-neutral-400 ms-1 shrink-0" />
              <input
                ref={commandInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'ابحث أو اكتب ترقيم مركبة...' : 'Rechercher ou entrer un matricule…'}
                className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
              />
              <span dir="ltr" className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-neutral-400">
                ESC
              </span>
            </form>

            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {isArabic ? 'إجراءات سريعة واختصارات' : 'ACTIONS RAPIDES'}
              </div>

              {filteredActions.map((action, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIsCommandOpen(false)
                    router.push(action.href)
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-start hover:bg-neutral-100/80 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                      {action.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {action.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-white transition-colors rtl:rotate-180 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
