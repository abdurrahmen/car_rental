import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { VehicleFilters } from '@/components/vehicles/VehicleFilters'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Language, Vehicle, Branch, VehicleCategory } from '@/types'
import {
  FALLBACK_VEHICLES,
  FALLBACK_BRANCHES,
  FALLBACK_CATEGORIES,
  type FallbackVehicleWithRelations,
} from '@/lib/data/fallback'

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

  const { data: dbVehicles } = await query
  const { data: dbBranches } = await supabase.from('branches').select('*')
  const { data: dbCategories } = await supabase
    .from('vehicle_categories')
    .select('*')

  // Use database data if populated; otherwise use fallback demo data with active filters applied
  let vehicles = (dbVehicles && dbVehicles.length > 0) ? (dbVehicles as unknown as FallbackVehicleWithRelations[]) : null

  if (!vehicles) {
    let filteredFallback = [...FALLBACK_VEHICLES]
    if (resolvedSearchParams.category) {
      filteredFallback = filteredFallback.filter(
        (v) => v.category_id === resolvedSearchParams.category
      )
    }
    if (resolvedSearchParams.transmission) {
      filteredFallback = filteredFallback.filter(
        (v) => v.transmission === resolvedSearchParams.transmission
      )
    }
    if (resolvedSearchParams.branch) {
      filteredFallback = filteredFallback.filter(
        (v) => v.branch_id === resolvedSearchParams.branch
      )
    }
    vehicles = filteredFallback
  }

  const branches = (dbBranches && dbBranches.length > 0) ? dbBranches : FALLBACK_BRANCHES
  const categories = (dbCategories && dbCategories.length > 0) ? dbCategories : FALLBACK_CATEGORIES

  const locale = lang as Language
  const vehicleCount = vehicles.length

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <EmptyState
                icon="car"
                title={dict.vehicles.no_vehicles_found || 'No vehicles found'}
                description={
                  locale === 'ar'
                    ? 'جرب ضبط معايير الفلترة أو مسح التحديد لإظهار المزيد من السيارات.'
                    : 'Try adjusting your filters or resetting the search to see more available cars.'
                }
                action={{
                  label: dict.vehicles?.clear_filters || 'Reset Filters',
                  href: `/${locale}/vehicles`,
                }}
              />
            )}
          </div>
        </div>
      </main>

      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
