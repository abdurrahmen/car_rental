'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { NavItem } from './NavItem'
import { Logo } from '@/components/ui/Logo'
import { SignOutButton } from '@/components/layout/SignOutButton'
import {
  LayoutDashboard,
  Car,
  Building2,
  Users,
  CalendarDays,
  HelpCircle,
  CreditCard,
  UserCheck,
  Wrench,
  BarChart3,
} from 'lucide-react'
import type { Language, Dictionary } from '@/types'

export interface AdminSidebarProps {
  locale: Language
  dictionary?: Dictionary
  userRole?: string
  pendingCount?: number
  isOpen?: boolean
  onClose?: () => void
}

/**
 * DZRent Admin Sidebar:
 * - Single identity header: Logo + Role badge
 * - Grouped navigation with real count badges
 * - Subtle coming-soon items for unbuilt modules
 * - Accessible small Help trigger at bottom
 * - Sign out button
 * - Clean mobile drawer
 */
export function AdminSidebar({
  locale,
  dictionary,
  userRole = 'admin',
  pendingCount = 0,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const roleLabel =
    userRole === 'admin'
      ? d?.role_superadmin || (isArabic ? 'مسؤول عام' : 'Superadmin')
      : userRole === 'branch_manager'
      ? d?.role_branch_manager || (isArabic ? 'مدير فرع' : "Responsable d'agence")
      : d?.role_staff || (isArabic ? 'موظف' : 'Agent')

  const links = [
    {
      href: `/${locale}/admin`,
      label: d?.sidebar_overview || (isArabic ? 'نظرة عامة' : 'Vue d’ensemble'),
      icon: <LayoutDashboard />,
      exact: true,
    },
    {
      href: `/${locale}/admin/vehicles`,
      label: d?.sidebar_fleet || (isArabic ? 'الأسطول الوطني' : 'Flotte nationale'),
      icon: <Car />,
    },
    {
      href: `/${locale}/admin/branches`,
      label: d?.sidebar_branches || (isArabic ? 'إدارة الفروع' : 'Agences & Hubs'),
      icon: <Building2 />,
    },
    {
      href: `/${locale}/admin/staff`,
      label: d?.sidebar_staff || (isArabic ? 'فريق العمل' : 'Équipe & Agents'),
      icon: <Users />,
    },
    {
      href: `/${locale}/admin/reservations`,
      label: d?.sidebar_bookings || (isArabic ? 'الحجوزات والعمليات' : 'Réservations'),
      icon: <CalendarDays />,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'brand' as const,
    },
  ]

  const comingSoonLinks = [
    {
      label: d?.sidebar_customers || (isArabic ? 'العملاء' : 'Clients'),
      icon: <UserCheck />,
    },
    {
      label: d?.sidebar_payments || (isArabic ? 'المدفوعات والمالية' : 'Paiements'),
      icon: <CreditCard />,
    },
    {
      label: d?.sidebar_maintenance || (isArabic ? 'الصيانة والوثائق' : 'Maintenance'),
      icon: <Wrench />,
    },
    {
      label: d?.sidebar_reports || (isArabic ? 'التقارير والإحصائيات' : 'Rapports'),
      icon: <BarChart3 />,
    },
  ]

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebarContent = (
    <aside className="w-64 shrink-0 flex flex-col gap-3">
      {/* Top Identity Card */}
      <div className="admin-card p-4.5 flex flex-col gap-3">
        <Logo
          variant="full"
          size="md"
          locale={locale}
          href={`/${locale}/admin`}
        />

        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              {roleLabel}
            </span>
          </div>

          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400">
            v2.4
          </span>
        </div>
      </div>

      {/* Main Nav Items Card */}
      <div className="admin-card p-3 flex flex-col flex-1 justify-between">
        <div className="space-y-4">
          <div>
            <div className="px-3 py-1 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {d?.menu || (isArabic ? 'القائمة الرئيسية' : 'NAVIGATION')}
              </span>
            </div>

            <nav className="space-y-1">
              {links.map((link) => (
                <NavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  badge={link.badge}
                  badgeColor={link.badgeColor}
                  active={isLinkActive(link.href, link.exact)}
                  onClick={onClose}
                />
              ))}
            </nav>
          </div>

          {/* Coming Soon Section */}
          <div>
            <div className="px-3 py-1 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {isArabic ? 'وحدات قادمة' : 'MODULES FUTURS'}
              </span>
            </div>

            <div className="space-y-1">
              {comingSoonLinks.map((item) => (
                <NavItem
                  key={item.label}
                  href="#"
                  label={item.label}
                  icon={item.icon}
                  comingSoon
                  comingSoonLabel={d?.coming_soon || (isArabic ? 'قريباً' : 'Bientôt')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Small Help + Sign Out */}
        <div className="pt-3 mt-4 border-t border-neutral-100 dark:border-white/5 space-y-1">
          <a
            href="mailto:support@dzrent.dz"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-white/5 transition-colors min-h-[40px]"
          >
            <HelpCircle className="w-4.5 h-4.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
            <span>{d?.sidebar_help || (isArabic ? 'المساعدة والدعم' : 'Aide & Support')}</span>
          </a>

          <SignOutButton
            locale={locale}
            variant="sidebar"
            label={d?.sign_out || (isArabic ? 'تسجيل الخروج' : 'Déconnexion')}
          />
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block sticky top-20 self-start">{sidebarContent}</div>

      {/* Mobile drawer with backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-50 p-4 max-w-xs w-full h-full overflow-y-auto bg-sand-100 dark:bg-ink">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
