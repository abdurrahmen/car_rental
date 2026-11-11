'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  CreditCard,
  Banknote,
  ShieldCheck,
  Target,
} from 'lucide-react'

import { AreaChart } from './AreaChart'
import { SegmentedBar } from './SegmentedBar'
import { formatDZD } from '@/lib/utils/constants'
import { getRevenueTimeSeries } from '@/lib/utils/revenue-series'
import type { Language, Dictionary } from '@/types'
import type { PulseStats } from '@/lib/data/dashboard'

export interface RevenuePanelProps {
  locale: Language
  dictionary?: Dictionary
  stats: PulseStats
}

/**
 * T6 — Revenue and Money Management:
 * - 7d / 30d / 90d Area Chart with previous period comparison
 * - Target utilization gauge with objective line
 * - Financial summary strip (Collected / To collect at desk / Deposits held)
 * - Algerian payment methods split (Cash, BaridiMob, CCP, Edahabia)
 */
export function RevenuePanel({
  locale,
  dictionary,
  stats,
}: RevenuePanelProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Generate real structured series
  const seriesData = getRevenueTimeSeries(timeRange, locale)

  // Payment methods breakdown
  const paymentSegments = [
    {
      key: 'cash',
      label: d?.cash || (isArabic ? 'نقداً بالوكالة' : 'Espèces au comptoir'),
      count: stats.paymentSplit.cash,
      color: '#1FA971', // Palm green
    },
    {
      key: 'baridimob',
      label: 'BaridiMob',
      count: stats.paymentSplit.baridimob,
      color: '#0071E3', // Postal blue
    },
    {
      key: 'ccp',
      label: 'CCP',
      count: stats.paymentSplit.ccp,
      color: '#F5A524', // Yellow gold
    },
    {
      key: 'edahabia',
      label: 'Edahabia',
      count: stats.paymentSplit.edahabia,
      color: '#8B5CF6', // Card purple
    },
  ]

  const utilizationTarget = 75 // 75% agency efficiency target
  const currentUtilization = stats.fleetAvailability.utilizationRate

  return (
    <div className="admin-card p-5 sm:p-6 flex flex-col justify-between space-y-5">
      {/* Header: Title & Time Range Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              {d?.revenue_money || (isArabic ? 'الإيرادات والتحصيل المالي' : 'Revenus & Flux de caisse')}
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {isArabic ? 'تطور المداخيل ومصادر الدفع والضمانات' : 'Évolution du chiffre d’affaires et encaissements'}
            </p>
          </div>
        </div>

        {/* 7d / 30d / 90d pills */}
        <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-black/[0.04] dark:border-white/5">
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`apple-press px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              timeRange === '7d'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {d?.seven_days || '7d'}
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`apple-press px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              timeRange === '30d'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {d?.thirty_days || '30d'}
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('90d')}
            className={`apple-press px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              timeRange === '90d'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {d?.ninety_days || '90d'}
          </button>
        </div>
      </div>

      {/* Money Strip: 3 Key Financial Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Collected */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <span>{d?.collected || (isArabic ? 'المحصّل في الصندوق' : 'Encaissé')}</span>
            <Banknote className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-100 mt-1 tabular-nums truncate">
            <bdi>{formatDZD(stats.moneyStrip.collected, locale)}</bdi>
          </div>
        </div>

        {/* 2. To Collect at Pickup */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
            <span>{d?.to_collect || (isArabic ? 'للتحصيل عند التسليم' : 'À encaisser')}</span>
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-900 dark:text-amber-100 mt-1 tabular-nums truncate">
            <bdi>{formatDZD(stats.moneyStrip.toCollectToday, locale)}</bdi>
          </div>
        </div>

        {/* 3. Deposits Held */}
        <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between text-xs text-blue-800 dark:text-blue-300 font-medium">
            <span>{d?.deposits_held || (isArabic ? 'الكفالات المحتجزة' : 'Cautions retenues')}</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100 mt-1 tabular-nums truncate">
            <bdi>{formatDZD(stats.moneyStrip.depositsHeld, locale)}</bdi>
          </div>
        </div>
      </div>

      {/* Area Chart Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400">
              <span className="w-3 h-0.5 bg-brand-500 rounded-full" />
              <span>{isArabic ? 'الفترة الحالية' : 'Période actuelle'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <span className="w-3 h-0.5 border-b border-dashed border-neutral-400" />
              <span>{isArabic ? 'الفترة السابقة' : 'Période précédente'}</span>
            </div>
          </div>
        </div>

        <AreaChart
          data={seriesData}
          locale={locale}
          height={180}
        />
      </div>

      {/* Bottom Row: Utilization Target & Payment Split */}
      <div className="pt-3 border-t border-neutral-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Utilization with Target Line */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              <span>{d?.utilization || (isArabic ? 'معدل استغلال الأسطول' : 'Taux d’utilisation')}</span>
            </div>
            <div className="text-[11px] font-semibold text-neutral-500 tabular-nums">
              <span className="text-brand-600 dark:text-brand-400 font-bold text-xs">{currentUtilization}%</span>
              {' / '}{isArabic ? 'الهدف' : 'Objectif'} {utilizationTarget}%
            </div>
          </div>

          {/* Bar with Target Needle */}
          <div className="relative w-full h-3 rounded-full bg-neutral-100 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                currentUtilization >= utilizationTarget ? 'bg-emerald-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(currentUtilization, 100)}%` }}
            />
            {/* Target marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-neutral-900 dark:bg-white shadow"
              style={{ left: `${utilizationTarget}%` }}
              title={`Objectif: ${utilizationTarget}%`}
            />
          </div>
        </div>

        {/* Algerian Payment Methods Breakdown */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {d?.payment_methods || (isArabic ? 'توزيع قنوات الدفع (الجزائر)' : 'Canaux d’encaissement')}
          </div>
          <SegmentedBar
            segments={paymentSegments}
            total={stats.moneyStrip.collected}
            height={6}
            showLegend={true}
          />
        </div>
      </div>
    </div>
  )
}
