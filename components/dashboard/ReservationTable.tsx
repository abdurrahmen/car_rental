import React from 'react'
import Link from 'next/link'
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Reservation, Language, Profile, Vehicle, Dictionary } from '@/types'
import { formatDZD } from '@/lib/utils/constants'

export type ReservationWithRelations = Reservation & {
  customer?: Profile
  profiles?: Profile
  vehicle?: Vehicle
}

export interface ReservationTableProps {
  reservations: ReservationWithRelations[]
  locale: Language
  dictionary?: Dictionary
  showCustomer?: boolean
  showActions?: boolean
  baseActionPath?: string
}

/**
 * Apple-style Data Table / Card List with subtle hairline rows,
 * clean typography, and tactile pill actions.
 */
export function ReservationTable({
  reservations,
  locale,
  dictionary,
  showCustomer = true,
  showActions = true,
  baseActionPath,
}: ReservationTableProps) {
  if (!reservations || reservations.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title={dictionary?.reservations?.no_reservations || 'No reservations recorded'}
        description={
          locale === 'ar'
            ? 'عند قيام الزبائن أو الحساب بالحجز، ستظهر هنا مع تفاصيل المتابعة.'
            : 'When bookings are made, they will appear here with full status tracking.'
        }
      />
    )
  }

  const getActionHref = (id: string) => {
    if (baseActionPath) return `${baseActionPath}/${id}`
    return `/${locale}/dashboard/reservations/${id}`
  }

  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-black/[0.05]">
        {reservations.map((res) => {
          const customerName =
            res.customer?.full_name || res.profiles?.full_name || 'Customer'
          return (
            <div key={res.id} className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-neutral-900 tracking-tight">
                    {res.vehicle?.make} {res.vehicle?.model}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    #{res.id.substring(0, 8)}
                  </div>
                </div>
                <ReservationStatusBadge status={res.status} locale={locale} />
              </div>

              <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                <span>{res.start_date}</span>
                <span className="text-neutral-300">→</span>
                <span>{res.end_date}</span>
              </div>

              {showCustomer && (
                <div className="text-xs">
                  <span className="text-neutral-400">Customer: </span>
                  <span className="font-medium text-neutral-800">
                    {customerName}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-black/[0.04]">
                <div className="font-bold text-neutral-900 tracking-tight">
                  {formatDZD(res.total_price, locale)}
                </div>
                {showActions && (
                  <Link
                    href={getActionHref(res.id)}
                    className="apple-press inline-flex items-center text-xs font-semibold px-3.5 py-1.5 bg-neutral-100 text-neutral-800 hover:bg-neutral-200/70 rounded-full transition-colors min-h-[36px]"
                  >
                    Details
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-start text-sm text-neutral-600 rtl:text-right">
          <thead className="bg-neutral-50/70 text-neutral-400 font-medium border-b border-black/[0.05] text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">ID</th>
              {showCustomer && <th className="px-5 py-3.5">Customer</th>}
              <th className="px-5 py-3.5">Vehicle</th>
              <th className="px-5 py-3.5">Dates</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Total</th>
              {showActions && <th className="px-5 py-3.5 text-end">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {reservations.map((res) => {
              const customerName =
                res.customer?.full_name || res.profiles?.full_name || 'Customer'
              return (
                <tr
                  key={res.id}
                  className="hover:bg-neutral-50/70 transition-colors duration-150"
                >
                  <td className="px-5 py-4 font-mono text-xs text-neutral-400">
                    #{res.id.substring(0, 8)}
                  </td>
                  {showCustomer && (
                    <td className="px-5 py-4 font-medium text-neutral-900">
                      {customerName}
                    </td>
                  )}
                  <td className="px-5 py-4 font-medium text-neutral-900">
                    {res.vehicle?.make} {res.vehicle?.model}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-500">
                    {res.start_date} <br />
                    <span className="text-neutral-300">→</span>{' '}
                    {res.end_date}
                  </td>
                  <td className="px-5 py-4">
                    <ReservationStatusBadge
                      status={res.status}
                      locale={locale}
                    />
                  </td>
                  <td className="px-5 py-4 font-bold text-neutral-900 whitespace-nowrap tracking-tight">
                    {formatDZD(res.total_price, locale)}
                  </td>
                  {showActions && (
                    <td className="px-5 py-4 text-end">
                      <Link
                        href={getActionHref(res.id)}
                        className="apple-press inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80 rounded-full transition-colors min-h-[32px]"
                      >
                        Details
                      </Link>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
