import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { getAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { WalkInReservationForm } from '@/components/reservations/WalkInReservationForm'
import type { Language } from '@/types'
import { redirect } from 'next/navigation'

interface NewReservationPageProps {
  params: Promise<{ lang: string }>
}

export default async function StaffNewReservationPage({
  params,
}: NewReservationPageProps) {
  const { lang } = await params
  const locale = lang as Language

  // Check authentication
  const user = await getAuthUser()
  if (!user || !['staff', 'branch_manager'].includes(user.role)) {
    redirect(`/${lang}/login`)
  }

  const supabase = await createClient()

  // Fetch customers
  const { data: customers } = await supabase
    .from('profiles')
    .select('id, full_name, phone, email:id')
    .eq('role', 'customer')
    .order('full_name')

  // Fetch vehicles (staff only see their branch)
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      id,
      make,
      model,
      year,
      plate_number,
      daily_rate,
      deposit_amount,
      status,
      branch_id
    `)
    .eq('status', 'available')
    .eq('branch_id', user.branch_id || '')
    .order('make')

  // Fetch branches
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name_ar, name_fr, name_en')
    .eq('is_active', true)
    .order('name_fr')

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4">
      <WalkInReservationForm
        locale={locale}
        customers={customers || []}
        vehicles={vehicles || []}
        branches={branches || []}
        userRole={user.role}
        userBranchId={user.branch_id}
      />
    </div>
  )
}
