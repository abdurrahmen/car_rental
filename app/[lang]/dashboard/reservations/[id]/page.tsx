import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { notFound } from 'next/navigation';
import { formatDZD, formatDate } from '@/lib/utils/constants';
import { ReservationTimeline } from '@/components/reservations/ReservationTimeline';
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import { HandoverPvCard } from '@/components/reservations/HandoverPvCard';
import { DepositPaymentCard } from '@/components/reservations/DepositPaymentCard';
import { Button } from '@/components/ui/Button';
import { cancelReservation } from '@/lib/actions/reservations';
import type { Language, Reservation, VehicleConditionReport } from '@/types';

interface ReservationDetailPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function ReservationDetailPage({
  params,
}: ReservationDetailPageProps) {
  const { lang, id } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reservation } = await supabase
    .from('reservations')
    .select(
      '*, vehicle:vehicles(*), pickup_branch:branches!pickup_branch_id(*), dropoff_branch:branches!dropoff_branch_id(*)',
    )
    .eq('id', id)
    .single();

  if (!reservation || reservation.customer_id !== user?.id) {
    notFound();
  }

  const { data: reports } = await supabase
    .from('vehicle_condition_reports')
    .select('*, staff:profiles!staff_id(full_name)')
    .eq('reservation_id', id)
    .order('created_at', { ascending: true });

  const canCancel =
    reservation.status === 'pending' || reservation.status === 'confirmed';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <span className="text-xs font-mono text-neutral-400 block">
            ID: #{reservation.id}
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

      {/* State Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm">
        <ReservationTimeline
          reservation={reservation as Reservation}
          locale={locale}
        />
      </div>

      {/* Deposit Payment Card for Customer (Step 2) */}
      {reservation.status === 'confirmed' && (
        <DepositPaymentCard
          reservationId={reservation.id}
          depositAmount={reservation.deposit_amount}
          depositDeadline={reservation.deposit_deadline}
          locale={locale}
        />
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            {reservation.vehicle?.make} {reservation.vehicle?.model}
          </h2>
          <p className="text-sm text-neutral-600">
            {dict.vehicles.year}: {reservation.vehicle?.year} ·{' '}
            {reservation.vehicle?.transmission === 'automatic'
              ? dict.vehicles.automatic
              : dict.vehicles.manual}
          </p>
          <div className="pt-3 border-t border-black/[0.06] text-sm space-y-1.5">
            <p>
              <span className="text-neutral-500">
                {dict.reservations.pickup_branch}:
              </span>{' '}
              <span className="font-medium text-neutral-900">
                {locale === 'ar'
                  ? reservation.pickup_branch?.name_ar
                  : locale === 'fr'
                    ? reservation.pickup_branch?.name_fr
                    : reservation.pickup_branch?.name_en}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">
                {dict.reservations.dropoff_branch}:
              </span>{' '}
              <span className="font-medium text-neutral-900">
                {locale === 'ar'
                  ? reservation.dropoff_branch?.name_ar
                  : locale === 'fr'
                    ? reservation.dropoff_branch?.name_fr
                    : reservation.dropoff_branch?.name_en}
              </span>
            </p>
          </div>
        </div>

        {/* Pricing and Dates */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            {dict.reservations.pickup_date} & {dict.reservations.return_date}
          </h2>
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

      {/* Digital Handover PV (Inspection & Condition Report) */}
      {reports && reports.length > 0 && (
        <HandoverPvCard
          reports={reports as unknown as (VehicleConditionReport & { staff?: { full_name?: string | null } | null })[]}
          locale={locale}
          dictionary={dict}
          vehiclePlate={reservation.vehicle?.plate_number}
          vehicleName={`${reservation.vehicle?.make} ${reservation.vehicle?.model}`}
        />
      )}

      {/* Cancellation section */}
      {canCancel && (
        <div className="p-6 sm:p-8 bg-red-50/50 rounded-3xl border border-red-200/60">
          <h3 className="font-bold text-danger-900 text-lg mb-2">
            {dict.reservations.cancel_reservation}
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            If your travel plans have changed, you can cancel your request. The blocked vehicle will be immediately released.
          </p>
          <form
            action={async (formData: FormData) => {
              'use server';
              await cancelReservation(null, formData);
            }}
            className="flex gap-4 items-center"
          >
            <input type="hidden" name="id" value={reservation.id} />
            <input
              type="text"
              name="reason"
              placeholder={dict.reservations.cancel_reason}
              className="flex-1 bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 min-h-[44px]"
            />
            <Button type="submit" variant="danger">
              {dict.reservations.cancel_reservation}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
