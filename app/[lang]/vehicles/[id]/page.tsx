import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReservationForm } from '@/components/reservations/ReservationForm'
import { VehicleGallery } from '@/components/vehicles/VehicleGallery'
import { formatDZD } from '@/lib/utils/constants'
import { notFound } from 'next/navigation'
import type { Language, Branch, Vehicle, VehiclePhoto, VehicleCategory } from '@/types'
import { FALLBACK_VEHICLES, FALLBACK_BRANCHES } from '@/lib/data/fallback'
import { getAuthUser } from '@/lib/auth'

interface VehicleDetailPageProps {
  params: Promise<{ lang: string; id: string }>
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { lang, id } = await params
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()
  const authUser = await getAuthUser()

  const { data: dbVehicle } = await supabase
    .from('vehicles')
    .select(
      '*, branch:branches(*), category:vehicle_categories(*), photos:vehicle_photos(*)'
    )
    .eq('id', id)
    .single()

  let vehicle = dbVehicle as unknown as (Vehicle & {
    branch?: Branch
    category?: VehicleCategory
    photos?: VehiclePhoto[]
  }) | null

  if (!vehicle) {
    const fallback = FALLBACK_VEHICLES.find((v) => v.id === id)
    if (fallback) {
      vehicle = fallback
    } else {
      notFound()
    }
  }

  const { data: dbBranches } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)

  const branches = (dbBranches && dbBranches.length > 0) ? dbBranches : FALLBACK_BRANCHES

  const locale = lang as Language
  const catName =
    locale === 'ar'
      ? vehicle.category?.name_ar
      : locale === 'fr'
      ? vehicle.category?.name_fr
      : vehicle.category?.name_en

  const branchName =
    locale === 'ar'
      ? vehicle.branch?.name_ar
      : locale === 'fr'
      ? vehicle.branch?.name_fr
      : vehicle.branch?.name_en

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD] text-neutral-900">
      <Header locale={locale} dictionary={dict} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Apple Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-6">
          <Link
            href={`/${locale}/vehicles`}
            className="hover:text-neutral-900 transition-colors"
          >
            {dict.vehicles.browse_vehicles || 'Vehicles'}
          </Link>
          <span>/</span>
          {catName && (
            <>
              <span className="text-neutral-600">{catName}</span>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-900 font-semibold truncate">
            {vehicle.make} {vehicle.model}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery and Specs */}
          <div className="lg:col-span-7 space-y-6">
            <VehicleGallery
              photos={vehicle.photos || []}
              vehicleName={`${vehicle.make} ${vehicle.model}`}
            />

            {/* Spec Matrix Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
              <h2 className="text-base font-semibold tracking-tight text-neutral-900 mb-6">
                {dict.vehicles.vehicle_details || 'Technical Specifications'}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs">
                <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-black/[0.03]">
                  <span className="text-neutral-400 block mb-1">
                    {dict.vehicles.transmission || 'Transmission'}
                  </span>
                  <span className="font-semibold text-neutral-900 capitalize text-sm">
                    {vehicle.transmission === 'automatic'
                      ? dict.vehicles.automatic || 'Automatic'
                      : dict.vehicles.manual || 'Manual'}
                  </span>
                </div>

                <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-black/[0.03]">
                  <span className="text-neutral-400 block mb-1">
                    {dict.vehicles.seats || 'Seating Capacity'}
                  </span>
                  <span className="font-semibold text-neutral-900 text-sm">
                    {vehicle.seats} {locale === 'ar' ? 'مقاعد' : 'Seats'}
                  </span>
                </div>

                <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-black/[0.03]">
                  <span className="text-neutral-400 block mb-1">
                    {dict.vehicles.fuel_type || 'Fuel Type'}
                  </span>
                  <span className="font-semibold text-neutral-900 capitalize text-sm">
                    {vehicle.fuel_type}
                  </span>
                </div>

                <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-black/[0.03]">
                  <span className="text-neutral-400 block mb-1">
                    {dict.vehicles.category || 'Category'}
                  </span>
                  <span className="font-semibold text-neutral-900 text-sm">
                    {catName || 'Standard'}
                  </span>
                </div>

                <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-black/[0.03]">
                  <span className="text-neutral-400 block mb-1">
                    {dict.reservations.pickup_branch || 'Current Location'}
                  </span>
                  <span className="font-semibold text-neutral-900 text-sm">
                    {branchName || 'Main Hub'}
                  </span>
                </div>

                <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-black/[0.03]">
                  <span className="text-neutral-400 block mb-1">
                    {dict.vehicles.mileage_limit || 'Mileage Allowance'}
                  </span>
                  <span className="font-semibold text-neutral-900 text-sm">
                    {vehicle.mileage_limit_km
                      ? `${vehicle.mileage_limit_km} km/day`
                      : dict.vehicles.unlimited_mileage || 'Unlimited'}
                  </span>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="mt-6 p-4 rounded-2xl bg-brand-500/5 border border-brand-500/15 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-900 block">
                    {locale === 'ar' ? 'فحص رقمي وحماية كاملة' : 'Digital Handover & Verified Inspection'}
                  </span>
                  <span>
                    {locale === 'ar'
                      ? 'توثيق حالة المركبة والعداد بالصور قبل الانطلاق لتجنب أي خلاف عند الإرجاع.'
                      : 'High-resolution vehicle condition report prior to departure protects your deposit.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Apple Booking Card */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="mb-6 pb-6 border-b border-black/[0.05]">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-black/[0.04] text-neutral-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {vehicle.year}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {vehicle.plate_number}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  {vehicle.make} {vehicle.model}
                </h1>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-neutral-900 tracking-tight">
                    {formatDZD(vehicle.daily_rate, locale)}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    / {dict.vehicles.per_day || 'day'}
                  </span>
                </div>

                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-medium">
                  <span>{dict.reservations.deposit_required}:</span>
                  <span className="font-semibold">
                    {formatDZD(vehicle.deposit_amount, locale)}
                  </span>
                  <span className="text-[10px] text-amber-700/80">({locale === 'ar' ? 'مسترجع' : 'refundable'})</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold tracking-tight text-neutral-900 mb-4">
                  {dict.vehicles.book_now || 'Reserve This Vehicle'}
                </h3>
                <ReservationForm
                  vehicle={vehicle as Vehicle}
                  dailyRate={vehicle.daily_rate}
                  branches={(branches as Branch[]) || []}
                  dictionary={dict}
                  lang={locale}
                  isAuthenticated={Boolean(authUser)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
