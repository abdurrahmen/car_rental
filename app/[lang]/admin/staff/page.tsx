import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { StaffForm } from '@/components/dashboard/StaffForm'
import { StaffCardItem } from '@/components/dashboard/StaffCardItem'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Language, Profile, Branch } from '@/types'

interface AdminStaffPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminStaffPage({ params }: AdminStaffPageProps) {
  const { lang } = await params
  const locale = lang as Language
  const [dict, supabase] = await Promise.all([
    getDictionaryByLocale(lang),
    createClient(),
  ])

  const [{ data: staff }, { data: branches }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, branch:branches(*)')
      .in('role', ['staff', 'branch_manager', 'admin'])
      .order('created_at', { ascending: false }),
    supabase.from('branches').select('*'),
  ])
  const branchList = (branches as Branch[]) || []

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            {dict.admin.manage_staff}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {locale === 'ar'
              ? 'إدارة حسابات الموظفين ومدراء الفروع وتعديل صلاحياتهم.'
              : 'Manage branch agents, managers, and system administrators.'}
          </p>
        </div>
      </div>

      <StaffForm
        branches={branchList}
        locale={locale}
      />

      {/* Staff List Grid */}
      <div className="grid gap-4 md:gap-6">
        {staff && staff.length > 0 ? (
          (staff as (Profile & { branch?: Branch })[]).map((s) => (
            <StaffCardItem
              key={s.id}
              staff={s}
              branches={branchList}
              locale={locale}
              currentRole="admin"
            />
          ))
        ) : (
          <EmptyState
            icon="users"
            title={locale === 'ar' ? 'لا يوجد موظفون' : 'No Staff Accounts Found'}
            description={
              locale === 'ar'
                ? 'قم بتسجيل حساب موظف أو مدير فرع جديد باستخدام النموذج أعلاه.'
                : 'Create a staff agent or branch manager account using the form above.'
            }
          />
        )}
      </div>
    </div>
  )
}
