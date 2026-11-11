import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { BranchStaffForm } from '@/components/dashboard/BranchStaffForm'
import { StaffCardItem } from '@/components/dashboard/StaffCardItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { redirect } from 'next/navigation'
import type { Language, Profile, Branch } from '@/types'
import { getAuthUser } from '@/lib/auth'

interface BranchStaffPageProps {
  params: Promise<{ lang: string }>
}

export default async function BranchStaffPage({ params }: BranchStaffPageProps) {
  const { lang } = await params
  const locale = lang as Language
  const isArabic = locale === 'ar'
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const user = await getAuthUser()
  if (!user || !['branch_manager', 'admin'].includes(user.role)) {
    redirect(`/${lang}/staff`)
  }

  const branchId = user.branch_id || '10000000-0000-0000-0000-000000000001'

  // Fetch branch details
  const { data: branch } = await supabase
    .from('branches')
    .select('*')
    .eq('id', branchId)
    .single()

  const branchName = branch
    ? locale === 'ar'
      ? branch.name_ar
      : locale === 'fr'
      ? branch.name_fr
      : branch.name_en
    : 'Algiers Agency'

  // Fetch all staff members belonging to this branch
  const { data: branchStaff } = await supabase
    .from('profiles')
    .select('*, branch:branches(*)')
    .eq('branch_id', branchId)
    .in('role', ['staff', 'branch_manager'])
    .order('created_at', { ascending: false })

  const branches = branch ? [branch as Branch] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 block">
            {branchName}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            {dict.admin?.staff_management || (isArabic ? 'إدارة فريق عمل الوكالة' : 'Branch Staff & Agents')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isArabic
              ? 'إضافة أعضاء جدد لفريق وكالتك وتعديل بياناتهم ورتبهم.'
              : 'Add new staff members to your branch, edit contact info, and manage agent roles.'}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200/60 text-xs font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <span>{branchStaff?.length || 0} {isArabic ? 'موظفين' : 'Staff Members'}</span>
        </span>
      </div>

      <BranchStaffForm
        locale={locale}
        branchName={branchName}
      />

      {/* Staff Grid */}
      <div className="grid gap-4">
        {branchStaff && branchStaff.length > 0 ? (
          (branchStaff as (Profile & { branch?: Branch })[]).map((s) => (
            <StaffCardItem
              key={s.id}
              staff={s}
              branches={branches}
              locale={locale}
              currentRole={user.role}
            />
          ))
        ) : (
          <EmptyState
            icon="users"
            title={isArabic ? 'لا يوجد موظفون إضافيون' : 'No Additional Staff Found'}
            description={
              isArabic
                ? 'استخدم النموذج أعلاه لإضافة أعضاء جدد لطاقم هذه الوكالة.'
                : 'Use the button above to onboard agents to your branch.'
            }
          />
        )}
      </div>
    </div>
  )
}
