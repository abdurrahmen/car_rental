'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { NavItem } from './NavItem'
import { SignOutButton } from '@/components/layout/SignOutButton'
import { LayoutDashboard, Car, Building2, Users, CalendarDays, HelpCircle } from 'lucide-react'
import type { Language, Dictionary } from '@/types'

export interface AdminSidebarProps {
  locale: Language
  dictionary?: Dictionary
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Donezo-style Admin Sidebar:
 * - Eyebrow label: PLATFORM CONTROL
 * - Title: Admin Dashboard
 * - Role pill: bg-blue-50 text-blue-700 with primary blue dot (Zero purple)
 * - Navigation links using NavItem with active-state styling and fixed 44px height
 * - Optional lightweight Help card at bottom
 * - Responsive mobile drawer support
 */
export function AdminSidebar({
  locale,
  dictionary,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const isArabic = locale === 'ar'

  const links = [
    {
      href: `/${locale}/admin`,
      label: dictionary?.dashboard?.overview || (isArabic ? 'نظرة عامة' : 'System Overview'),
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
      exact: true,
    },
    {
      href: `/${locale}/admin/vehicles`,
      label: dictionary?.admin?.manage_fleet || (isArabic ? 'إدارة الأسطول' : 'National Fleet'),
      icon: <Car className="w-4.5 h-4.5" />,
    },
    {
      href: `/${locale}/admin/branches`,
      label: dictionary?.admin?.manage_branches || (isArabic ? 'إدارة الفروع' : 'Branches'),
      icon: <Building2 className="w-4.5 h-4.5" />,
    },
    {
      href: `/${locale}/admin/staff`,
      label: dictionary?.admin?.manage_staff || (isArabic ? 'فريق العمل' : 'Staff & Managers'),
      icon: <Users className="w-4.5 h-4.5" />,
    },
    {
      href: `/${locale}/admin/reservations`,
      label: dictionary?.admin?.all_reservations || (isArabic ? 'الحجوزات الوطنية' : 'National Bookings'),
      icon: <CalendarDays className="w-4.5 h-4.5" />,
    },
  ]

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebarContent = (
    <aside className="w-64 shrink-0 space-y-4">
      {/* Top Identity Card */}
      <div className="admin-card p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 block">
          {isArabic ? 'الإدارة المركزية' : 'PLATFORM CONTROL'}
        </span>
        <span className="text-base font-bold text-neutral-900 block mt-1 tracking-tight">
          {dictionary?.admin?.admin_dashboard || 'Admin Dashboard'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Superadmin
        </span>
      </div>

      {/* Nav Items Card */}
      <div className="admin-card p-3 space-y-1">
        <div className="px-2 py-1 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {isArabic ? 'القائمة الرئيسية' : 'MENU'}
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isLinkActive(link.href, link.exact)}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Sign Out Action */}
        <div className="pt-2 mt-2 border-t border-neutral-100">
          <SignOutButton
            locale={locale}
            variant="sidebar"
            label={isArabic ? 'تسجيل الخروج' : locale === 'fr' ? 'Déconnexion' : 'Sign Out'}
          />
        </div>
      </div>

      {/* Optional Lightweight Support Card */}
      <div className="rounded-2xl p-4 bg-brand-500 text-white shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-white/80 shrink-0" />
          <h4 className="text-xs font-bold text-white tracking-tight">
            {isArabic ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
          </h4>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed">
          {isArabic
            ? 'فريق الدعم الفني متواجد لمساعدتك في أي استفسار.'
            : 'DZRent dedicated operations team is available 24/7.'}
        </p>
        <a
          href="mailto:support@dzrent.dz"
          className="inline-block text-[11px] font-semibold text-white underline decoration-white/50 hover:decoration-white transition-colors pt-0.5"
        >
          {isArabic ? 'تواصل مع الدعم الفني' : 'Contact Support'} &rarr;
        </a>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile drawer with backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-50 p-4 max-w-xs w-full h-full overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
