import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionCard } from '@/components/admin'

export default function AdminVehiclesLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-apple-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-96 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <SectionCard className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Skeleton className="h-10 rounded-full" />
          <Skeleton className="h-10 rounded-full" />
          <Skeleton className="h-10 rounded-full" />
          <Skeleton className="h-10 rounded-full" />
        </div>
        <div className="pt-2 border-t border-black/[0.04] flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </SectionCard>

      {/* Vehicle Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="admin-card p-4 md:p-6 flex flex-col justify-between space-y-4"
          >
            <div className="flex gap-4 items-start">
              <Skeleton className="w-24 h-20 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
              <Skeleton className="h-6 w-28 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
