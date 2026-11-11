import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminStaffLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-apple-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52 rounded-xl" />
        <Skeleton className="h-3.5 w-80 rounded-md" />
      </div>

      {/* Staff Form Skeleton */}
      <div className="admin-card p-6 space-y-4">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>

      {/* Staff Cards Skeleton */}
      <div className="grid gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="admin-card p-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
