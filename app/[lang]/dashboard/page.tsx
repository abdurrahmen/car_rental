import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { ReservationTable } from '@/components/dashboard/ReservationTable'
import { StatsCard } from '@/components/dashboard/StatsCard'
import Link from 'next/link'
import type { Language } from '@/types'

interface DashboardOverviewProps {
  params: Promise<{ lang: string }>
}

export default async function DashboardOverview({
  params,
}: DashboardOverviewProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), branch:branches(*)')
    .eq('customer_id', user?.id || '')
    .order('created_at', { ascending: false })
    .limit(5)

  const active =
    reservations?.filter((r) => r.status === 'active').length || 0
  const pending =
    reservations?.filter((r) => r.status === 'pending').length || 0
  const total = reservations?.length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {dict.dashboard?.overview || 'Account Overview'}
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          {locale === 'ar'
            ? 'تابع حالة حجوزاتك، العرابين المدفوعة، والمواعيد القادمة.'
            : 'Track your reservation status, active rentals, and upcoming pickups.'}
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title={dict.dashboard?.total_reservations || 'Total Bookings'}
          value={total}
          subtitle={locale === 'ar' ? 'حجوزات مسجلة' : 'Reservations'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />

        <StatsCard
          title={dict.dashboard?.active_rentals || 'Active Rentals'}
          value={active}
          subtitle={locale === 'ar' ? 'سيارات قيد الاستخدام' : 'On the road'}
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatsCard
          title={dict.dashboard?.pending_requests || 'Pending Confirmation'}
          value={pending}
          subtitle={locale === 'ar' ? 'بانتظار موافقة الوكالة' : 'Awaiting review'}
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Reservations Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
            {dict.reservations?.my_reservations || 'Recent Bookings'}
          </h2>
          <Link
            href={`/${lang}/dashboard/reservations`}
            className="apple-press inline-flex items-center text-xs font-semibold text-brand-500 hover:text-brand-600 px-3 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {locale === 'ar' ? 'عرض السجل الكامل' : 'View all'} &rarr;
          </Link>
        </div>

        <ReservationTable
          reservations={(reservations as unknown as Parameters<typeof ReservationTable>[0]['reservations']) || []}
          locale={locale}
          dictionary={dict}
          showCustomer={false}
        />
      </div>
    </div>
  )
}
