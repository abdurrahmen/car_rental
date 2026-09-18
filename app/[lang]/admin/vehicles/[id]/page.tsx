import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { VehicleForm } from '@/components/dashboard/VehicleForm'
import { FALLBACK_BRANCHES, FALLBACK_CATEGORIES, FALLBACK_VEHICLES } from '@/lib/data/fallback'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Language, Vehicle, VehicleCategory, Branch } from '@/types'

interface AdminEditVehiclePageProps {
  params: Promise<{ lang: string; id: string }>
}

export default async function AdminEditVehiclePage({
  params,
}: AdminEditVehiclePageProps) {
  const { lang, id } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  // Fetch vehicle by ID (or fallback)
  const { data: dbVehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  const vehicle = dbVehicle || FALLBACK_VEHICLES.find((v) => v.id === id)
  if (!vehicle) notFound()

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
          className="apple-press w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          &larr;
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {dict.common?.edit || 'Edit'} {vehicle.make} {vehicle.model}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-bold border border-neutral-200">
              {vehicle.plate_number}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isArabic
              ? 'تعديل بيانات المركبة، التسعير، الوكالة التابعة، ومواصفات المحرك.'
              : 'Modify vehicle technical specifications, pricing, branch allocation, and operational state.'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm">
        <VehicleForm
          vehicle={vehicle as Vehicle}
          categories={categories}
          branches={branches}
          locale={locale}
          dictionary={dict}
        />
      </div>
    </div>
  )
}
