'use client';

import React, { useActionState } from 'react';
import {
  confirmReservation,
  rejectReservation,
} from '@/lib/actions/reservations';
import { Button } from '@/components/ui/Button';
import type { Reservation, Language, Dictionary } from '@/types';

export interface ReservationActionsProps {
  reservation: Reservation & {
    customer?: {
      id: string;
      full_name: string | null;
      phone: string | null;
      license_document_url: string | null;
      license_verified: boolean;
    };
  };
  locale?: Language;
  lang?: Language;
  dictionary?: Dictionary;
  dict?: Dictionary;
}

export function ReservationActions({
  reservation,
  locale,
  lang,
  dictionary,
  dict,
}: ReservationActionsProps) {
  const effectiveDict = dictionary || dict;

  const [confirmState, confirmAction, isConfirming] = useActionState(
    confirmReservation,
    null,
  );
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectReservation,
    null,
  );

  const isPending = reservation.status === 'pending';

  return (
    <div className="space-y-6">
      {confirmState?.error && (
        <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
          {confirmState.error}
        </div>
      )}

      {rejectState?.error && (
        <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
          {rejectState.error}
        </div>
      )}

      {confirmState?.success && (
        <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
          Reservation confirmed! A 48-hour deposit window has been granted.
        </div>
      )}

      {rejectState?.success && (
        <div className="p-3.5 bg-neutral-100 text-neutral-800 border border-black/[0.06] rounded-2xl text-xs font-medium">
          Reservation has been rejected and cancelled.
        </div>
      )}

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/[0.06]">
          {/* Confirm Form */}
          <form
            action={confirmAction}
            className="p-6 sm:p-8 bg-white border border-emerald-500/20 rounded-3xl shadow-sm space-y-4"
          >
            <input type="hidden" name="id" value={reservation.id} />
            <h3 className="font-bold text-emerald-950 text-base tracking-tight">
              {effectiveDict?.staff?.confirm_reservation || 'Confirm Reservation'}
            </h3>
            <p className="text-xs text-neutral-600">
              Confirming locks the vehicle for the requested dates and notifies the customer to submit the deposit.
            </p>
            <div>
              <label
                htmlFor="staff_notes"
                className="block text-xs font-medium text-neutral-700 mb-1.5"
              >
                {effectiveDict?.staff?.staff_notes || 'Internal Staff Notes'}
              </label>
              <textarea
                id="staff_notes"
                name="staff_notes"
                rows={2}
                placeholder="Called customer, license looks verified..."
                className="w-full text-sm bg-white border border-neutral-300 rounded-xl p-3 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none transition-all"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={isConfirming}
              disabled={isConfirming || isRejecting}
              fullWidth
            >
              ✓ {effectiveDict?.staff?.confirm_reservation || 'Confirm Request'}
            </Button>
          </form>

          {/* Reject Form */}
          <form
            action={rejectAction}
            className="p-6 sm:p-8 bg-white border border-red-500/20 rounded-3xl shadow-sm space-y-4"
          >
            <input type="hidden" name="id" value={reservation.id} />
            <h3 className="font-bold text-red-950 text-base tracking-tight">
              {effectiveDict?.staff?.reject_reservation || 'Reject Reservation'}
            </h3>
            <p className="text-xs text-neutral-600">
              Rejecting releases any hold on the vehicle immediately.
            </p>
            <div>
              <label
                htmlFor="reason"
                className="block text-xs font-medium text-neutral-700 mb-1.5"
              >
                Reason for Rejection
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={2}
                required
                placeholder="Invalid license, customer unreachable, vehicle unavailable..."
                className="w-full text-sm bg-white border border-neutral-300 rounded-xl p-3 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 focus:outline-none transition-all"
              />
            </div>
            <Button
              type="submit"
              variant="danger"
              loading={isRejecting}
              disabled={isConfirming || isRejecting}
              fullWidth
            >
              ✕ {effectiveDict?.staff?.reject_reservation || 'Reject Request'}
            </Button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-neutral-50 border border-black/[0.06] rounded-2xl text-neutral-600 text-sm">
          This reservation is currently{' '}
          <strong className="capitalize text-neutral-900">{reservation.status}</strong>. No further pending queue actions required.
        </div>
      )}
    </div>
  );
}
