import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { VehicleForm } from '@/components/dashboard/VehicleForm'
import { SectionCard } from '@/components/admin'
import { FALLBACK_BRANCHES, FALLBACK_CATEGORIES } from '@/lib/data/fallback'
import Link from 'next/link'
import type { Language, VehicleCategory, Branch } from '@/types'

interface AdminNewVehiclePageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminNewVehiclePage({
  params,
}: AdminNewVehiclePageProps) {
  const { lang } = await params
  const locale = lang as Language
  const [dict, supabase] = await Promise.all([
    getDictionaryByLocale(lang),
    createClient(),
  ])

  const [{ data: dbCategories }, { data: dbBranches }] = await Promise.all([
    supabase.from('vehicle_categories').select('*'),
    supabase.from('branches').select('*').order('name_en', { ascending: true }),
  ])
  const categories = (dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES) as VehicleCategory[]
  const branches = (dbBranches && dbBranches.length > 0 ? dbBranches : FALLBACK_BRANCHES) as Branch[]

  const isArabic = locale === 'ar'

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/admin/vehicles`}
          className="apple-press w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          title="Back to fleet"
        >
          &larr;
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            {dict.staff?.add_vehicle || 'Add Vehicle to National Fleet'}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isArabic
              ? 'تسجيل مركبة جديدة، تحديد الوكالة الحاضنة، وسعر الكراء اليومي والعربون.'
              : 'Register a new vehicle with branch assignment, DZD daily rate, and deposit amount.'}
          </p>
        </div>
      </div>

      <SectionCard>
        <VehicleForm
          categories={categories}
          branches={branches}
          locale={locale}
          dictionary={dict}
        />
      </SectionCard>
    </div>
  )
}
