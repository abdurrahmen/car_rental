'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { VehicleCategory, Branch, Language, Dictionary } from '@/types';

export interface VehicleFiltersProps {
  categories: VehicleCategory[];
  branches: Branch[];
  locale?: Language;
  lang?: Language;
  dictionary?: Dictionary;
  dict?: Dictionary;
}

export function VehicleFilters({
  categories,
  branches,
  locale,
  lang,
  dictionary,
  dict,
}: VehicleFiltersProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language;
  const effectiveDict = dictionary || dict;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const getCatName = (c: VehicleCategory) => {
    if (effectiveLocale === 'ar') return c.name_ar;
    if (effectiveLocale === 'fr') return c.name_fr;
    return c.name_en;
  };

  const getBranchName = (b: Branch) => {
    if (effectiveLocale === 'ar') return b.name_ar;
    if (effectiveLocale === 'fr') return b.name_fr;
    return b.name_en;
  };

  const categoryOptions = [
    {
      value: '',
      label: effectiveDict?.vehicles?.category || 'All Categories',
    },
    ...categories.map((c) => ({ value: c.id, label: getCatName(c) })),
  ];

  const branchOptions = [
    {
      value: '',
      label: effectiveDict?.reservations?.pickup_branch || 'All Branches',
    },
    ...branches.map((b) => ({ value: b.id, label: getBranchName(b) })),
  ];

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
  ];

  return (
    <div className="bg-card p-5 rounded-xl shadow-sm border border-neutral-200">
      <h2 className="font-heading font-bold text-lg mb-4 text-brand-900">
        {effectiveDict?.vehicles?.filters || 'Filters'}
      </h2>

      <div className="space-y-4">
        <Select
          label={effectiveDict?.vehicles?.category || 'Category'}
          options={categoryOptions}
          value={searchParams.get('category') || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        />

        <Select
          label={effectiveDict?.reservations?.pickup_branch || 'Branch'}
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

        <Button
          variant="outline"
          fullWidth
          onClick={() => router.push(pathname)}
          className="mt-4"
        >
          {effectiveDict?.vehicles?.clear_filters || 'Clear Filters'}
        </Button>
      </div>
    </div>
  );
}
