import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { notFound } from 'next/navigation';
import { ReservationActions } from '@/components/dashboard/ReservationActions';
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import { ReservationTimeline } from '@/components/reservations/ReservationTimeline';
import { HandoverPvCard } from '@/components/reservations/HandoverPvCard';
import { formatDZD, formatDate } from '@/lib/utils/constants';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { Language, Reservation, VehicleConditionReport } from '@/types';

interface StaffReservationDetailPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function StaffReservationDetailPage({
  params,
}: StaffReservationDetailPageProps) {
  const { lang, id } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { data: reservation } = await supabase
    .from('reservations')
    .select(
      '*, vehicle:vehicles(*), customer:profiles!customer_id(*), pickup_branch:branches!pickup_branch_id(*)',
    )
    .eq('id', id)
    .single();

  if (!reservation) notFound();

  const { data: reports } = await supabase
    .from('vehicle_condition_reports')
    .select('*, staff:profiles!staff_id(full_name)')
    .eq('reservation_id', id)
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <span className="text-xs font-mono text-neutral-400 block">
            Reservation #{reservation.id}
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1">
            {dict.reservations.reservation_details}
          </h1>
        </div>
        <ReservationStatusBadge
          status={reservation.status}
          locale={locale}
        />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm">
        <ReservationTimeline
          reservation={reservation as Reservation}
          locale={locale}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information & Documents */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            Customer Information
          </h2>
          <p className="text-sm">
            <span className="text-neutral-500">{dict.profile.full_name}:</span>{' '}
            <strong className="text-neutral-900">
              {reservation.customer?.full_name || 'N/A'}
            </strong>
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">{dict.profile.phone}:</span>{' '}
            <a
              href={`tel:${reservation.customer?.phone}`}
              className="text-brand-500 font-semibold hover:underline"
            >
              {reservation.customer?.phone || 'N/A'}
            </a>
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">
              {dict.profile.license_number}:
            </span>{' '}
            <span className="font-mono font-medium text-neutral-800">
              {reservation.customer?.license_number || 'Not provided'}
            </span>
          </p>
          <div className="pt-3 border-t border-black/[0.06] text-xs text-neutral-600">
            {reservation.customer?.license_document_url ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Driver license document uploaded</span>
              </span>
            ) : (
              <span className="text-amber-800 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>No driver license uploaded yet</span>
              </span>
            )}
          </div>
        </div>

        {/* Vehicle & Reservation Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            Vehicle & Rental Period
          </h2>
          <p className="text-sm">
            <strong className="text-neutral-900">
              {reservation.vehicle?.make} {reservation.vehicle?.model} (
              {reservation.vehicle?.year})
            </strong>{' '}
            · Plate:{' '}
            <span className="font-mono">{reservation.vehicle?.plate_number}</span>
          </p>
          <p className="text-sm text-neutral-700">
            {formatDate(reservation.start_date, locale)} →{' '}
            {formatDate(reservation.end_date, locale)}
          </p>
          <div className="pt-3 border-t border-black/[0.06] space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">
                {dict.reservations.deposit_required}:
              </span>
              <span className="font-semibold text-neutral-800">
                {formatDZD(reservation.deposit_amount, locale)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-neutral-900 pt-1">
              <span>{dict.reservations.total_price}:</span>
              <span className="text-brand-600">
                {formatDZD(reservation.total_price, locale)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Handover & Return Inspection PV (Condition Report) */}
      {reports && reports.length > 0 && (
        <HandoverPvCard
          reports={reports as unknown as (VehicleConditionReport & { staff?: { full_name?: string | null } | null })[]}
          locale={locale}
          dictionary={dict}
          vehiclePlate={reservation.vehicle?.plate_number}
          vehicleName={`${reservation.vehicle?.make} ${reservation.vehicle?.model}`}
        />
      )}

      {/* Staff Actions: Confirm / Reject / Handover PV / Return PV */}
      <ReservationActions
        reservation={reservation as unknown as Reservation & { customer?: { id: string; full_name: string | null; phone: string | null; license_document_url: string | null; license_verified: boolean; } }}
        locale={locale}
        dictionary={dict}
      />
    </div>
  );
}
