import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { VehicleForm } from '@/components/dashboard/VehicleForm'
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
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const { data: dbCategories } = await supabase.from('vehicle_categories').select('*')
  const categories = (dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES) as VehicleCategory[]

  const { data: dbBranches } = await supabase.from('branches').select('*').order('name_en', { ascending: true })
  const branches = (dbBranches && dbBranches.length > 0 ? dbBranches : FALLBACK_BRANCHES) as Branch[]

  const isArabic = locale === 'ar'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/admin/vehicles`}
          className="apple-press w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          &larr;
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {dict.staff?.add_vehicle || 'Add Vehicle to National Fleet'}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isArabic
              ? 'تسجيل مركبة جديدة، تحديد الوكالة الحاضنة، وسعر الكراء اليومي والعربون.'
              : 'Register a new vehicle with branch assignment, DZD daily rate, and deposit amount.'}
          </p>
        </div>
      </div>

      <div className="bg-neutral-50/50 dark:bg-neutral-800/30 p-6 sm:p-8 rounded-3xl border border-black/[0.04] dark:border-white/[0.06]">
        <VehicleForm
          categories={categories}
          branches={branches}
          locale={locale}
          dictionary={dict}
        />
      </div>
    </div>
  )
}
