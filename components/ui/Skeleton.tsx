import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

/**
 * Apple-style Shimmer Skeleton primitive.
 * Symmetrical gentle opacity pulse, fully direction-neutral for RTL & LTR.
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-neutral-200/70 ${className}`}
      {...props}
    />
  )
}

/**
 * 3-Card KPI Stats Grid Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-6 bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>
      ))}
    </div>
  )
}

/**
 * Vehicle Card Showcase Skeleton
 */
export function VehicleCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-full">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.04]">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Table Row Placeholder Skeleton
 */
export function TableRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] divide-y divide-black/[0.04] overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}
