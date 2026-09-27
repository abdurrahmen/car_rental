import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { BranchForm } from '@/components/dashboard/BranchForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/admin'
import { MapPin, Phone } from 'lucide-react'
import type { Language, Branch } from '@/types'

interface AdminBranchesPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminBranchesPage({
  params,
}: AdminBranchesPageProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            {dict.admin.manage_branches}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Configure rental agency locations, cities, and contact details.
          </p>
        </div>
      </div>

      <BranchForm locale={locale} />

      {/* Branches Grid */}
      <div className="grid gap-4 md:gap-6">
        {branches && branches.length > 0 ? (
          (branches as Branch[]).map((b) => (
            <div
              key={b.id}
              className="admin-card p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 admin-card-hover"
            >
              <div>
                <h3 className="font-bold text-base text-neutral-900 tracking-tight">
                  {locale === 'ar'
                    ? b.name_ar
                    : locale === 'fr'
                    ? b.name_fr
                    : b.name_en}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {b.name_ar} · {b.name_fr} · {b.name_en}
                </p>
                <p className="text-xs text-neutral-600 mt-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{b.address}, {b.city}</span>
                </p>
                <p className="text-xs text-brand-600 font-medium mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>{b.phone}</span>
                </p>
              </div>

              <StatusBadge color="green" showDot className="self-start sm:self-center">
                Active Branch
              </StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState
            icon="building"
            title={locale === 'ar' ? 'لا توجد وكالات مسجلة' : 'No Branches Found'}
            description={
              locale === 'ar'
                ? 'قم بإضافة وكالتك الأولى باستخدام النموذج أعلاه لبدء استقبال الحجوزات.'
                : 'Add your first rental agency location using the form above to start receiving reservations.'
            }
          />
        )}
      </div>
    </div>
  )
}
