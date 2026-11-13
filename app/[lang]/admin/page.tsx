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
  DashboardMotion,
} from '@/components/admin/dashboard'
import { AdminOverviewWrapper } from '@/components/admin/AdminOverviewWrapper'
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
    <AdminOverviewWrapper
      locale={locale}
      dictionary={dict}
      selectedBranchId={effectiveBranchId}
      userRole={userRole}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 12-Column Bento Grid — Reordered by Urgency                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <DashboardMotion>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
        
        {/* PRIORITY 1: Action Center — "Needs attention" (4 cols, tall) */}
        <div className="lg:col-span-4 lg:row-span-2 order-1">
          <ActionCenter
            locale={locale}
            dictionary={dict}
            items={data.actionItems}
          />
        </div>

        {/* PRIORITY 2: Today's Timeline — "What's happening now" (5 cols) */}
        <div className="lg:col-span-5 order-2">
          <TodayTimeline
            locale={locale}
            dictionary={dict}
            events={data.timelineEvents}
          />
        </div>

        {/* PRIORITY 3: Slimmed Hero — Context & greeting (3 cols) */}
        <div className="lg:col-span-3 order-3">
          <DailyBriefingHero
            locale={locale}
            dictionary={dict}
            userName={userName}
            handoversToday={data.stats.handoversToday}
            returnsToday={data.stats.returnsToday}
            pendingCount={data.totalPendingCount}
          />
        </div>

        {/* PRIORITY 4: Pulse KPIs — At-a-glance metrics (8 cols) */}
        <div className="lg:col-span-8 order-4">
          <PulseKPIs
            locale={locale}
            dictionary={dict}
            stats={data.stats}
          />
        </div>

        {/* Row 3: Fleet Garage Wall (7 cols) */}
        <div className="lg:col-span-7 order-5">
          <FleetGarageWall
            locale={locale}
            dictionary={dict}
            vehicles={data.garageVehicles}
          />
        </div>

        {/* Row 3: Algeria Branch Map (5 cols) */}
        <div className="lg:col-span-5 order-6">
          <BranchMap
            locale={locale}
            dictionary={dict}
          />
        </div>

        {/* Row 4: Revenue & Financials (7 cols) */}
        <div className="lg:col-span-7 order-7">
          <RevenuePanel
            locale={locale}
            dictionary={dict}
            stats={data.stats}
          />
        </div>

        {/* Row 4: 14-Day Availability Matrix (5 cols) */}
        <div className="lg:col-span-5 order-8">
          <AvailabilityLanes
            locale={locale}
            dictionary={dict}
            vehicles={data.garageVehicles}
          />
        </div>

        {/* Row 5: Idle/Sleeping Cars (6 cols) */}
        <div className="lg:col-span-6 order-9">
          <SleepingCars
            locale={locale}
            dictionary={dict}
            vehicles={data.garageVehicles}
          />
        </div>

        {/* Row 5: Live Activity Feed (6 cols) */}
        <div className="lg:col-span-6 order-10">
          <ActivityFeed
            locale={locale}
            dictionary={dict}
          />
        </div>
      </div>
      </DashboardMotion>
    </AdminOverviewWrapper>
  )
}

