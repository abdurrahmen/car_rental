import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function VehicleDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD] text-neutral-900">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>

        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Two-column layout: Gallery left, Form right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Gallery Skeleton */}
            <div className="aspect-[16/10] w-full rounded-3xl bg-neutral-200/70 animate-pulse" />
            {/* Specs Grid Skeleton */}
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Booking Card Skeleton */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm space-y-6">
              <div className="flex items-baseline justify-between">
                <Skeleton className="h-8 w-32 rounded-xl" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
              <div className="space-y-4 pt-2">
                <Skeleton className="h-11 w-full rounded-2xl" />
                <Skeleton className="h-11 w-full rounded-2xl" />
                <Skeleton className="h-11 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
