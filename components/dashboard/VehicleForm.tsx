'use client';

import React, { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createVehicle, updateVehicle } from '@/lib/actions/vehicles';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Vehicle, VehicleCategory, Branch, Language, Dictionary } from '@/types';

export interface VehicleFormProps {
  vehicle?: Vehicle | null;
  categories: VehicleCategory[];
  branches: Branch[];
  locale?: Language;
  lang?: Language;
  dictionary?: Dictionary;
  dict?: Dictionary;
}

export function VehicleForm({
  vehicle,
  categories,
  branches,
  locale,
  lang,
  dictionary,
  dict,
}: VehicleFormProps) {
  const router = useRouter();
  const effectiveLocale = (locale || lang || 'ar') as Language;
  const effectiveDict = dictionary || dict;

  const isEditing = Boolean(vehicle?.id);
  const actionToUse = isEditing ? updateVehicle : createVehicle;

  const [state, formAction, isPending] = useActionState(actionToUse, null);

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

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: getCatName(c),
  }));

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: getBranchName(b),
  }));

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {isEditing && <input type="hidden" name="id" value={vehicle?.id} />}

      {state?.error && (
        <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
          Vehicle saved successfully! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Make (Brand)"
          name="make"
          defaultValue={vehicle?.make || ''}
          placeholder="e.g. Renault, Dacia, Toyota"
          required
        />
        <Input
          label="Model"
          name="model"
          defaultValue={vehicle?.model || ''}
          placeholder="e.g. Symbol, Logan, Yaris"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label="Year"
          name="year"
          defaultValue={vehicle?.year || new Date().getFullYear()}
          min={1990}
          max={new Date().getFullYear() + 2}
          required
        />
        <Input
          label="License Plate Number"
          name="plate_number"
          defaultValue={vehicle?.plate_number || ''}
          placeholder="e.g. 01234-123-16"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={effectiveDict?.vehicles?.category || 'Category'}
          name="category_id"
          options={categoryOptions}
          placeholder={
            effectiveLocale === 'ar'
              ? 'اختر فئة المركبة...'
              : effectiveLocale === 'fr'
              ? 'Sélectionner une catégorie...'
              : 'Select a category...'
          }
          defaultValue={vehicle?.category_id || ''}
          required
        />
        <Select
          label={effectiveDict?.reservations?.pickup_branch || 'Branch'}
          name="branch_id"
          options={branchOptions}
          placeholder={
            effectiveLocale === 'ar'
              ? 'اختر الوكالة...'
              : effectiveLocale === 'fr'
              ? 'Sélectionner une agence...'
              : 'Select a branch...'
          }
          defaultValue={vehicle?.branch_id || ''}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label={effectiveDict?.vehicles?.transmission || 'Transmission'}
          name="transmission"
          defaultValue={vehicle?.transmission || 'manual'}
          options={[
            {
              value: 'manual',
              label: effectiveDict?.vehicles?.manual || 'Manual',
            },
            {
              value: 'automatic',
              label: effectiveDict?.vehicles?.automatic || 'Automatic',
            },
          ]}
        />
        <Input
          type="number"
          label={effectiveDict?.vehicles?.seats || 'Seats'}
          name="seats"
          defaultValue={vehicle?.seats || 5}
          min={1}
          max={50}
          required
        />
        <Select
          label={effectiveDict?.vehicles?.fuel_type || 'Fuel Type'}
          name="fuel_type"
          defaultValue={vehicle?.fuel_type || 'petrol'}
          options={[
            {
              value: 'petrol',
              label: effectiveDict?.vehicles?.petrol || 'Petrol',
            },
            {
              value: 'diesel',
              label: effectiveDict?.vehicles?.diesel || 'Diesel',
            },
            {
              value: 'hybrid',
              label: effectiveDict?.vehicles?.hybrid || 'Hybrid',
            },
            {
              value: 'electric',
              label: effectiveDict?.vehicles?.electric || 'Electric',
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="number"
          label={`${effectiveDict?.vehicles?.daily_rate || 'Daily Rate'} (DZD)`}
          name="daily_rate"
          defaultValue={vehicle?.daily_rate || 4000}
          min={1}
          required
        />
        <Input
          type="number"
          label={`${effectiveDict?.reservations?.deposit_required || 'Deposit'} (DZD)`}
          name="deposit_amount"
          defaultValue={vehicle?.deposit_amount || 5000}
          min={1}
          required
        />
        <Input
          type="number"
          label="Mileage Limit (km/day or empty)"
          name="mileage_limit_km"
          defaultValue={vehicle?.mileage_limit_km || ''}
          placeholder="Unlimited if empty"
        />
      </div>

      {isEditing && (
        <Select
          label="Vehicle Status"
          name="status"
          defaultValue={vehicle?.status || 'available'}
          options={[
            { value: 'available', label: 'Available' },
            { value: 'rented', label: 'Rented' },
            { value: 'maintenance', label: 'In Maintenance' },
            { value: 'retired', label: 'Retired' },
          ]}
        />
      )}

      <div className="flex gap-4 pt-4 border-t border-black/[0.06]">
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={isPending}
        >
          {isEditing
            ? effectiveDict?.common?.save || 'Save Changes'
            : effectiveDict?.staff?.add_vehicle || 'Add Vehicle'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {effectiveDict?.common?.cancel || 'Cancel'}
        </Button>
      </div>
    </form>
  );
}
