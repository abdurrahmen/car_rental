'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { VehicleCategory, Branch, Language, Dictionary } from '@/types'

export interface VehicleFiltersProps {
  categories: VehicleCategory[]
  branches: Branch[]
  locale?: Language
  lang?: Language
  dictionary?: Dictionary
  dict?: Dictionary
}

/**
 * Apple-style Filter Panel with rounded-3xl borders,
 * clear filter actions, and smooth responsive layout.
 */
export function VehicleFilters({
  categories,
  branches,
  locale,
  lang,
  dictionary,
  dict,
}: VehicleFiltersProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language
  const effectiveDict = dictionary || dict

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const getCatName = (c: VehicleCategory) => {
    if (effectiveLocale === 'ar') return c.name_ar
    if (effectiveLocale === 'fr') return c.name_fr
    return c.name_en
  }

  const getBranchName = (b: Branch) => {
    if (effectiveLocale === 'ar') return b.name_ar
    if (effectiveLocale === 'fr') return b.name_fr
    return b.name_en
  }

  const categoryOptions = [
    {
      value: '',
      label: effectiveDict?.vehicles?.category || 'All Categories',
    },
    ...categories.map((c) => ({ value: c.id, label: getCatName(c) })),
  ]

  const branchOptions = [
    {
      value: '',
      label: effectiveDict?.reservations?.pickup_branch || 'All Branches',
    },
    ...branches.map((b) => ({ value: b.id, label: getBranchName(b) })),
  ]

  const transmissionOptions = [
    {
      value: '',
      label: effectiveDict?.vehicles?.transmission || 'All Transmissions',
    },
    {
      value: 'automatic',
      label: effectiveDict?.vehicles?.automatic || 'Automatic',
    },
    {
      value: 'manual',
      label: effectiveDict?.vehicles?.manual || 'Manual',
    },
  ]

  const hasActiveFilters =
    Boolean(searchParams.get('category')) ||
    Boolean(searchParams.get('branch')) ||
    Boolean(searchParams.get('transmission'))

  return (
    <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-semibold text-base text-neutral-900 tracking-tight">
          {effectiveDict?.vehicles?.filters || 'Refine Search'}
        </h2>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        )}
      </div>

      <div className="space-y-4">
        <Select
          label={effectiveDict?.vehicles?.category || 'Category'}
          options={categoryOptions}
          value={searchParams.get('category') || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        />

        <Select
          label={effectiveDict?.reservations?.pickup_branch || 'Pickup Branch'}
          options={branchOptions}
          value={searchParams.get('branch') || ''}
          onChange={(e) => handleFilterChange('branch', e.target.value)}
        />

        <Select
          label={effectiveDict?.vehicles?.transmission || 'Transmission'}
          options={transmissionOptions}
          value={searchParams.get('transmission') || ''}
          onChange={(e) => handleFilterChange('transmission', e.target.value)}
        />

        {hasActiveFilters && (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push(pathname)}
            className="mt-2 text-xs"
          >
            {effectiveDict?.vehicles?.clear_filters || 'Reset Filters'}
          </Button>
        )}
      </div>
    </div>
  )
}
