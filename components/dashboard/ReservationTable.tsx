import React from 'react';
import Link from 'next/link';
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import type { Reservation, Language, Profile, Vehicle, Dictionary } from '@/types';
import { formatDZD } from '@/lib/utils/constants';

export type ReservationWithRelations = Reservation & {
  customer?: Profile;
  profiles?: Profile;
  vehicle?: Vehicle;
};

export interface ReservationTableProps {
  reservations: ReservationWithRelations[];
  locale: Language;
  dictionary?: Dictionary;
  showCustomer?: boolean;
  showActions?: boolean;
  baseActionPath?: string;
}

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
      <div className="bg-card rounded-xl shadow-sm border border-neutral-200 p-8 text-center text-neutral-500">
        {dictionary?.reservations?.no_reservations || 'No reservations found.'}
      </div>
    );
  }

  const getActionHref = (id: string) => {
    if (baseActionPath) return `${baseActionPath}/${id}`;
    return `/${locale}/dashboard/reservations/${id}`;
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-neutral-200">
        {reservations.map((res) => {
          const customerName =
            res.customer?.full_name || res.profiles?.full_name || 'Customer';
          return (
            <div key={res.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-neutral-900">
                    {res.vehicle?.make} {res.vehicle?.model}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    #{res.id.substring(0, 8)}
                  </div>
                </div>
                <ReservationStatusBadge status={res.status} locale={locale} />
              </div>

              <div className="text-sm text-neutral-600">
                {res.start_date} → {res.end_date}
              </div>

              {showCustomer && (
                <div className="text-sm">
                  <span className="text-neutral-500">Customer: </span>
                  <span className="font-medium text-neutral-900">
                    {customerName}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                <div className="font-bold text-accent-600">
                  {formatDZD(res.total_price, locale)}
                </div>
                {showActions && (
                  <Link
                    href={getActionHref(res.id)}
                    className="text-sm text-brand-800 hover:text-brand-900 font-medium px-3 py-1.5 bg-neutral-100 rounded-lg min-h-[44px] flex items-center"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-start text-sm text-neutral-600 rtl:text-right">
          <thead className="bg-neutral-50 text-neutral-900 font-medium border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3">ID</th>
              {showCustomer && <th className="px-4 py-3">Customer</th>}
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              {showActions && <th className="px-4 py-3 text-end">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {reservations.map((res) => {
              const customerName =
                res.customer?.full_name || res.profiles?.full_name || 'Customer';
              return (
                <tr
                  key={res.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    #{res.id.substring(0, 8)}
                  </td>
                  {showCustomer && (
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {customerName}
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {res.vehicle?.make} {res.vehicle?.model}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {res.start_date} <br />
                    <span className="text-neutral-400">→</span> {res.end_date}
                  </td>
                  <td className="px-4 py-3">
                    <ReservationStatusBadge
                      status={res.status}
                      locale={locale}
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-accent-600 whitespace-nowrap">
                    {formatDZD(res.total_price, locale)}
                  </td>
                  {showActions && (
                    <td className="px-4 py-3 text-end">
                      <Link
                        href={getActionHref(res.id)}
                        className="inline-flex items-center text-brand-800 hover:text-brand-900 font-medium px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors min-h-[36px]"
                      >
                        View
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
