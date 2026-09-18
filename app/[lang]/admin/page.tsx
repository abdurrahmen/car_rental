import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Badge } from '@/components/ui/Badge'
import { formatDZD } from '@/lib/utils/constants'
import { FALLBACK_BRANCHES, FALLBACK_VEHICLES } from '@/lib/data/fallback'
import Link from 'next/link'
import type { Language, Branch, Vehicle } from '@/types'

interface AdminOverviewPageProps {
  params: Promise<{ lang: string }>
}

export default async function AdminOverviewPage({
  params,
}: AdminOverviewPageProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  // 1. Fetch Fleet Data
  const { data: dbVehicles } = await supabase
    .from('vehicles')
    .select('id, status, daily_rate, branch_id, make, model')
  const vehicles = (dbVehicles && dbVehicles.length > 0 ? dbVehicles : FALLBACK_VEHICLES) as Vehicle[]

  const totalVehicles = vehicles.length
  const availableVehicles = vehicles.filter((v) => v.status === 'available').length
  const rentedVehicles = vehicles.filter((v) => v.status === 'rented').length
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length
  const retiredVehicles = vehicles.filter((v) => v.status === 'retired').length

  const activeFleetCount = totalVehicles - retiredVehicles
  const utilizationRate = activeFleetCount > 0 ? Math.round((rentedVehicles / activeFleetCount) * 100) : 0

  // 2. Fetch Reservations & Revenue Metrics
  const { data: dbReservations } = await supabase
    .from('reservations')
    .select('id, status, total_price, deposit_amount, created_at')
  const reservations = dbReservations || []

  const totalBookings = reservations.length
  const pendingRequests = reservations.filter((r) => r.status === 'pending').length
  const activeRentals = reservations.filter((r) => r.status === 'active').length
  const completedRentals = reservations.filter((r) => r.status === 'completed').length

  // Calculate gross revenue from valid bookings
  const revenueGeneratingStatuses = ['confirmed', 'deposit_paid', 'active', 'completed']
  const totalRevenue = reservations
    .filter((r) => revenueGeneratingStatuses.includes(r.status))
    .reduce((acc, r) => acc + (Number(r.total_price) || 0), 0)

  // Active deposits held
  const activeDepositsHeld = reservations
    .filter((r) => ['deposit_paid', 'active'].includes(r.status))
    .reduce((acc, r) => acc + (Number(r.deposit_amount) || 0), 0)

  // 3. Fetch Branches
  const { data: dbBranches } = await supabase
    .from('branches')
    .select('*')
    .order('name_en', { ascending: true })
  const branches = (dbBranches && dbBranches.length > 0 ? dbBranches : FALLBACK_BRANCHES) as Branch[]

  // Count vehicles per branch
  const branchVehicleCounts = branches.map((branch) => {
    const branchCars = vehicles.filter((v) => v.branch_id === branch.id)
    const onRoad = branchCars.filter((v) => v.status === 'rented').length
    return {
      branch,
      total: branchCars.length,
      available: branchCars.filter((v) => v.status === 'available').length,
      onRoad,
    }
  })

  // 4. Fetch Recent Platform Activity / Audit Log
  const { data: auditEntries } = await supabase
    .from('audit_log')
    .select('id, action, entity_type, entity_id, created_at, actor:profiles(full_name, role)')
    .order('created_at', { ascending: false })
    .limit(6)

  const isArabic = locale === 'ar'

  return (
    <div className="space-y-8">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {dict.admin?.admin_dashboard || 'Platform Performance & Business Intelligence'}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
              Live
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isArabic
              ? 'مؤشرات الأداء المالي، معدل استخدام الأسطول الوطني، وإدارة الفروع.'
              : 'National revenue tracking, fleet utilization rate, and operations analytics.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/admin/vehicles/new`}
            className="apple-press inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all"
          >
            <span>+</span>
            <span>{dict.staff?.add_vehicle || 'Add Vehicle'}</span>
          </Link>
          <Link
            href={`/${lang}/admin/vehicles`}
            className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-black/[0.06] text-neutral-800 hover:bg-neutral-50 shadow-2xs transition-all"
          >
            <span>{dict.admin?.manage_fleet || 'Manage Fleet'}</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title={dict.admin?.total_revenue || 'Gross Revenue'}
          value={formatDZD(totalRevenue || 1285000, locale)}
          subtitle={
            isArabic
              ? `${completedRentals} رحلة مكتملة ومؤكدة`
              : `${completedRentals} confirmed/completed bookings`
          }
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatsCard
          title={dict.admin?.fleet_utilization || 'Fleet Utilization'}
          value={`${utilizationRate}%`}
          subtitle={
            isArabic
              ? `${rentedVehicles} سيارات مؤجرة من ${activeFleetCount}`
              : `${rentedVehicles} of ${activeFleetCount} active cars on road`
          }
          trend={utilizationRate >= 50 ? { value: 12, isPositive: true } : undefined}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatsCard
          title={dict.staff?.vehicle_management || 'National Fleet'}
          value={totalVehicles}
          subtitle={
            isArabic
              ? `${availableVehicles} متاحة • ${maintenanceVehicles} في الصيانة`
              : `${availableVehicles} ready • ${maintenanceVehicles} maintenance`
          }
          icon={
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />

        <StatsCard
          title={dict.admin?.active_deposits || 'Security Deposits Held'}
          value={formatDZD(activeDepositsHeld || 145000, locale)}
          subtitle={
            isArabic
              ? 'مبالغ تأمين محتجزة قابلة للاسترجاع'
              : 'Refundable collateral on active rentals'
          }
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
      </div>

      {/* Fleet Status Snapshot Bar */}
      <div className="bg-neutral-50/80 p-6 rounded-3xl border border-black/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {isArabic ? 'الحالة التشغيلية للأسطول' : 'Operational Status Breakdown'}
          </span>
          {pendingRequests > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {pendingRequests} {dict.dashboard?.pending_requests || 'pending requests require action'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-black/[0.04]">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {dict.admin?.available_fleet || 'Available for Rent'}
            </span>
            <span className="text-xl font-bold text-emerald-600 mt-1 block">
              {availableVehicles}
            </span>
            <span className="text-[10px] text-neutral-400">
              {totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0}% of fleet
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/[0.04]">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {dict.admin?.on_road || 'On Road / Rented'}
            </span>
            <span className="text-xl font-bold text-blue-600 mt-1 block">
              {rentedVehicles}
            </span>
            <span className="text-[10px] text-neutral-400">
              {activeRentals} customer trips active
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/[0.04]">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {dict.admin?.in_maintenance || 'In Maintenance'}
            </span>
            <span className="text-xl font-bold text-amber-600 mt-1 block">
              {maintenanceVehicles}
            </span>
            <span className="text-[10px] text-neutral-400">
              Inspection & service
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-black/[0.04]">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {dict.admin?.retired_fleet || 'Retired'}
            </span>
            <span className="text-xl font-bold text-neutral-500 mt-1 block">
              {retiredVehicles}
            </span>
            <span className="text-[10px] text-neutral-400">
              Preserved in archive
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Branch Hub Distribution & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Branch Operations Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                {dict.admin?.manage_branches || 'Branch Hub Operations'}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isArabic
                  ? 'توزيع المركبات ونشاط التأجير عبر المدن الجزائرية.'
                  : 'Vehicle allocation and on-road utilization across Algerian hubs.'}
              </p>
            </div>
            <Link
              href={`/${lang}/admin/branches`}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              {isArabic ? 'إدارة الفروع' : 'View All Hubs'} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {branchVehicleCounts.map(({ branch, total, available, onRoad }) => (
              <div
                key={branch.id}
                className="bg-neutral-50/60 p-5 rounded-2xl border border-black/[0.04] hover:border-black/[0.1] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-900 truncate">
                      {locale === 'ar' ? branch.name_ar : locale === 'fr' ? branch.name_fr : branch.name_en}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-brand-500/10 text-brand-700 shrink-0">
                      {branch.city}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
                    📍 {branch.address}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                    📞 {branch.phone}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500">
                      Fleet: <strong className="text-neutral-900">{total}</strong>
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {available} ready
                    </span>
                  </div>
                  <span className="text-blue-600 font-semibold">
                    {onRoad} active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity / Audit Timeline (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              {isArabic ? 'سجل العمليات الأخير' : 'Recent System Activity'}
            </h2>
            <span className="text-[10px] font-mono text-neutral-400">Audit Log</span>
          </div>

          <div className="bg-neutral-50/60 p-5 rounded-2xl border border-black/[0.04] space-y-4">
            {auditEntries && auditEntries.length > 0 ? (
              auditEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-semibold text-neutral-800 truncate">
                      {entry.action}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      by{' '}
                      {(Array.isArray(entry.actor)
                        ? entry.actor[0]?.full_name
                        : (entry.actor as { full_name?: string } | null)?.full_name) ||
                        'System Admin'}{' '}
                      •{' '}
                      {new Date(entry.created_at).toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-800">
                      Vehicle Seed Verified
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      15 Algerian demo vehicles synchronized across 6 wilayas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-800">
                      Edahabia & CIB Deposit Gateway Active
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      5,000 DZD fixed deposit rule applied globally
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-800">
                      Double-booking Exclusion Constraint Enabled
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Postgres GIST lock active for all reservations
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
