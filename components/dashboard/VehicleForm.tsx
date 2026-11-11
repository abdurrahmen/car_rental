'use client';

import React, { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createVehicle, updateVehicle } from '@/lib/actions/vehicles';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatDZD } from '@/lib/utils/constants';
import { Sparkles, MapPin, ShieldCheck, Gauge, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import type { Vehicle, VehicleCategory, Branch, Language, Dictionary, VehicleStatus, VehiclePhoto } from '@/types';

export interface VehicleFormProps {
  vehicle?: (Vehicle & { photos?: VehiclePhoto[]; category?: VehicleCategory }) | null;
  categories: VehicleCategory[];
  branches: Branch[];
  locale?: Language;
  lang?: Language;
  dictionary?: Dictionary;
  dict?: Dictionary;
}

// Smart photo matching for popular Algerian fleet models
function getSmartPhotoUrl(make: string, model: string): string {
  const query = `${make} ${model}`.toLowerCase().trim();
  if (!query) return '';
  if (query.includes('clio') || query.includes('renault')) {
    return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&q=80';
  }
  if (query.includes('sandero') || query.includes('dacia') || query.includes('logan') || query.includes('duster') || query.includes('stepway')) {
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80';
  }
  if (query.includes('208') || query.includes('peugeot') || query.includes('308') || query.includes('2008')) {
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80';
  }
  if (query.includes('octavia') || query.includes('skoda') || query.includes('golf') || query.includes('volkswagen') || query.includes('polo')) {
    return 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80';
  }
  if (query.includes('corolla') || query.includes('yaris') || query.includes('toyota')) {
    return 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=80';
  }
  if (query.includes('tucson') || query.includes('hyundai') || query.includes('sportage') || query.includes('kia') || query.includes('accent')) {
    return 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80';
  }
  if (query.includes('hilux') || query.includes('prado') || query.includes('land cruiser')) {
    return 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&q=80';
  }
  if (query.includes('master') || query.includes('fourgon') || query.includes('utilitaire') || query.includes('van')) {
    return 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=1200&q=80';
  }
  return '';
}

const FLEET_PHOTO_PRESETS = [
  { name: 'Clio V', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&q=80' },
  { name: 'Sandero Stepway', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80' },
  { name: 'Peugeot 208', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80' },
  { name: 'Skoda Octavia', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80' },
  { name: 'Toyota Hilux', url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&q=80' },
  { name: 'Hyundai Tucson', url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80' },
];

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

  // Live state for real-time client card preview
  const [make, setMake] = useState<string>(vehicle?.make || '');
  const [model, setModel] = useState<string>(vehicle?.model || '');
  const [year, setYear] = useState<number>(vehicle?.year || new Date().getFullYear());
  const [plateNumber, setPlateNumber] = useState<string>(vehicle?.plate_number || '');
  const [categoryId, setCategoryId] = useState<string>(vehicle?.category_id || categories[0]?.id || '');
  const [branchId, setBranchId] = useState<string>(vehicle?.branch_id || branches[0]?.id || '');
  const [transmission, setTransmission] = useState<'manual' | 'automatic'>(vehicle?.transmission || 'manual');
  const [seats, setSeats] = useState<number>(vehicle?.seats || 5);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'hybrid' | 'electric'>(vehicle?.fuel_type || 'petrol');
  const [dailyRate, setDailyRate] = useState<number>(vehicle?.daily_rate || 4000);
  const [depositAmount, setDepositAmount] = useState<number>(vehicle?.deposit_amount || 5000);
  const [mileageLimitKm, setMileageLimitKm] = useState<string>(
    vehicle?.mileage_limit_km !== undefined && vehicle?.mileage_limit_km !== null
      ? String(vehicle?.mileage_limit_km)
      : ''
  );
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status || 'available');
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>('upload');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>(
    vehicle?.photos?.[0]?.storage_path || ''
  );

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

  // Selected entities for preview
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedBranch = branches.find((b) => b.id === branchId);

  const previewCategoryName = selectedCategory
    ? getCatName(selectedCategory)
    : effectiveLocale === 'ar'
    ? 'فئة المركبة'
    : 'Category';

  const previewBranchName = selectedBranch ? getBranchName(selectedBranch) : '';

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(vehicle?.category_id || categories[0]?.id || '');
    }
  }, [categories, categoryId, vehicle?.category_id]);

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(vehicle?.branch_id || branches[0]?.id || '');
    }
  }, [branches, branchId, vehicle?.branch_id]);

  useEffect(() => {
    if (state?.success) {
      const isStaffPath = typeof window !== 'undefined' && window.location.pathname.includes('/staff');
      const targetPath = isStaffPath ? `/${effectiveLocale}/staff/vehicles` : `/${effectiveLocale}/admin/vehicles`;
      const timer = setTimeout(() => {
        router.push(targetPath);
        router.refresh();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, effectiveLocale, router]);

  // Smart resolved image for preview
  const resolvedPhoto = customPhotoUrl.trim() || getSmartPhotoUrl(make, model);

  return (
    <form action={formAction} className="w-full">
      {isEditing && vehicle?.id && <input type="hidden" name="id" value={vehicle.id} />}
      <input type="hidden" name="photo_url" value={resolvedPhoto} />

      {/* Responsive 2-column layout: Form fields on one side, Live Card on the other */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* =========================================================
            LEFT COLUMN: Interactive Form Input Fields
            ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
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

          {/* Section: Vehicle Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-1 border-b border-neutral-100">
              {effectiveLocale === 'ar' ? 'بيانات وهوية المركبة' : effectiveLocale === 'fr' ? 'Identité du Véhicule' : 'Vehicle Identity'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Make (Brand)"
                name="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Renault, Dacia, Toyota"
                required
              />
              <Input
                label="Model"
                name="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Symbol, Logan, Yaris"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Year"
                name="year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || new Date().getFullYear())}
                min={1990}
                max={new Date().getFullYear() + 2}
                required
              />
              <Input
                label="License Plate Number"
                name="plate_number"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. 01234-123-16"
                required
              />
            </div>
          </div>

          {/* Section: Category & Branch Hub */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-1 border-b border-neutral-100">
              {effectiveLocale === 'ar' ? 'التصنيف والوكالة الحاضنة' : effectiveLocale === 'fr' ? 'Catégorie & Agence' : 'Category & Branch'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={effectiveDict?.vehicles?.category || 'Category'}
                name="category_id"
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder={
                  effectiveLocale === 'ar'
                    ? 'اختر فئة المركبة...'
                    : effectiveLocale === 'fr'
                    ? 'Sélectionner une catégorie...'
                    : 'Select a category...'
                }
                required
              />
              <Select
                label={effectiveDict?.reservations?.pickup_branch || 'Branch'}
                name="branch_id"
                options={branchOptions}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                placeholder={
                  effectiveLocale === 'ar'
                    ? 'اختر الوكالة...'
                    : effectiveLocale === 'fr'
                    ? 'Sélectionner une agence...'
                    : 'Select a branch...'
                }
                required
              />
            </div>
          </div>

          {/* Section: Technical Specs */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-1 border-b border-neutral-100">
              {effectiveLocale === 'ar' ? 'المواصفات التقنية' : effectiveLocale === 'fr' ? 'Caractéristiques Techniques' : 'Technical Specifications'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={effectiveDict?.vehicles?.transmission || 'Transmission'}
                name="transmission"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as 'manual' | 'automatic')}
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
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value) || 5)}
                min={1}
                max={50}
                required
              />
              <Select
                label={effectiveDict?.vehicles?.fuel_type || 'Fuel Type'}
                name="fuel_type"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as 'petrol' | 'diesel' | 'hybrid' | 'electric')}
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
          </div>

          {/* Section: Pricing & Rental Conditions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 pb-1 border-b border-neutral-100">
              {effectiveLocale === 'ar' ? 'التسعير وشروط الإيجار' : effectiveLocale === 'fr' ? 'Tarification & Conditions' : 'Pricing & Rental Terms'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                label={`${effectiveDict?.vehicles?.daily_rate || 'Daily Rate'} (DZD)`}
                name="daily_rate"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value) || 0)}
                min={1}
                required
              />
              <Input
                type="number"
                label={`${effectiveDict?.reservations?.deposit_required || 'Deposit'} (DZD)`}
                name="deposit_amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                min={1}
                required
              />
              <Input
                type="number"
                label="Mileage Limit (km/day or empty)"
                name="mileage_limit_km"
                value={mileageLimitKm}
                onChange={(e) => setMileageLimitKm(e.target.value)}
                placeholder="Unlimited if empty"
              />
            </div>
          </div>

          {/* Section: Vehicle Photo Management */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {effectiveLocale === 'ar' ? 'صورة المركبة والمعاينة' : effectiveLocale === 'fr' ? 'Photo du Véhicule' : 'Vehicle Photo'}
              </h3>
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    photoMode === 'upload'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 inline me-1" />
                  <span>{effectiveLocale === 'ar' ? 'رفع ملف' : 'Upload File'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    photoMode === 'url'
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 inline me-1" />
                  <span>{effectiveLocale === 'ar' ? 'رابط مباشر' : 'Image URL'}</span>
                </button>
              </div>
            </div>

            {photoMode === 'upload' ? (
              <FileUpload
                accept="image/*"
                label={effectiveLocale === 'ar' ? 'اختر أو اسحب صورة المركبة من جهازك' : 'Upload vehicle photo (drag & drop or click)'}
                onFileSelect={(file) => {
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setCustomPhotoUrl(url);
                  } else {
                    setCustomPhotoUrl('');
                  }
                }}
                preview={false}
              />
            ) : (
              <Input
                label={
                  effectiveLocale === 'ar'
                    ? 'رابط صورة المركبة (للمعاينة المباشرة)'
                    : effectiveLocale === 'fr'
                    ? 'URL de la photo'
                    : 'Vehicle Photo URL'
                }
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/... or paste image URL"
                helperText={
                  effectiveLocale === 'ar'
                    ? 'الصق رابط صورة مباشرة لمعاينتها على البطاقة، أو اختر نموذجاً من الأسفل.'
                    : 'Paste a direct image link or choose a fleet preset below.'
                }
              />
            )}

            {/* Quick Fleet Sample Presets */}
            <div className="pt-1">
              <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                {effectiveLocale === 'ar' ? 'أو اختر نموذجاً جاهزاً للأسطول الجزائري:' : 'Or pick an Algerian fleet photo preset:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FLEET_PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCustomPhotoUrl(preset.url)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      customPhotoUrl === preset.url
                        ? 'bg-brand-50 text-brand-600 border-brand-200 font-semibold'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-2">
              <Select
                label="Vehicle Status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'rented', label: 'Rented' },
                  { value: 'maintenance', label: 'In Maintenance' },
                  { value: 'retired', label: 'Retired' },
                ]}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-black/[0.06]">
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
        </div>

        {/* =========================================================
            RIGHT COLUMN: Real-Time Live Client Vehicle Card Preview
            (Sticky sidebar on desktop)
            ========================================================= */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
          {/* Preview Header Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                {effectiveLocale === 'ar'
                  ? 'معاينة العميل المباشرة'
                  : effectiveLocale === 'fr'
                  ? 'Aperçu Client en Direct'
                  : 'Live Client Preview'}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>{effectiveLocale === 'ar' ? 'تحديث فوري' : 'Live'}</span>
            </span>
          </div>

          {/* The Exact Client-Facing Vehicle Card (VehicleCard replica with live state) */}
          <div className="w-full max-w-sm mx-auto lg:max-w-none">
            <div className="group relative bg-white rounded-3xl border border-black/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 flex flex-col h-full">
              {/* Photo container with zoom & chips */}
              <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
                {resolvedPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvedPhoto}
                    alt={`${make || 'Vehicle'} ${model}`}
                    className="w-full h-full object-cover transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-2 bg-gradient-to-br from-neutral-50 to-neutral-100">
                    <svg
                      className="w-12 h-12 text-neutral-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                    <span className="text-[11px] font-medium text-neutral-400">
                      {effectiveLocale === 'ar' ? 'معاينة صورة المركبة' : 'Vehicle Photo Preview'}
                    </span>
                  </div>
                )}

                {/* Floating Category & Year Chips */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
                  <span className="bg-white/95 backdrop-blur-md text-neutral-900 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight shadow-sm border border-black/[0.04]">
                    {previewCategoryName}
                  </span>
                  <span className="ms-auto bg-black/65 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-xs font-medium tracking-tight">
                    {year}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-900 tracking-tight mb-3 group-hover:text-brand-500 transition-colors duration-200">
                    {make || (effectiveLocale === 'ar' ? 'الماركة' : 'Make')}{' '}
                    {model || (effectiveLocale === 'ar' ? 'الموديل' : 'Model')}
                  </h3>

                  {/* Quick Specs Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-neutral-600">
                    <span className="inline-flex items-center gap-1 bg-neutral-100/80 px-2.5 py-1 rounded-full border border-black/[0.03]">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      {transmission === 'automatic'
                        ? effectiveLocale === 'ar' ? 'أوتوماتيك' : 'Auto'
                        : effectiveLocale === 'ar' ? 'يدوي' : 'Manual'}
                    </span>

                    <span className="inline-flex items-center gap-1 bg-neutral-100/80 px-2.5 py-1 rounded-full border border-black/[0.03]">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {seats} {effectiveLocale === 'ar' ? 'مقاعد' : 'Seats'}
                    </span>

                    <span className="inline-flex items-center gap-1 bg-neutral-100/80 px-2.5 py-1 rounded-full border border-black/[0.03] capitalize">
                      <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {fuelType}
                    </span>
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="flex items-center justify-between pt-4 border-t border-black/[0.05] mt-2">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {effectiveDict?.vehicles?.daily_rate || 'Per Day'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-neutral-900 tracking-tight">
                        {formatDZD(Number(dailyRate) || 0, effectiveLocale)}
                      </span>
                    </div>
                  </div>

                  <div className="apple-press inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold tracking-tight bg-brand-500 text-white shadow-sm min-h-[40px] pointer-events-none opacity-90 select-none">
                    {effectiveDict?.vehicles?.vehicle_details || 'Reserve'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Verification Box */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 text-xs space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              {effectiveLocale === 'ar' ? 'ملخص الإعداد التشغيلي' : 'Operational Summary'}
            </span>

            <div className="flex items-center justify-between text-neutral-600 pt-1">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{effectiveLocale === 'ar' ? 'الوكالة الحاضنة:' : 'Branch:'}</span>
              </span>
              <span className="font-semibold text-neutral-800 truncate max-w-[180px]">
                {previewBranchName || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{effectiveLocale === 'ar' ? 'العربون المحمي:' : 'Deposit hold:'}</span>
              </span>
              <span className="font-semibold text-neutral-800">
                {formatDZD(Number(depositAmount) || 5000, effectiveLocale)}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <Gauge className="w-3.5 h-3.5 text-neutral-400" />
                <span>{effectiveLocale === 'ar' ? 'حد المسافة اليومية:' : 'Mileage limit:'}</span>
              </span>
              <span className="font-semibold text-neutral-800">
                {mileageLimitKm
                  ? `${mileageLimitKm} km/day`
                  : effectiveLocale === 'ar'
                  ? 'غير محدود'
                  : 'Unlimited'}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600 pt-1 border-t border-neutral-200/40">
              <span className="text-neutral-500">{effectiveLocale === 'ar' ? 'لوحة الترقيم:' : 'License plate:'}</span>
              <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200 text-[11px]">
                {plateNumber || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
