import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { StaffForm } from '@/components/dashboard/StaffForm'
import { StatusBadge, Avatar } from '@/components/admin'
import { EmptyState } from '@/components/ui/EmptyState'
import { Phone, Building } from 'lucide-react'
import type { Language, Profile, Branch } from '@/types'

interface AdminStaffPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminStaffPage({ params }: AdminStaffPageProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const { data: staff } = await supabase
    .from('profiles')
    .select('*, branch:branches(*)')
    .in('role', ['staff', 'branch_manager', 'admin'])
    .order('created_at', { ascending: false })

  const { data: branches } = await supabase.from('branches').select('*')

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            {dict.admin.manage_staff}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage branch agents, managers, and system administrators.
          </p>
        </div>
      </div>

      <StaffForm
        branches={(branches as Branch[]) || []}
        locale={locale}
      />

      {/* Staff List Grid */}
      <div className="grid gap-4 md:gap-6">
        {staff && staff.length > 0 ? (
          (staff as (Profile & { branch?: Branch })[]).map((s) => {
            const roleColor =
              s.role === 'admin'
                ? 'blue'
                : s.role === 'branch_manager'
                ? 'amber'
                : 'green'

            const roleLabel =
              s.role === 'admin'
                ? 'Superadmin'
                : s.role === 'branch_manager'
                ? 'Branch Manager'
                : 'Staff Agent'

            const branchLabel = s.branch
              ? locale === 'ar'
                ? s.branch.name_ar
                : locale === 'fr'
                ? s.branch.name_fr
                : s.branch.name_en
              : 'Headquarters / All Branches'

            return (
              <div
                key={s.id}
                className="admin-card p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 admin-card-hover"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <Avatar name={s.full_name || 'Staff'} size="lg" />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-base text-neutral-900 tracking-tight">
                        {s.full_name || 'Staff Member'}
                      </h3>
                      <StatusBadge color={roleColor} showDot>
                        {roleLabel}
                      </StatusBadge>
                    </div>

                    <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{s.phone || 'No phone registered'}</span>
                    </p>

                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{branchLabel}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] text-neutral-400 font-mono px-2 py-1 rounded-md bg-neutral-100">
                    #{s.id.substring(0, 8)}
                  </span>
                </div>
              </div>
            )
          })
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
