import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { ReservationTable } from '@/components/dashboard/ReservationTable'
import type { Language, Reservation } from '@/types'

import { getAuthUser } from '@/lib/auth'

interface StaffOverviewPageProps {
  params: Promise<{ lang: string }>
}

export default async function StaffOverviewPage({
  params,
}: StaffOverviewPageProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const user = await getAuthUser()
  const branchId = user?.branch_id || '10000000-0000-0000-0000-000000000001'

  let query = supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), customer:profiles!customer_id(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (user?.role !== 'admin' && branchId) {
    query = query.eq('pickup_branch_id', branchId)
  }

  const { data: pending } = await query
  const isArabic = locale === 'ar'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {dict.staff?.pending_requests || 'Pending Customer Requests'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isArabic
              ? 'مراجعة طلبات الكراء، التأكد من توافر السيارة ورخصة السياقة قبل التأكيد.'
              : 'Review customer booking requests, verify driver licenses, and approve.'}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>{pending?.length || 0} {isArabic ? 'طلبات قيد الانتظار' : 'Pending Requests'}</span>
        </span>
      </div>

      <ReservationTable
        reservations={(pending as unknown as Reservation[]) || []}
        locale={locale}
        dictionary={dict}
        showCustomer={true}
        baseActionPath={`/${lang}/staff/reservations`}
      />
    </div>
  )
}
