import React from 'react'
import { Skeleton, TableRowSkeleton } from '@/components/ui/Skeleton'

export default function AdminReservationsLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-apple-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-3.5 w-80 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Table Skeleton */}
      <TableRowSkeleton rows={6} />
    </div>
  )
}
