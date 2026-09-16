import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { StatsCard } from '@/components/dashboard/StatsCard'
import Link from 'next/link'
import type { Language } from '@/types'

interface AdminOverviewPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminOverviewPage({
  params,
}: AdminOverviewPageProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const { count: vehicleCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
  const { count: reservationCount } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
  const { count: activeCount } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  const { count: branchCount } = await supabase
    .from('branches')
    .select('*', { count: 'exact', head: true })

  const isArabic = locale === 'ar'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {dict.admin?.admin_dashboard || 'Platform Performance'}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {isArabic
            ? 'مؤشرات الأسطول الوطني، الفروع النشطة، ومعدل استخدام المركبات.'
            : 'National fleet metrics, active branch performance, and reservation throughput.'}
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title={dict.staff?.vehicle_management || 'Total Fleet'}
          value={vehicleCount || 0}
          subtitle={isArabic ? 'مركبات في الخدمة' : 'Active vehicles'}
          icon={
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />

        <StatsCard
          title={dict.admin?.all_reservations || 'Total Bookings'}
          value={reservationCount || 0}
          subtitle={isArabic ? 'طلب كراء مسجل' : 'All-time reservations'}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />

        <StatsCard
          title={dict.dashboard?.active_rentals || 'On-Road Active'}
          value={activeCount || 0}
          subtitle={isArabic ? 'سيارات مؤجرة حاليًا' : 'Currently rented'}
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatsCard
          title={dict.admin?.manage_branches || 'Active Hubs'}
          value={branchCount || 0}
          subtitle={isArabic ? 'وكالات وطنية' : 'Cities covered'}
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      {/* Fast Administrative Actions Card */}
      <div className="bg-neutral-50/80 dark:bg-neutral-800/50 p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
          {isArabic ? 'إجراءات سريعة' : 'Quick Operations'}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${lang}/admin/branches`}
            className="apple-press inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-black/[0.06] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 shadow-2xs"
          >
            {dict.admin?.manage_branches || 'Manage Branches'} &rarr;
          </Link>
          <Link
            href={`/${lang}/admin/staff`}
            className="apple-press inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-black/[0.06] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 shadow-2xs"
          >
            {dict.admin?.manage_staff || 'Manage Staff & Managers'} &rarr;
          </Link>
          <Link
            href={`/${lang}/admin/reservations`}
            className="apple-press inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-black/[0.06] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 shadow-2xs"
          >
            {dict.admin?.all_reservations || 'All System Bookings'} &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
