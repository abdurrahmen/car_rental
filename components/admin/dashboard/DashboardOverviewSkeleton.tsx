import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Skeleton loader for Admin Dashboard Overview Page
 * Matches the 12-column bento grid layout structure
 */
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-5 md:space-y-6 animate-apple-fade-in">
      {/* Scope Bar Skeleton */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#142032]/80 backdrop-blur-md border border-black/[0.05] dark:border-white/5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-8 w-48 rounded-xl" />
        </div>
        <Skeleton className="hidden sm:block h-4 w-64 rounded-lg" />
      </div>

      {/* 12-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
        {/* Row 1: Hero (8 cols) + Action Center (4 cols, 2 rows) */}
        <div className="lg:col-span-8 order-1">
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0060C4] via-[#0071E3] to-[#1288E8] h-[280px] sm:h-[320px]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
                <Skeleton className="h-6 w-40 rounded-full bg-white/20" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-64 rounded-xl bg-white/25" />
                <Skeleton className="h-5 w-96 max-w-full rounded-lg bg-white/20" />
              </div>
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 space-y-3">
                <Skeleton className="h-4 w-48 rounded-lg bg-white/15" />
                <Skeleton className="h-3 w-full rounded-full bg-white/15" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-32 rounded bg-white/10" />
                  <Skeleton className="h-3 w-32 rounded bg-white/10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-40 rounded-full bg-white/30" />
                <Skeleton className="h-10 w-36 rounded-full bg-white/15" />
                <Skeleton className="h-10 w-28 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Center Skeleton (4 cols, 2 rows) */}
        <div className="lg:col-span-4 lg:row-span-2 order-2 lg:order-2">
          <div className="admin-card p-5 sm:p-6 h-full min-h-[400px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-neutral-50/90 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-2">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-48 rounded-lg" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Tiles (8 cols) */}
        <div className="lg:col-span-8 order-4 lg:order-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="admin-card p-4.5 space-y-3 border-s-4 border-s-neutral-300">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
                <div className="flex items-baseline justify-between">
                  <Skeleton className="h-8 w-20 rounded-xl" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline (5 cols) */}
        <div className="lg:col-span-5 order-3 lg:order-4">
          <div className="admin-card p-5 sm:p-6 h-full min-h-[400px] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-3 w-3 rounded-full shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Garage Wall (7 cols) */}
        <div className="lg:col-span-7 order-5 lg:order-5">
          <div className="admin-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <Skeleton className="h-4 w-40 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl bg-neutral-50/60 dark:bg-white/5 border border-black/[0.05] dark:border-white/10 p-3.5 space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <Skeleton className="h-4 w-32 rounded" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Panel (7 cols) */}
        <div className="lg:col-span-7 order-6 lg:order-6">
          <div className="admin-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <Skeleton className="h-4 w-36 rounded-lg" />
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-12 rounded-full" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/5 space-y-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-6 w-32 rounded-lg" />
                </div>
              ))}
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>

        {/* Branch Map (5 cols) */}
        <div className="lg:col-span-5 order-7 lg:order-7">
          <div className="admin-card p-5 sm:p-6 h-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          </div>
        </div>

        {/* Availability Lanes (12 cols full width) */}
        <div className="col-span-1 lg:col-span-12 order-8">
          <div className="admin-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <Skeleton className="h-4 w-48 rounded-lg" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-20 rounded" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-10 w-40 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sleeping Cars (6 cols) */}
        <div className="lg:col-span-6 order-9">
          <div className="admin-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/5 space-y-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed (6 cols) */}
        <div className="lg:col-span-6 order-10">
          <div className="admin-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
