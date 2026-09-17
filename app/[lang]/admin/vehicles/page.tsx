import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { VehicleStatusSelect } from '@/components/dashboard/VehicleStatusSelect'
import { VehicleDeleteButton } from '@/components/dashboard/VehicleDeleteButton'
import { formatDZD } from '@/lib/utils/constants'
import { FALLBACK_BRANCHES, FALLBACK_CATEGORIES, FALLBACK_VEHICLES } from '@/lib/data/fallback'
import Link from 'next/link'
import Image from 'next/image'
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
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  // 1. Fetch Branches & Categories for Filter Controls
  const { data: dbBranches } = await supabase.from('branches').select('*').order('name_en', { ascending: true })
  const branches = (dbBranches && dbBranches.length > 0 ? dbBranches : FALLBACK_BRANCHES) as Branch[]

  const { data: dbCategories } = await supabase.from('vehicle_categories').select('*')
  const categories = (dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES) as VehicleCategory[]

  // 2. Fetch Fleet
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

  const { data: dbVehicles } = await query
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {dict.admin?.fleet_management || 'National Fleet Management'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
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
          className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-brand-900 hover:bg-brand-400 shadow-sm transition-all min-h-[42px]"
        >
          <span className="text-base leading-none">+</span>
          <span>{dict.staff?.add_vehicle || 'Add Vehicle'}</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-neutral-50/80 dark:bg-neutral-800/40 p-4 rounded-3xl border border-black/[0.04] dark:border-white/[0.06] space-y-4">
        {/* Search & Selectors */}
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder={isArabic ? 'ابحث بالاسم، الموديل، أو رقم اللوحة...' : 'Search make, model, plate...'}
              className="w-full text-xs px-3.5 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.08] dark:border-white/[0.1] text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Branch Filter */}
          <select
            name="branch"
            defaultValue={selectedBranch || 'all'}
            className="text-xs px-3.5 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.08] dark:border-white/[0.1] text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-brand-500"
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
            className="text-xs px-3.5 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.08] dark:border-white/[0.1] text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === 'ar' ? c.name_ar : locale === 'fr' ? c.name_fr : c.name_en}
              </option>
            ))}
          </select>

          {/* Submit / Apply */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="apple-press flex-1 inline-flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors"
            >
              {dict.common?.search || 'Filter'}
            </button>
            {(searchQuery || selectedBranch || selectedCategory || selectedStatus) && (
              <Link
                href={`/${lang}/admin/vehicles`}
                className="apple-press inline-flex items-center justify-center text-xs font-semibold px-3 py-2.5 rounded-2xl bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 transition-colors"
                title={dict.vehicles?.clear_filters || 'Clear'}
              >
                ✕
              </Link>
            )}
          </div>
        </form>

        {/* Status Pill Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
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
                className={`apple-press text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Vehicle Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top: Photo & Info */}
                <div className="flex gap-4 items-start">
                  {/* Vehicle Thumbnail */}
                  <div className="w-24 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative shrink-0 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center">
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
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300/80 dark:border-neutral-700">
                        {v.plate_number}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium truncate">
                        {catName}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-1">
                      📍 {branchName}
                    </p>
                  </div>
                </div>

                {/* Middle: Specs */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                  <div className="text-center">
                    <span className="text-neutral-400 block text-[10px]">Transmission</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {v.transmission === 'automatic'
                        ? dict.vehicles?.automatic || 'Auto'
                        : dict.vehicles?.manual || 'Manual'}
                    </span>
                  </div>
                  <div className="text-center border-x border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-neutral-400 block text-[10px]">Capacity</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {v.seats} {dict.vehicles?.seats || 'Seats'}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-neutral-400 block text-[10px]">Fuel</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">
                      {v.fuel_type}
                    </span>
                  </div>
                </div>

                {/* Bottom: Pricing & Actions */}
                <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
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
                      className="apple-press px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
                      title="Preview public catalog page"
                    >
                      ↗
                    </Link>

                    <Link
                      href={`/${lang}/admin/vehicles/${v.id}`}
                      className="apple-press px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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
          <div className="col-span-full text-center py-16 bg-neutral-50 dark:bg-neutral-800/40 rounded-3xl border border-black/[0.04] dark:border-white/[0.06]">
            <span className="text-3xl mb-2 block">🚗</span>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {dict.vehicles?.no_vehicles_found || 'No vehicles found'}
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              {isArabic
                ? 'لم يتم العثور على أي سيارات تطابق معايير البحث الحالية.'
                : 'No vehicles match your current search filters. Try clearing filters or add a new vehicle.'}
            </p>
            <Link
              href={`/${lang}/admin/vehicles/new`}
              className="apple-press inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-brand-500 text-brand-900 hover:bg-brand-400 transition-colors"
            >
              + {dict.staff?.add_vehicle || 'Add New Vehicle'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
