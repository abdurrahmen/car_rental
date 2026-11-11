'use client';

import React from 'react';
import { ShieldCheck, Gauge, Fuel, FileText, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';
import type { VehicleConditionReport, Language, Dictionary } from '@/types';

export interface HandoverPvCardProps {
  reports?: (VehicleConditionReport & {
    staff?: { full_name?: string | null } | null;
  })[];
  locale: Language;
  dictionary?: Dictionary;
  vehiclePlate?: string;
  vehicleName?: string;
}

export function HandoverPvCard({
  reports = [],
  locale,
  vehiclePlate,
  vehicleName,
}: HandoverPvCardProps) {
  const isArabic = locale === 'ar';

  const pickupReport = reports.find((r) => r.stage === 'pickup');
  const returnReport = reports.find((r) => r.stage === 'return');

  if (!pickupReport && !returnReport) {
    return null;
  }

  const fuelLabels: Record<string, { ar: string; fr: string; en: string; percent: number }> = {
    empty: { ar: 'فارغ', fr: 'Vide', en: 'Empty', percent: 10 },
    quarter: { ar: 'ربع (1/4)', fr: '1/4 Plein', en: '1/4 Tank', percent: 25 },
    half: { ar: 'نصف (1/2)', fr: '1/2 Plein', en: '1/2 Tank', percent: 50 },
    three_quarter: { ar: 'ثلاثة أرباع (3/4)', fr: '3/4 Plein', en: '3/4 Tank', percent: 75 },
    full: { ar: 'ممتلئ (4/4)', fr: 'Plein (4/4)', en: 'Full Tank', percent: 100 },
  };

  const getFuelText = (level?: string) => {
    if (!level || !fuelLabels[level]) return level || '—';
    return isArabic ? fuelLabels[level].ar : locale === 'fr' ? fuelLabels[level].fr : fuelLabels[level].en;
  };

  const getFuelPercent = (level?: string) => {
    if (!level || !fuelLabels[level]) return 50;
    return fuelLabels[level].percent;
  };

  const kmDriven =
    pickupReport && returnReport
      ? Math.max(0, returnReport.odometer_reading - pickupReport.odometer_reading)
      : null;

  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 text-lg tracking-tight">
                {isArabic ? 'محضر المعاينة الرقمي (PV)' : 'Digital Condition Report (PV)'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{isArabic ? 'معتمد رسمياً' : 'Verified'}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isArabic
                ? 'توثيق حالة المركبة، العداد، والوقود بالوكالة عند التسليم والاسترجاع.'
                : 'Official vehicle handover & return inspection state documented at branch.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="print:hidden apple-press inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5 text-neutral-500" />
          <span>{isArabic ? 'طباعة المحضر' : 'Print Report'}</span>
        </button>
      </div>

      {/* Vehicle Summary Bar */}
      {(vehicleName || vehiclePlate) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 rounded-2xl text-xs font-medium text-neutral-600">
          <span>{vehicleName || 'Vehicle'}</span>
          {vehiclePlate && (
            <span className="font-mono font-bold text-neutral-900 bg-white px-2.5 py-1 rounded-md border border-neutral-200">
              {vehiclePlate}
            </span>
          )}
        </div>
      )}

      {/* 2-Column Inspection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PICKUP REPORT */}
        {pickupReport && (
          <div className="rounded-2xl border border-neutral-200/80 p-5 space-y-4 bg-gradient-to-br from-white to-neutral-50/50">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                <FileText className="w-3.5 h-3.5" />
                <span>{isArabic ? 'معاينة التسليم للزبون' : 'Pickup Handover'}</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {new Date(pickupReport.created_at).toLocaleDateString(
                  locale === 'ar' ? 'ar-DZ' : 'fr-DZ',
                  { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                )}
              </span>
            </div>

            {/* Odometer */}
            <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Gauge className="w-4 h-4 text-neutral-400" />
                <span>{isArabic ? 'عداد البداية:' : 'Odometer at pickup:'}</span>
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900">
                {pickupReport.odometer_reading.toLocaleString()} km
              </span>
            </div>

            {/* Fuel Level */}
            <div className="space-y-1.5 py-2 border-b border-black/[0.04]">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <Fuel className="w-4 h-4 text-amber-500" />
                  <span>{isArabic ? 'مستوى خزان الوقود:' : 'Fuel level:'}</span>
                </span>
                <span className="font-semibold text-neutral-800">
                  {getFuelText(pickupReport.fuel_level)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all rounded-full"
                  style={{ width: `${getFuelPercent(pickupReport.fuel_level)}%` }}
                />
              </div>
            </div>

            {/* Damage & Notes */}
            <div className="text-xs space-y-1.5">
              <span className="text-neutral-500 block font-medium">
                {isArabic ? 'ملاحظات وحالة الهيكل:' : 'Condition notes:'}
              </span>
              {pickupReport.damage_noted ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs">{pickupReport.notes || (isArabic ? 'تم تدوين خدوش سابقة' : 'Pre-existing scratches logged')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium">
                    {pickupReport.notes || (isArabic ? 'المركبة بحالة ممتازة ونظيفة وبدون أي أضرار' : 'Vehicle in pristine condition, no damage logged')}
                  </span>
                </div>
              )}
            </div>

            {pickupReport.staff?.full_name && (
              <div className="text-[11px] text-neutral-400 pt-1">
                {isArabic ? 'عون الوكالة المكلف: ' : 'Inspected by staff: '}
                <strong className="text-neutral-700">{pickupReport.staff.full_name}</strong>
              </div>
            )}
          </div>
        )}

        {/* RETURN REPORT */}
        {returnReport ? (
          <div className="rounded-2xl border border-neutral-200/80 p-5 space-y-4 bg-gradient-to-br from-white to-neutral-50/50">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <FileText className="w-3.5 h-3.5" />
                <span>{isArabic ? 'معاينة الاسترجاع' : 'Return Handover'}</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {new Date(returnReport.created_at).toLocaleDateString(
                  locale === 'ar' ? 'ar-DZ' : 'fr-DZ',
                  { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                )}
              </span>
            </div>

            {/* Return Odometer */}
            <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Gauge className="w-4 h-4 text-neutral-400" />
                <span>{isArabic ? 'عداد النهاية:' : 'Odometer at return:'}</span>
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900">
                {returnReport.odometer_reading.toLocaleString()} km
              </span>
            </div>

            {/* Total Distance */}
            {kmDriven !== null && (
              <div className="flex items-center justify-between py-2 border-b border-black/[0.04] bg-emerald-50/50 px-2 rounded-lg">
                <span className="text-xs font-medium text-emerald-800">
                  {isArabic ? 'المسافة المقطوعة خلال الكراء:' : 'Total distance traveled:'}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-900">
                  +{kmDriven.toLocaleString()} km
                </span>
              </div>
            )}

            {/* Return Fuel Level */}
            <div className="space-y-1.5 py-2 border-b border-black/[0.04]">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <Fuel className="w-4 h-4 text-amber-500" />
                  <span>{isArabic ? 'مستوى الوقود عند الإرجاع:' : 'Return fuel level:'}</span>
                </span>
                <span className="font-semibold text-neutral-800">
                  {getFuelText(returnReport.fuel_level)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all rounded-full"
                  style={{ width: `${getFuelPercent(returnReport.fuel_level)}%` }}
                />
              </div>
            </div>

            {/* Return Damage & Notes */}
            <div className="text-xs space-y-1.5">
              <span className="text-neutral-500 block font-medium">
                {isArabic ? 'ملاحظات الفحص النهائي:' : 'Return inspection notes:'}
              </span>
              {returnReport.damage_noted ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="text-xs">{returnReport.notes || (isArabic ? 'أضرار أو تأخير مسجل' : 'Damage logged upon return')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium">
                    {returnReport.notes || (isArabic ? 'تم استلام المركبة سليمة والوثائق كاملة' : 'Vehicle returned intact, papers and keys confirmed')}
                  </span>
                </div>
              )}
            </div>

            {returnReport.staff?.full_name && (
              <div className="text-[11px] text-neutral-400 pt-1">
                {isArabic ? 'عون الاسترجاع: ' : 'Inspected by staff: '}
                <strong className="text-neutral-700">{returnReport.staff.full_name}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-6 flex flex-col items-center justify-center text-center text-neutral-400 gap-2 bg-neutral-50/40">
            <Gauge className="w-8 h-8 text-neutral-300" />
            <span className="text-xs font-semibold text-neutral-500">
              {isArabic ? 'معاينة الاسترجاع قيد الانتظار' : 'Return Handover Pending'}
            </span>
            <p className="text-[11px] text-neutral-400 max-w-xs">
              {isArabic
                ? 'سيتم تسجيل عداد النهاية ومستوى الوقود فور إعادة المركبة إلى الوكالة.'
                : 'Return odometer reading and fuel level will be recorded upon vehicle dropoff.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
