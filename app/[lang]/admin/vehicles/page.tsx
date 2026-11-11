import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { VehicleStatusSelect } from '@/components/dashboard/VehicleStatusSelect'
import { VehicleDeleteButton } from '@/components/dashboard/VehicleDeleteButton'
import { formatDZD } from '@/lib/utils/constants'
import { FALLBACK_BRANCHES, FALLBACK_CATEGORIES, FALLBACK_VEHICLES } from '@/lib/data/fallback'
import Link from 'next/link'
import Image from 'next/image'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionCard } from '@/components/admin'
import { X, MapPin } from 'lucide-react'
import type { Language, Vehicle, Branch, VehicleCategory, VehicleStatus } from '@/types'

interface AdminVehiclesPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminVehiclesPage({
  params,
  searchParams,
}: AdminVehiclesPageProps) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const locale = lang as Language
  const [dict, supabase] = await Promise.all([
    getDictionaryByLocale(lang),
    createClient(),
  ])

  // Build Fleet query
  let query = supabase
    .from('vehicles')
    .select('*, branch:branches(*), category:vehicle_categories(*), photos:vehicle_photos(*)')
    .order('created_at', { ascending: false })

  const selectedStatus = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined
  const selectedBranch = typeof resolvedSearchParams.branch === 'string' ? resolvedSearchParams.branch : undefined
  const selectedCategory = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined
  const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q.trim().toLowerCase() : ''

  if (selectedStatus && selectedStatus !== 'all') {
    query = query.eq('status', selectedStatus)
  }
  if (selectedBranch && selectedBranch !== 'all') {
    query = query.eq('branch_id', selectedBranch)
  }
  if (selectedCategory && selectedCategory !== 'all') {
    query = query.eq('category_id', selectedCategory)
  }

  // Fetch Branches, Categories, and Fleet concurrently
  const [
    { data: dbBranches },
    { data: dbCategories },
    { data: dbVehicles },
  ] = await Promise.all([
    supabase.from('branches').select('*').order('name_en', { ascending: true }),
    supabase.from('vehicle_categories').select('*'),
    query,
  ])

  const branches = (dbBranches && dbBranches.length > 0 ? dbBranches : FALLBACK_BRANCHES) as Branch[]
  const categories = (dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES) as VehicleCategory[]
  let vehicles = (dbVehicles && dbVehicles.length > 0 ? dbVehicles : FALLBACK_VEHICLES) as Vehicle[]

  // In-memory text filter for search query
  if (searchQuery) {
    vehicles = vehicles.filter(
      (v) =>
        v.make.toLowerCase().includes(searchQuery) ||
        v.model.toLowerCase().includes(searchQuery) ||
        v.plate_number.toLowerCase().includes(searchQuery)
    )
  }

  // Filter tab counts
  const totalCount = vehicles.length
  const isArabic = locale === 'ar'

  const statusLabels: Record<VehicleStatus, string> = {
    available: isArabic ? 'متاحة' : 'Available',
    rented: isArabic ? 'مؤجرة' : 'Rented',
    maintenance: isArabic ? 'صيانة' : 'Maintenance',
    retired: isArabic ? 'متقاعدة' : 'Retired',
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
              {dict.admin?.fleet_management || 'National Fleet Management'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
              {totalCount} {dict.nav?.vehicles || 'vehicles'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isArabic
              ? 'إدارة كاملة للمركبات، تغيير الحالة التشغيلية، والتحكم بالأسعار والعربون.'
              : 'End-to-end fleet operations: inventory, branch assignment, daily rates, and status management.'}
          </p>
        </div>

        <Link
          href={`/${lang}/admin/vehicles/new`}
          className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[40px] shrink-0"
        >
          <span className="text-sm leading-none">+</span>
          <span>{dict.staff?.add_vehicle || 'Add Vehicle'}</span>
        </Link>
      </div>

      {/* Filter Toolbar wrapped in SectionCard */}
      <SectionCard className="space-y-4">
        {/* Search & Selectors */}
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder={isArabic ? 'ابحث بالاسم، الموديل، أو رقم اللوحة...' : 'Search make, model, plate...'}
              className="w-full text-xs px-3.5 py-2.5 rounded-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-black/[0.06] text-neutral-800 outline-none focus:ring-2 focus:ring-brand-500 transition-all min-h-[40px]"
            />
          </div>

          {/* Branch Filter */}
          <select
            name="branch"
            defaultValue={selectedBranch || 'all'}
            className="text-xs px-3.5 py-2.5 rounded-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-black/[0.06] text-neutral-800 outline-none focus:ring-2 focus:ring-brand-500 transition-all min-h-[40px]"
          >
            <option value="all">{isArabic ? 'جميع الفروع والوكالات' : 'All Branches / Hubs'}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {locale === 'ar' ? b.name_ar : locale === 'fr' ? b.name_fr : b.name_en}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            name="category"
            defaultValue={selectedCategory || 'all'}
            className="text-xs px-3.5 py-2.5 rounded-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-black/[0.06] text-neutral-800 outline-none focus:ring-2 focus:ring-brand-500 transition-all min-h-[40px]"
          >
            <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === 'ar' ? c.name_ar : locale === 'fr' ? c.name_fr : c.name_en}
              </option>
            ))}
          </select>

          {/* Submit / Apply: Solid primary-blue pill */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="apple-press flex-1 inline-flex items-center justify-center text-xs font-semibold px-5 py-2.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors min-h-[40px]"
            >
              {dict.common?.search || 'Filter'}
            </button>
            {(searchQuery || selectedBranch || selectedCategory || selectedStatus) && (
              <Link
                href={`/${lang}/admin/vehicles`}
                className="apple-press inline-flex items-center justify-center text-xs font-semibold px-3 py-2.5 rounded-full bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300 transition-colors min-h-[40px]"
                title={dict.vehicles?.clear_filters || 'Clear'}
              >
                <X className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </form>

        {/* Status Pill Tabs: Segmented Control */}
        <div className="pt-2 border-t border-black/[0.04]">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-neutral-100/80 w-fit">
            {[
              { id: 'all', label: isArabic ? 'الكل' : 'All Fleet' },
              { id: 'available', label: statusLabels.available },
              { id: 'rented', label: statusLabels.rented },
              { id: 'maintenance', label: statusLabels.maintenance },
              { id: 'retired', label: statusLabels.retired },
            ].map((tab) => {
              const isActive = (selectedStatus || 'all') === tab.id
              return (
                <Link
                  key={tab.id}
                  href={`/${lang}/admin/vehicles?status=${tab.id}${
                    selectedBranch ? `&branch=${selectedBranch}` : ''
                  }${selectedCategory ? `&category=${selectedCategory}` : ''}${
                    searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
                  }`}
                  className={`apple-press text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </SectionCard>

      {/* Vehicle Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((v) => {
            const primaryPhoto = v.photos?.find((p) => p.is_primary) || v.photos?.[0]
            const branchName = v.branch
              ? locale === 'ar'
                ? v.branch.name_ar
                : locale === 'fr'
                ? v.branch.name_fr
                : v.branch.name_en
              : 'HQ / Shared'

            const catName = v.category
              ? locale === 'ar'
                ? v.category.name_ar
                : locale === 'fr'
                ? v.category.name_fr
                : v.category.name_en
              : 'Sedan'

            return (
              <div
                key={v.id}
                className="admin-card p-4 md:p-6 admin-card-hover flex flex-col justify-between space-y-4"
              >
                {/* Top: Photo & Info */}
                <div className="flex gap-4 items-start">
                  {/* Vehicle Thumbnail: rounded-xl */}
                  <div className="w-24 h-20 rounded-xl bg-neutral-100 overflow-hidden relative shrink-0 flex items-center justify-center">
                    {primaryPhoto?.storage_path ? (
                      <Image
                        src={primaryPhoto.storage_path}
                        alt={`${v.make} ${v.model}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-neutral-400 opacity-60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
                        <circle cx="7" cy="17" r="2" />
                        <path d="M9 17h6" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                    )}
                  </div>

                  {/* Identity & Badges */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 truncate">
                        {v.make} {v.model}{' '}
                        <span className="text-neutral-400 font-normal">({v.year})</span>
                      </h3>
                      {/* Status Quick-Change */}
                      <VehicleStatusSelect
                        vehicleId={v.id}
                        currentStatus={v.status}
                        labels={statusLabels}
                      />
                    </div>

                    {/* Algerian Plate Badge */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300/80">
                        {v.plate_number}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium truncate">
                        {catName}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{branchName}</span>
                    </p>
                  </div>
                </div>

                {/* Middle: Specs */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-neutral-50 rounded-xl text-[11px] text-neutral-600 font-medium">
                  <div className="text-center">
                    <span className="text-neutral-400 block text-[10px]">Transmission</span>
                    <span className="font-semibold text-neutral-800">
                      {v.transmission === 'automatic'
                        ? dict.vehicles?.automatic || 'Auto'
                        : dict.vehicles?.manual || 'Manual'}
                    </span>
                  </div>
                  <div className="text-center border-x border-black/[0.04]">
                    <span className="text-neutral-400 block text-[10px]">Capacity</span>
                    <span className="font-semibold text-neutral-800">
                      {v.seats} {dict.vehicles?.seats || 'Seats'}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-neutral-400 block text-[10px]">Fuel</span>
                    <span className="font-semibold text-neutral-800 capitalize">
                      {v.fuel_type}
                    </span>
                  </div>
                </div>

                {/* Bottom: Pricing & Actions */}
                <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-base font-extrabold text-brand-600">
                      {formatDZD(v.daily_rate, locale)}
                    </span>
                    <span className="text-[10px] text-neutral-400 ms-1">
                      /{dict.vehicles?.per_day || 'day'} • {formatDZD(v.deposit_amount, locale)} dep.
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/${lang}/vehicles/${v.id}`}
                      target="_blank"
                      className="apple-press px-2.5 py-1.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
                      title="Preview public catalog page"
                    >
                      ↗
                    </Link>

                    <Link
                      href={`/${lang}/admin/vehicles/${v.id}`}
                      className="apple-press px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
                    >
                      {dict.common?.edit || 'Edit'}
                    </Link>

                    <VehicleDeleteButton
                      vehicleId={v.id}
                      vehicleName={`${v.make} ${v.model} (${v.plate_number})`}
                      confirmTitle={dict.admin?.delete_confirm_title || 'Remove Vehicle from Fleet?'}
                      confirmMessage={
                        dict.admin?.delete_confirm_message ||
                        'Are you sure you want to remove this vehicle? If it has historical rental records, it will be safely retired.'
                      }
                      deleteLabel={dict.common?.delete || 'Delete'}
                      cancelLabel={dict.common?.cancel || 'Cancel'}
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon="car"
              title={dict.vehicles?.no_vehicles_found || 'No vehicles found'}
              description={
                isArabic
                  ? 'لم يتم العثور على أي سيارات تطابق معايير البحث الحالية.'
                  : 'No vehicles match your current search filters. Try clearing filters or add a new vehicle.'
              }
              action={{
                label: dict.vehicles?.clear_filters || 'Clear Filters',
                href: `/${lang}/admin/vehicles`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
