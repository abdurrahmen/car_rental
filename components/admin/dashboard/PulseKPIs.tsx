'use client'

import React from 'react'
import Link from 'next/link'
import {
  Car,
  CalendarCheck,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { SparkLine } from './SparkLine'
import { SegmentedBar } from './SegmentedBar'
import { formatDZD } from '@/lib/utils/constants'
import type { Language, Dictionary } from '@/types'
import type { PulseStats } from '@/lib/data/dashboard'

export interface PulseKPIsProps {
  locale: Language
  dictionary?: Dictionary
  stats: PulseStats
}

/**
 * T2 — Pulse KPIs (4 Interactive Mini Tiles):
 * 1. Today's Handovers (done / total with completion rate)
 * 2. Today's Returns (done / total + coral overdue warning)
 * 3. Available Now (X of N + segmented status distribution bar)
 * 4. Revenue This Month (Formatted DZD in <bdi> + dynamic sparkline + honest delta)
 * Entire tile is clickable and drills into the relevant admin page.
 */
export function PulseKPIs({
  locale,
  dictionary,
  stats,
}: PulseKPIsProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const {
    handoversToday,
    returnsToday,
    fleetAvailability,
    revenueMonth,
  } = stats

  // 1. Handovers completion percent
  const handoversPct = handoversToday.total > 0
    ? Math.round((handoversToday.completed / handoversToday.total) * 100)
    : 0

  // 2. Returns completion percent
  const returnsPct = returnsToday.total > 0
    ? Math.round((returnsToday.completed / returnsToday.total) * 100)
    : 0

  // 3. Utilization vs target (75% target)
  const utilizationTarget = 75
  const utilizationDiff = fleetAvailability.utilizationRate - utilizationTarget
  const utilizationStatus = utilizationDiff >= 0 ? 'on-target' : 'below-target'

  // 4. Segmented Fleet status
  const fleetSegments = [
    {
      key: 'available',
      label: d?.filter_available || (isArabic ? 'متاحة' : 'Dispo'),
      count: fleetAvailability.available,
      color: '#1FA971', // Palm Green
    },
    {
      key: 'rented',
      label: d?.filter_rented || (isArabic ? 'مؤجرة' : 'Louées'),
      count: fleetAvailability.rented,
      color: '#8B5CF6', // Violet (not blue per spec)
    },
    {
      key: 'maintenance',
      label: d?.filter_maintenance || (isArabic ? 'صيانة' : 'Maint'),
      count: fleetAvailability.maintenance,
      color: '#F5A524', // Sun Amber
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
      {/* ───────────────────────────────────────── */}
      {/* Tile 1: Today's Handovers                 */}
      {/* ───────────────────────────────────────── */}
      <Link
        href={`/${locale}/admin/reservations`}
        className="admin-card p-4.5 admin-card-hover flex flex-col justify-between group cursor-pointer border-s-4 border-s-brand-500"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {d?.todays_handovers || (isArabic ? 'تسليمات اليوم' : 'Remises du jour')}
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-brand-500">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3 flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            <bdi dir="ltr">{handoversToday.completed} / {handoversToday.total}</bdi>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
            {handoversPct}%
          </span>
        </div>

        {/* Mini progress line */}
        <div className="space-y-1">
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${handoversPct}%` }}
            />
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-0.5">
            {isArabic ? 'انقر لعرض مواعيد التسليم' : 'Voir les fiches de remise'} &rarr;
          </p>
        </div>
      </Link>

      {/* ───────────────────────────────────────── */}
      {/* Tile 2: Today's Returns + Overdue Alert   */}
      {/* ───────────────────────────────────────── */}
      <Link
        href={`/${locale}/admin/reservations`}
        className={`admin-card p-4.5 admin-card-hover flex flex-col justify-between group cursor-pointer border-s-4 ${
          returnsToday.overdue > 0 ? 'border-s-rose-500' : 'border-s-emerald-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {d?.todays_returns || (isArabic ? 'إرجاعات اليوم' : 'Retours du jour')}
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              returnsToday.overdue > 0
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3 flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            <bdi dir="ltr">{returnsToday.completed} / {returnsToday.total}</bdi>
          </div>

          {returnsToday.overdue > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span>{returnsToday.overdue} {d?.overdue || (isArabic ? 'متأخر' : 'retard')}</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              {returnsPct}%
            </span>
          )}
        </div>

        {/* Mini progress line */}
        <div className="space-y-1">
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                returnsToday.overdue > 0 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${returnsPct}%` }}
            />
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-0.5">
            {returnsToday.overdue > 0
              ? (isArabic ? 'يوجد تأخير يتطلب تدخلك' : 'Nécessite relance client')
              : (isArabic ? 'جميع الإرجاعات في موعدها' : 'Tous dans les délais')}
          </p>
        </div>
      </Link>

      {/* ───────────────────────────────────────── */}
      {/* Tile 3: Available Now (Fleet Segmented)   */}
      {/* ───────────────────────────────────────── */}
      <Link
        href={`/${locale}/admin/vehicles`}
        className="admin-card p-4.5 admin-card-hover flex flex-col justify-between group cursor-pointer border-s-4 border-s-palm"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {d?.available_now || (isArabic ? 'متاحة للتأجير' : 'Disponibles')}
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
            <Car className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3 flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
            <bdi dir="ltr">{fleetAvailability.available}</bdi>
            <span className="text-xs font-semibold text-neutral-400 ms-1.5">
              / {fleetAvailability.total}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              utilizationStatus === 'on-target'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
            }`}>
              {fleetAvailability.utilizationRate}%
            </span>
            <span className="text-[10px] text-neutral-400">
              {isArabic ? 'الهدف: 75%' : 'Obj: 75%'}
            </span>
          </div>
        </div>

        {/* Segmented fleet distribution */}
        <div className="space-y-1">
          <SegmentedBar
            segments={fleetSegments}
            total={fleetAvailability.total}
            height={6}
            showLegend={false}
          />
          <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 pt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {fleetAvailability.available} {isArabic ? 'جاهزة' : 'prêtes'}
            </span>
            <span>
              {fleetAvailability.rented} {isArabic ? 'مؤجرة' : 'louées'}
            </span>
          </div>
        </div>
      </Link>

      {/* ───────────────────────────────────────── */}
      {/* Tile 4: Revenue This Month + Sparkline    */}
      {/* ───────────────────────────────────────── */}
      <Link
        href={`/${locale}/admin/reservations`}
        className="admin-card p-4.5 admin-card-hover flex flex-col justify-between group cursor-pointer border-s-4 border-s-amber-500"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {d?.revenue_this_month || (isArabic ? 'إيرادات الشهر' : 'Revenus du mois')}
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white tabular-nums truncate">
            <bdi>{formatDZD(revenueMonth.total, locale)}</bdi>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            {revenueMonth.deltaPercent !== null && revenueMonth.deltaPercent !== 0 ? (
              <span className={`inline-flex items-center gap-1 font-bold ${
                revenueMonth.deltaPercent > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                <TrendingUp className={`w-3 h-3 ${revenueMonth.deltaPercent < 0 ? 'rotate-180' : ''}`} />
                <span>{revenueMonth.deltaPercent > 0 ? '+' : ''}{revenueMonth.deltaPercent}%</span>
                <span className="text-neutral-400 font-medium">
                  {d?.vs_last_month || (isArabic ? 'مقارنة بالشهر الماضي' : 'vs. mois dernier')}
                </span>
              </span>
            ) : (
              <span className="text-neutral-400 font-medium">
                {isArabic ? 'محسوب من العقود المؤكدة' : 'Contrats confirmés'}
              </span>
            )}
          </div>
        </div>

        {/* Sparkline Visual */}
        <div className="pt-0.5">
          <SparkLine
            data={revenueMonth.sparkline}
            color="#F5A524"
            height={28}
          />
        </div>
      </Link>
    </div>
  )
}
