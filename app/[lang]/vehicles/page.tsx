import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { VehicleFilters } from '@/components/vehicles/VehicleFilters'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Language, Vehicle, Branch, VehicleCategory } from '@/types'

interface VehiclesPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VehiclesPage({
  params,
  searchParams,
}: VehiclesPageProps) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  let query = supabase
    .from('vehicles')
    .select(
      '*, branch:branches(*), category:vehicle_categories(*), photos:vehicle_photos(*)'
    )
    .eq('status', 'available')

  if (resolvedSearchParams.category) {
    query = query.eq('category_id', resolvedSearchParams.category as string)
  }
  if (resolvedSearchParams.transmission) {
    query = query.eq(
      'transmission',
      resolvedSearchParams.transmission as string
    )
  }
  if (resolvedSearchParams.branch) {
    query = query.eq('branch_id', resolvedSearchParams.branch as string)
  }

  const { data: vehicles } = await query
  const { data: branches } = await supabase.from('branches').select('*')
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*')

  const locale = lang as Language
  const vehicleCount = vehicles?.length || 0

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD] text-neutral-900">
      <Header locale={locale} dictionary={dict} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] text-xs font-semibold text-neutral-600 mb-3">
            <span>{vehicleCount} {locale === 'ar' ? 'مركبة متاحة الآن' : 'available vehicles'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            {dict.vehicles.browse_vehicles}
          </h1>
          <p className="text-sm text-neutral-500 mt-1 max-w-xl">
            {locale === 'ar'
              ? 'تصفح أسطولنا من السيارات الاقتصادية، العائلية، رباعية الدفع والآلات المتخصصة في كافة ولايات الجزائر.'
              : 'Explore our modern fleet of sedans, 4x4 SUVs, utility vans, and heavy machinery across Algeria.'}
          </p>
        </div>

        {/* Catalog Layout */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-72 shrink-0">
            <VehicleFilters
              branches={(branches as Branch[]) || []}
              categories={(categories as VehicleCategory[]) || []}
              dictionary={dict}
              locale={locale}
            />
          </aside>

          {/* Vehicles Grid */}
          <div className="flex-1 w-full">
            {vehicles && vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {vehicles.map((vehicle, index) => (
                  <ScrollReveal key={vehicle.id} delay={index * 60}>
                    <VehicleCard
                      vehicle={vehicle as Vehicle}
                      locale={locale}
                      dictionary={dict}
                    />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.06] shadow-sm text-neutral-500">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  {dict.vehicles.no_vehicles_found}
                </p>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  {locale === 'ar'
                    ? 'جرب ضبط الفلاتر أو تغيير وكالة الاستلام لعرض خيارات أكثر.'
                    : 'Try changing your filter criteria or selecting another branch.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
