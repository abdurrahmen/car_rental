import React from 'react'
import { Skeleton, VehicleCardSkeleton } from '@/components/ui/Skeleton'

export default function VehiclesLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD] text-neutral-900">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Page Header Skeleton */}
        <div className="mb-10 space-y-3">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>

        {/* Catalog Layout */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Filters Sidebar Skeleton */}
          <aside className="w-full md:w-72 shrink-0 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-sm space-y-4">
              <Skeleton className="h-5 w-28 rounded-lg" />
              <div className="space-y-3 pt-2">
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          </aside>

          {/* Vehicles Grid Skeleton */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
