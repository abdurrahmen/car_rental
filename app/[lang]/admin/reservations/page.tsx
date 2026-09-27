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
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  let query = supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), customer:profiles!customer_id(*)')
    .order('created_at', { ascending: false })

  if (resolvedSearchParams.status) {
    query = query.eq('status', resolvedSearchParams.status as string)
  }

  const { data: reservations } = await query

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
