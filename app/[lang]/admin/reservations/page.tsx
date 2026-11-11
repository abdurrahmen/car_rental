import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { ReservationTable } from '@/components/dashboard/ReservationTable'
import type { Language, Reservation } from '@/types'

interface AdminReservationsPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminReservationsPage({
  params,
  searchParams,
}: AdminReservationsPageProps) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const locale = lang as Language
  const isArabic = locale === 'ar'
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const activeStatus = (resolvedSearchParams.status as string) || 'all'

  let query = supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), customer:profiles!customer_id(*)')
    .order('created_at', { ascending: false })

  if (activeStatus && activeStatus !== 'all') {
    query = query.eq('status', activeStatus)
  }

  const { data: reservations } = await query

  const statusFilters = [
    { key: 'all', label: isArabic ? 'الكل' : 'All' },
    { key: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending' },
    { key: 'confirmed', label: isArabic ? 'مؤكدة' : 'Confirmed' },
    { key: 'deposit_paid', label: isArabic ? 'العربون مدفوع' : 'Deposit Paid' },
    { key: 'active', label: isArabic ? 'على الطريق' : 'Active' },
    { key: 'completed', label: isArabic ? 'مكتملة' : 'Completed' },
    { key: 'cancelled', label: isArabic ? 'ملغاة' : 'Cancelled' },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            {dict.admin.all_reservations}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            System-wide visibility across all branches and customers.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full self-start sm:self-auto shadow-xs">
          <span>{reservations?.length || 0} {isArabic ? 'حجوزات' : 'Reservations'}</span>
        </span>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map((tab) => {
          const isActive = activeStatus === tab.key
          return (
            <Link
              key={tab.key}
              href={`/${lang}/admin/reservations${tab.key === 'all' ? '' : `?status=${tab.key}`}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-black/[0.04]'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <ReservationTable
        reservations={(reservations as unknown as Reservation[]) || []}
        locale={locale}
        dictionary={dict}
        showCustomer={true}
        baseActionPath={`/${lang}/staff/reservations`}
      />
    </div>
  )
}
