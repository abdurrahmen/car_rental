'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Check,
  X,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/constants'
import type { Language, Dictionary } from '@/types'
import type { ActionItem } from '@/lib/data/dashboard'

export interface ActionCenterProps {
  locale: Language
  dictionary?: Dictionary
  items: ActionItem[]
}

/**
 * T3 — Action Center ("Needs you"):
 * High-priority action center with immediate inline capabilities:
 * - Accept / Decline / Call / WhatsApp for pending bookings
 * - Overdue return recovery
 * - Cash to collect at desk
 * - Friendly warm empty state
 */
export function ActionCenter({
  locale,
  dictionary,
  items,
}: ActionCenterProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const [resolvedIds, setResolvedIds] = useState<string[]>([])


  const handleDismiss = (id: string) => {
    setResolvedIds((prev) => [...prev, id])
  }

  const activeItems = items.filter((item) => !resolvedIds.includes(item.id))

  // Clean Algerian phone number for wa.me / tel links
  const getCleanPhone = (phone?: string) => {
    if (!phone) return ''
    return phone.replace(/[^0-9]/g, '')
  }

  return (
    <div className="admin-card p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
      {/* Header with live count badge */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block absolute inset-0" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            {d?.action_center || (isArabic ? 'يحتاج انتباهك' : 'Nécessite votre attention')}
          </h2>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 tabular-nums">
          {activeItems.length}
        </span>
      </div>

      {/* List of Action Items */}
      {activeItems.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pe-1">
          {activeItems.map((item) => {
            const cleanPhone = getCleanPhone(item.phone)

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.priority === 'urgent'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40'
                    : item.priority === 'high'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
                    : 'bg-neutral-50/90 dark:bg-white/5 border-neutral-200 dark:border-white/10'
                }`}
              >
                {/* Title & Timing */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.type === 'overdue_return' && (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    {item.type === 'pending_booking' && (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    {item.type === 'cash_collect' && (
                      <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}

                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                  </div>

                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
                    {formatRelativeTime(item.timestamp, locale)}
                  </span>
                </div>

                {/* Subtitle / context */}
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                  {item.subtitle}
                </p>

                {/* Inline Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-black/[0.05] dark:border-white/[0.05] flex flex-wrap items-center gap-1.5">
                  {item.type === 'pending_booking' && (
                    <>
                      {/* Accept */}
                      <button
                        type="button"
                        onClick={() => handleDismiss(item.id)}
                        className="apple-press inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{d?.accept || (isArabic ? 'تأكيد' : 'Accepter')}</span>
                      </button>

                      {/* Decline */}
                      <button
                        type="button"
                        onClick={() => handleDismiss(item.id)}
                        className="apple-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{d?.decline || (isArabic ? 'رفض' : 'Refuser')}</span>
                      </button>

                      {/* Call Phone */}
                      {cleanPhone && (
                        <a
                          href={`tel:+${cleanPhone}`}
                          className="apple-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-white/10 text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/10 hover:bg-neutral-50 transition-colors ms-auto"
                          title="Call client"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">{d?.call || (isArabic ? 'اتصال' : 'Appel')}</span>
                        </a>
                      )}

                      {/* WhatsApp */}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="apple-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                    </>
                  )}

                  {item.type === 'overdue_return' && (
                    <>
                      {cleanPhone && (
                        <a
                          href={`tel:+${cleanPhone}`}
                          className="apple-press inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-2xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{d?.call || (isArabic ? 'اتصال بالزبون' : 'Relancer client')}</span>
                        </a>
                      )}

                      <Link
                        href={`/${locale}/admin/reservations`}
                        className="apple-press inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-white/10 text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/10 ms-auto hover:bg-neutral-50 transition-colors"
                      >
                        <span>{isArabic ? 'ملف الحجز' : 'Dossier'}</span>
                        <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                      </Link>
                    </>
                  )}

                  {item.type === 'cash_collect' && (
                    <Link
                      href={`/${locale}/admin/reservations`}
                      className="apple-press inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'تسجيل القبض' : 'Encaisser'}</span>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Friendly Warm Empty State */
        <div className="py-10 px-4 text-center flex flex-col items-center justify-center flex-1">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            {d?.empty_actions || (isArabic ? 'لا شيء ينتظرك الآن — كل شيء على ما يرام.' : 'Rien en attente — tout est en ordre.')}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
            {d?.empty_actions_subtitle || (isArabic ? 'ستظهر هنا طلبات الحجز والإرجاعات المتأخرة عند ورودها.' : 'Les demandes et retours en retard s’afficheront ici.')}
          </p>
        </div>
      )}

      {/* Footer link to all reservations */}
      <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
        <Link
          href={`/${locale}/admin/reservations`}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center justify-between"
        >
          <span>{d?.all_bookings || (isArabic ? 'عرض كل المعاملات والحجوزات' : 'Gérer toutes les réservations')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
