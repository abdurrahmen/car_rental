import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { ReservationTable } from '@/components/dashboard/ReservationTable'
import type { Language, Reservation } from '@/types'
import { getAuthUser } from '@/lib/auth'

interface StaffOverviewPageProps {
  params: Promise<{ lang: string }>
  searchParams?: Promise<{ status?: string }>
}

export default async function StaffOverviewPage({
  params,
  searchParams,
}: StaffOverviewPageProps) {
  const { lang } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const activeStatus = resolvedSearchParams.status || 'pending'
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const user = await getAuthUser()
  const branchId = user?.branch_id || '10000000-0000-0000-0000-000000000001'

  let query = supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), customer:profiles!customer_id(*)')
    .order('created_at', { ascending: false })

  if (activeStatus && activeStatus !== 'all') {
    query = query.eq('status', activeStatus)
  }

  if (user?.role !== 'admin' && branchId) {
    query = query.eq('pickup_branch_id', branchId)
  }

  const { data: reservations } = await query
  const isArabic = locale === 'ar'

  const statusTabs = [
    { key: 'all', label: isArabic ? 'الكل' : 'All' },
    { key: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending' },
    { key: 'confirmed', label: isArabic ? 'مؤكدة (طلب عربون)' : 'Confirmed' },
    { key: 'deposit_paid', label: isArabic ? 'العربون مدفوع' : 'Deposit Paid' },
    { key: 'active', label: isArabic ? 'على الطريق' : 'Active' },
    { key: 'completed', label: isArabic ? 'مكتملة' : 'Completed' },
    { key: 'cancelled', label: isArabic ? 'ملغاة' : 'Cancelled' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {dict.staff?.staff_dashboard || (isArabic ? 'إدارة حجوزات الوكالة' : 'Branch Reservations')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isArabic
              ? 'متابعة مراحل الحجز: تأكيد الطلبات، استلام العربون، محاضر التسليم والاسترجاع.'
              : 'Track booking lifecycle: confirmation, deposit collection, handover PV, and returns.'}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span>{reservations?.length || 0} {isArabic ? 'حجوزات' : 'Reservations'}</span>
        </span>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((tab) => {
          const isActive = activeStatus === tab.key
          return (
            <Link
              key={tab.key}
              href={`/${lang}/staff${tab.key === 'pending' ? '' : `?status=${tab.key}`}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
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
