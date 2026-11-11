import React from 'react'
import { Skeleton, TableRowSkeleton } from '@/components/ui/Skeleton'

export default function DashboardReservationsLoading() {
  return (
    <div className="space-y-6 animate-apple-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52 rounded-xl" />
        <Skeleton className="h-3.5 w-72 rounded-md" />
      </div>
      <TableRowSkeleton rows={4} />
    </div>
  )
}
