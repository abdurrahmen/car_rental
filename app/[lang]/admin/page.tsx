import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'

import { getAuthUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data/dashboard'
import {
  DailyBriefingHero,
  PulseKPIs,
  ActionCenter,
  TodayTimeline,
  FleetGarageWall,
  RevenuePanel,
  BranchMap,
  AvailabilityLanes,
  SleepingCars,
  ActivityFeed,
  ScopeBar,
  DashboardMotion,
} from '@/components/admin/dashboard'
import type { Language } from '@/types'

interface AdminPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ branch?: string }>
}

/**
 * DZRent Admin Home Dashboard:
 * Creative control room for an Algerian car rental enterprise.
 * Rebuilt as a high-density 12-column bento grid.
 */
export default async function AdminOverviewPage({
  params,
  searchParams,
}: AdminPageProps) {
  const { lang } = await params
  const { branch: queryBranchId } = await searchParams
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)

  // 1. Authenticated User & Role
  const user = await getAuthUser()
  const userRole = user?.role || 'admin'
  const userName = user?.full_name || 'Samir Belkacem'

  // Branch manager is scoped to their branch, superadmin can select branch
  const effectiveBranchId =
    userRole === 'branch_manager' ? user?.branch_id : queryBranchId

  // 2. Fetch Data from Data Access Layer
  const data = await getDashboardData(effectiveBranchId)

  return (
    <div className="space-y-5 md:space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 0. Scope Bar (Branch filter + time scope)                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <ScopeBar
        locale={locale}
        dictionary={dict}
        selectedBranchId={effectiveBranchId}
        userRole={userRole}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 12-Column Asymmetric Bento Grid                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DashboardMotion>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
        {/* Row 1 & 2: Daily Briefing Hero (8 cols) + Action Center (4 cols, 2 rows) */}
        <div className="lg:col-span-8 order-1">
          <DailyBriefingHero
            locale={locale}
            dictionary={dict}
            userName={userName}
            handoversToday={data.stats.handoversToday}
            returnsToday={data.stats.returnsToday}
            pendingCount={data.totalPendingCount}
          />
        </div>

        {/* T3: Action Center ("Needs you") — Priority 1 on mobile, 4-cols sidebar on desktop */}
        <div className="lg:col-span-4 lg:row-span-2 order-2 lg:order-2 h-full">
          <ActionCenter
            locale={locale}
            dictionary={dict}
            items={data.actionItems}
          />
        </div>

        {/* T2: Pulse KPIs (8 cols) */}
        <div className="lg:col-span-8 order-4 lg:order-3">
          <PulseKPIs
            locale={locale}
            dictionary={dict}
            stats={data.stats}
          />
        </div>

        {/* Row 3: Today's Movements Timeline (5 cols) + Garage Wall (7 cols) */}
        <div className="lg:col-span-5 order-3 lg:order-4 h-full">
          <TodayTimeline
            locale={locale}
            dictionary={dict}
            events={data.timelineEvents}
          />
        </div>

        <div className="lg:col-span-7 order-5 lg:order-5">
          <FleetGarageWall
            locale={locale}
            dictionary={dict}
            vehicles={data.garageVehicles}
          />
        </div>

        {/* Row 4: Revenue & Financials (7 cols) + Algeria Branch Map (5 cols) */}
        <div className="lg:col-span-7 order-6 lg:order-6">
          <RevenuePanel
            locale={locale}
            dictionary={dict}
            stats={data.stats}
          />
        </div>

        <div className="lg:col-span-5 order-7 lg:order-7 h-full">
          <BranchMap
            locale={locale}
            dictionary={dict}
          />
        </div>

        {/* Row 5: 14-Day Availability Matrix (12 cols full width) */}
        <div className="col-span-1 lg:col-span-12 order-8">
          <AvailabilityLanes
            locale={locale}
            dictionary={dict}
            vehicles={data.garageVehicles}
          />
        </div>

        {/* Row 6: Supporting Modules (Sleeping Cars & Live Activity Feed) */}
        <div className="lg:col-span-6 order-9">
          <SleepingCars
            locale={locale}
            dictionary={dict}
            vehicles={data.garageVehicles}
          />
        </div>

        <div className="lg:col-span-6 order-10">
          <ActivityFeed
            locale={locale}
            dictionary={dict}
          />
        </div>
      </div>
      </DashboardMotion>
    </div>
  )
}

