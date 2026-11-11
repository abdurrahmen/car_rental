import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminBranchesLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-apple-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-3.5 w-72 rounded-md" />
      </div>

      {/* Branch Form Skeleton */}
      <div className="admin-card p-6 space-y-4">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>

      {/* Branches List Skeleton */}
      <div className="grid gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="admin-card p-6 flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
