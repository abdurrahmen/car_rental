import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function StaffVehiclesLoading() {
  return (
    <div className="space-y-6 animate-apple-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 bg-white rounded-2xl border border-black/[0.06] flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44 rounded-lg" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
