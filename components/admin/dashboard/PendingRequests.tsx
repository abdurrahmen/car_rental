'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Clock,
  Check,
  X,
  Phone,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/constants'
import { confirmReservation, rejectReservation } from '@/lib/actions/reservations'
import type { Language, Dictionary } from '@/types'
import type { ActionItem } from '@/lib/data/dashboard'

export interface PendingRequestsProps {
  locale: Language
  dictionary?: Dictionary
  items: ActionItem[]
}

/**
 * Pending Requests Widget:
 * Dedicated section for booking requests awaiting approval
 * - Severity-based visual hierarchy
 * - Quick approve/decline actions
 * - Customer contact options
 * - Empty state when all cleared
 */
export function PendingRequests({
  locale,
  dictionary,
  items,
}: PendingRequestsProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const [approvedIds, setApprovedIds] = useState<string[]>([])
  const [declinedIds, setDeclinedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Filter only pending_booking items
  const pendingItems = items.filter(
    (item) => item.type === 'pending_booking' && !approvedIds.includes(item.id) && !declinedIds.includes(item.id)
  )

  const handleApprove = async (actionItemId: string, reservationId: string) => {
    setLoadingId(actionItemId)
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('id', reservationId)
        
        const result = await confirmReservation(null, formData)
        
        if (result.error) {
          alert(
            isArabic
              ? `خطأ في تأكيد الحجز: ${result.error}`
              : `Erreur de confirmation: ${result.error}`
          )
        } else {
          setApprovedIds((prev) => [...prev, actionItemId])
          // Simple success notification (can be replaced with toast library later)
          if (window.confirm(
            isArabic
              ? 'تم تأكيد الحجز بنجاح! ✅\n\nسيتم إشعار الزبون بضرورة دفع العربون خلال 48 ساعة.'
              : 'Réservation confirmée avec succès! ✅\n\nLe client sera notifié pour régler l\'acompte sous 48h.'
          )) {
            // User acknowledged
          }
        }
      } catch (error) {
        console.error('Error confirming reservation:', error)
        alert(
          isArabic
            ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
            : 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
        )
      } finally {
        setLoadingId(null)
      }
    })
  }

  const handleDecline = async (actionItemId: string, reservationId: string) => {
    const reason = prompt(
      isArabic
        ? 'يرجى إدخال سبب رفض الحجز (اختياري):'
        : 'Motif du refus (optionnel):',
      isArabic ? 'المركبة غير متوفرة' : 'Véhicule non disponible'
    )
    
    // User cancelled the prompt
    if (reason === null) return
    
    setLoadingId(actionItemId)
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('id', reservationId)
        formData.append('reason', reason || (isArabic ? 'تم رفضه من قبل الوكالة' : 'Refusé par l\'agence'))
        
        const result = await rejectReservation(null, formData)
        
        if (result.error) {
          alert(
            isArabic
              ? `خطأ في رفض الحجز: ${result.error}`
              : `Erreur de refus: ${result.error}`
          )
        } else {
          setDeclinedIds((prev) => [...prev, actionItemId])
          alert(
            isArabic
              ? 'تم رفض الحجز وإشعار الزبون. ❌'
              : 'Réservation refusée. Le client sera notifié. ❌'
          )
        }
      } catch (error) {
        console.error('Error rejecting reservation:', error)
        alert(
          isArabic
            ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
            : 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
        )
      } finally {
        setLoadingId(null)
      }
    })
  }

  // Clean Algerian phone number for wa.me / tel links
  const getCleanPhone = (phone?: string) => {
    if (!phone) return ''
    return phone.replace(/[^0-9]/g, '')
  }

  return (
    <div className="admin-card p-5 sm:p-6 flex flex-col h-full space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            {d?.pending_requests || (isArabic ? 'طلبات الحجز المعلقة' : 'Demandes en attente')}
          </h2>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 tabular-nums">
          {pendingItems.length}
        </span>
      </div>

      {/* List of Pending Requests */}
      {pendingItems.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pe-1">
          {pendingItems.map((item) => {
            const cleanPhone = getCleanPhone(item.phone)
            const [vehicleInfo, amountInfo] = item.title.split(' • ')

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.priority === 'high'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
                    : 'bg-neutral-50/90 dark:bg-white/5 border-neutral-200 dark:border-white/10'
                }`}
              >
                {/* Header: Vehicle & Priority Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {vehicleInfo}
                    </h3>
                  </div>

                  {item.priority === 'high' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shrink-0">
                      {isArabic ? 'أولوية عالية' : 'PRIORITAIRE'}
                    </span>
                  )}
                </div>

                {/* Amount & Wait Time */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-brand-700 dark:text-brand-400 tabular-nums">
                    {amountInfo || `${Number(item.amount || 0).toLocaleString()} DZD`}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    {item.subtitle}
                  </span>
                </div>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-white/5 text-[11px] text-neutral-600 dark:text-neutral-300">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{isArabic ? 'الجزائر العاصمة' : 'Alger Centre'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-white/5 text-[11px] text-neutral-600 dark:text-neutral-300">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{formatRelativeTime(item.timestamp, locale)}</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Approve */}
                  <button
                    type="button"
                    onClick={() => handleApprove(item.id, item.referenceId || item.id)}
                    disabled={isPending && loadingId === item.id}
                    className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-brand-500 text-white hover:bg-brand-600 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending && loadingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{d?.accept || (isArabic ? 'تأكيد الحجز' : 'Accepter')}</span>
                  </button>

                  {/* Decline */}
                  <button
                    type="button"
                    onClick={() => handleDecline(item.id, item.referenceId || item.id)}
                    disabled={isPending && loadingId === item.id}
                    className="apple-press inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending && loadingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>{d?.decline || (isArabic ? 'رفض' : 'Refuser')}</span>
                  </button>

                  {/* Contact Options */}
                  <div className="flex items-center gap-1.5 ms-auto">
                    {/* Call Phone */}
                    {cleanPhone && (
                      <a
                        href={`tel:+${cleanPhone}`}
                        className="apple-press inline-flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-white/10 text-neutral-700 dark:text-neutral-200 border border-black/[0.08] dark:border-white/10 hover:bg-neutral-50 transition-colors"
                        title="Call client"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                    )}

                    {/* WhatsApp */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="apple-press inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center flex-1">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            {d?.empty_pending || (isArabic ? 'لا طلبات معلقة حاليًا' : 'Aucune demande en attente')}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
            {d?.empty_pending_subtitle || (isArabic ? 'كل طلبات الحجز تم معالجتها.' : 'Toutes les demandes ont été traitées.')}
          </p>
        </div>
      )}

      {/* Footer link */}
      {pendingItems.length > 0 && (
        <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
          <Link
            href={`/${locale}/admin/reservations?status=pending`}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center justify-between"
          >
            <span>{d?.view_all_pending || (isArabic ? 'عرض كل الطلبات المعلقة' : 'Voir toutes les demandes')}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      )}
    </div>
  )
}
