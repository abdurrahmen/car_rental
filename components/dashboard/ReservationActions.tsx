'use client';

import React, { useActionState, useState } from 'react';
import {
  confirmReservation,
  rejectReservation,
  markDepositPaid,
  startRental,
  completeRental,
} from '@/lib/actions/reservations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Check, X, KeyRound, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
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
  locale = 'ar',
  dictionary,
  dict,
}: ReservationActionsProps) {
  const effectiveDict = dictionary || dict;
  const isArabic = locale === 'ar';

  const [confirmState, confirmAction, isConfirming] = useActionState(confirmReservation, null);
  const [rejectState, rejectAction, isRejecting] = useActionState(rejectReservation, null);
  const [depositState, depositAction, isDepositing] = useActionState(markDepositPaid, null);
  const [startState, startAction, isStarting] = useActionState(startRental, null);
  const [completeState, completeAction, isCompleting] = useActionState(completeRental, null);

  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  const isPending = reservation.status === 'pending';
  const isConfirmed = reservation.status === 'confirmed';
  const canHandover = reservation.status === 'confirmed' || reservation.status === 'deposit_paid';
  const isActive = reservation.status === 'active';
  const isCompleted = reservation.status === 'completed';

  const fuelOptions = [
    { value: 'full', label: isArabic ? 'ممتلئ (4/4)' : 'Full (4/4)' },
    { value: 'three_quarter', label: isArabic ? 'ثلاثة أرباع (3/4)' : '3/4 Tank' },
    { value: 'half', label: isArabic ? 'نصف (1/2)' : '1/2 Tank' },
    { value: 'quarter', label: isArabic ? 'ربع (1/4)' : '1/4 Tank' },
    { value: 'empty', label: isArabic ? 'فارغ' : 'Empty' },
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Alerts */}
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
      {startState?.error && (
        <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
          {startState.error}
        </div>
      )}
      {completeState?.error && (
        <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
          {completeState.error}
        </div>
      )}

      {confirmState?.success && (
        <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
          {isArabic ? 'تم تأكيد الحجز بنجاح ومطالبة الزبون بالعربون.' : 'Reservation confirmed! A 48-hour deposit window has been granted.'}
        </div>
      )}
      {rejectState?.success && (
        <div className="p-3.5 bg-neutral-100 text-neutral-800 border border-black/[0.06] rounded-2xl text-xs font-medium">
          {isArabic ? 'تم رفض الحجز وإلغاؤه.' : 'Reservation has been rejected and cancelled.'}
        </div>
      )}
      {depositState?.error && (
        <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
          {depositState.error}
        </div>
      )}
      {depositState?.success && (
        <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
          {isArabic ? 'تم توثيق استلام العربون بنجاح!' : 'Deposit payment recorded and confirmed!'}
        </div>
      )}

      {startState?.success && (
        <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
          {isArabic ? 'تم تسليم المركبة للزبون وتفعيل الكراء مع محضر التسليم (PV).' : 'Vehicle handed over! Rental is now active with signed handover PV.'}
        </div>
      )}
      {completeState?.success && (
        <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
          {isArabic ? 'تم استرجاع المركبة وإكمال الكراء بنجاح مع محضر الاسترجاع (PV).' : 'Vehicle returned! Rental marked completed and inspection report verified.'}
        </div>
      )}

      {/* STATE 1: PENDING (CONFIRM OR REJECT) */}
      {isPending && (
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
              {isArabic
                ? 'تأكيد الحجز يثبت حجز المركبة للتواريخ المحددة ويخطر الزبون بدفع العربون.'
                : 'Confirming locks the vehicle for the requested dates and notifies the customer to submit the deposit.'}
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
                placeholder={isArabic ? 'تم الاتصال بالزبون، الوثائق مطابقة...' : 'Called customer, license looks verified...'}
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
              <Check className="w-4 h-4 inline me-1.5" />
              <span>{effectiveDict?.staff?.confirm_reservation || 'Confirm Request'}</span>
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
              {isArabic
                ? 'رفض الحجز يلغي الطلب ويحرر المركبة على الفور للحجوزات الأخرى.'
                : 'Rejecting releases any hold on the vehicle immediately.'}
            </p>
            <div>
              <label
                htmlFor="reason"
                className="block text-xs font-medium text-neutral-700 mb-1.5"
              >
                {isArabic ? 'سبب الرفض' : 'Reason for Rejection'}
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={2}
                required
                placeholder={isArabic ? 'الرخصة غير صالحة، تعذر الاتصال بالزبون...' : 'Invalid license, customer unreachable, vehicle unavailable...'}
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
              <X className="w-4 h-4 inline me-1.5" />
              <span>{effectiveDict?.staff?.reject_reservation || 'Reject Request'}</span>
            </Button>
          </form>
        </div>
      )}

      {/* STATE 2: AWAITING DEPOSIT (STAFF VERIFY / RECORD DEPOSIT) */}
      {isConfirmed && (
        <div className="pt-4 border-t border-black/[0.06] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-50/80 to-white rounded-3xl border border-amber-200/60">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                {isArabic ? 'مرحلة دفع العربون' : 'Deposit Verification Stage'}
              </span>
              <h3 className="font-bold text-neutral-900 text-base">
                {isArabic ? 'توثيق استلام العربون بالوكالة' : 'Record Deposit Payment at Branch'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {isArabic
                  ? 'إذا قام الزبون بدفع العربون نقداً أو أحضر إيصال البريدي موب، يمكنك توثيق الدفع مباشرة لتثبيت الحجز.'
                  : 'If the customer paid cash at desk or brought a transfer receipt, verify and record payment here.'}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowDepositForm(!showDepositForm)}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <CreditCard className="w-4 h-4 inline me-1.5" />
              <span>{showDepositForm ? (isArabic ? 'إخفاء الاستمارة' : 'Close') : (isArabic ? 'تسجيل دفع العربون' : 'Record Deposit')}</span>
            </Button>
          </div>

          {showDepositForm && (
            <form
              action={depositAction}
              className="p-6 sm:p-8 bg-white border border-amber-500/20 rounded-3xl shadow-sm space-y-4 animate-apple-fade-in"
            >
              <input type="hidden" name="id" value={reservation.id} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  name="payment_method"
                  label={isArabic ? 'طريقة الدفع' : 'Payment Method'}
                  options={[
                    { value: 'cash', label: isArabic ? 'نقداً بالوكالة (Cash)' : 'Cash at Desk' },
                    { value: 'edahabia', label: isArabic ? 'البطاقة الذهبية (Edahabia)' : 'Edahabia Card' },
                    { value: 'cib', label: isArabic ? 'بطاقة CIB' : 'CIB Card' },
                    { value: 'baridimob', label: isArabic ? 'بريدي موب (BaridiMob)' : 'BaridiMob' },
                    { value: 'ccp', label: isArabic ? 'صك / حوالة CCP' : 'CCP Transfer' },
                  ]}
                  defaultValue="cash"
                  required
                />
                <Input
                  type="text"
                  name="payment_reference"
                  label={isArabic ? 'رقم الإيصال / المرجع' : 'Receipt / Reference No.'}
                  defaultValue="Desk Cash Payment"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isDepositing}
                  disabled={isDepositing}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <CreditCard className="w-4 h-4 inline me-1.5" />
                  <span>{isArabic ? 'تأكيد استلام العربون' : 'Confirm Deposit Paid'}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* STATE 3: HANDOVER VEHICLE & START RENTAL */}
      {canHandover && (
        <div className="pt-4 border-t border-black/[0.06] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50/80 to-white rounded-3xl border border-blue-200/60">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block mb-1">
                {isArabic ? 'الخطوة التالية: تسليم المركبة' : 'Next Step: Vehicle Pickup Handover'}
              </span>
              <h3 className="font-bold text-neutral-900 text-base">
                {isArabic ? 'تسليم المفاتيح وتوثيق محضر المعاينة (PV Handover)' : 'Handover Keys & Sign Digital Inspection PV'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {isArabic
                  ? 'عند حضور الزبون للوكالة لاستلام المركبة، سجل عداد الانطلاق ومستوى الوقود لتفعيل الكراء.'
                  : 'Record starting odometer and fuel level to generate digital PV and activate rental.'}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowHandoverForm(!showHandoverForm)}
              className="shrink-0"
            >
              <KeyRound className="w-4 h-4 inline me-1.5" />
              <span>{showHandoverForm ? (isArabic ? 'إخفاء الاستمارة' : 'Close Form') : (isArabic ? 'تسليم المركبة للزبون' : 'Start Handover')}</span>
            </Button>
          </div>

          {showHandoverForm && (
            <form
              action={startAction}
              className="p-6 sm:p-8 bg-white border border-brand-500/20 rounded-3xl shadow-sm space-y-4 animate-apple-fade-in"
            >
              <input type="hidden" name="reservation_id" value={reservation.id} />
              <input type="hidden" name="stage" value="pickup" />

              <div className="flex items-center gap-2 pb-2 border-b border-black/[0.04]">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
                <h4 className="font-bold text-neutral-900 text-sm">
                  {isArabic ? 'بيانات محضر تسليم المركبة (PV de mise à disposition)' : 'Vehicle Pickup Handover Form (PV)'}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  name="odometer_reading"
                  label={isArabic ? 'قراءة عداد السرعة بالكيلومتر (Km)' : 'Starting Odometer (Km)'}
                  placeholder="e.g. 45200"
                  defaultValue={45000}
                  required
                />
                <Select
                  name="fuel_level"
                  label={isArabic ? 'مستوى خزان الوقود' : 'Fuel Tank Level'}
                  options={fuelOptions}
                  defaultValue="full"
                  required
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-medium text-neutral-700 mb-1.5">
                  {isArabic ? 'ملاحظات المعاينة الأولية (حالة الهيكل، خدوش سابقة)' : 'Pre-existing Vehicle Condition / Notes'}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder={isArabic ? 'مركبة نظيفة بدون أي خدوش ظاهرة...' : 'Vehicle clean, no major scratches, spare tire present...'}
                  className="w-full text-sm bg-white border border-neutral-300 rounded-xl p-3 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="damage_noted"
                  name="damage_noted"
                  value="true"
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-neutral-300"
                />
                <label htmlFor="damage_noted" className="text-xs text-neutral-700 font-medium">
                  {isArabic ? 'يوجد خدش أو ضرر طفيف تم توثيقه مع الزبون' : 'Pre-existing scratch or minor damage noted with customer'}
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isStarting}
                  disabled={isStarting}
                >
                  <KeyRound className="w-4 h-4 inline me-1.5" />
                  <span>{isArabic ? 'تأكيد التسليم وتفعيل الكراء (Start Rental)' : 'Confirm Handover & Activate Rental'}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* STATE 3: ACTIVE (RETURN INSPECTION & COMPLETE RENTAL) */}
      {isActive && (
        <div className="pt-4 border-t border-black/[0.06] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-50/80 to-white rounded-3xl border border-emerald-200/60">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                {isArabic ? 'الكراء قيد النشاط (مركبة على الطريق)' : 'Rental Active (On Road)'}
              </span>
              <h3 className="font-bold text-neutral-900 text-base">
                {isArabic ? 'استرجاع المركبة وإتمام الحجز (PV Restitution)' : 'Vehicle Return & Final Inspection'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {isArabic
                  ? 'عند عودة الزبون، سجل عداد النهاية ومستوى الوقود للتأكد من سلامة المركبة وتحرير العربون.'
                  : 'Record final odometer reading and fuel level upon vehicle return to finalize booking and release deposit hold.'}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={() => setShowReturnForm(!showReturnForm)}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 inline me-1.5" />
              <span>{showReturnForm ? (isArabic ? 'إخفاء الاستمارة' : 'Close Form') : (isArabic ? 'استرجاع المركبة' : 'Complete Return')}</span>
            </Button>
          </div>

          {showReturnForm && (
            <form
              action={completeAction}
              className="p-6 sm:p-8 bg-white border border-emerald-500/20 rounded-3xl shadow-sm space-y-4 animate-apple-fade-in"
            >
              <input type="hidden" name="reservation_id" value={reservation.id} />
              <input type="hidden" name="stage" value="return" />

              <div className="flex items-center gap-2 pb-2 border-b border-black/[0.04]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-neutral-900 text-sm">
                  {isArabic ? 'محضر استرجاع المركبة النهائي (PV de restitution)' : 'Vehicle Return Inspection Form (PV)'}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  name="odometer_reading"
                  label={isArabic ? 'عداد السرعة عند الإرجاع (Km)' : 'Return Odometer (Km)'}
                  placeholder="e.g. 45850"
                  defaultValue={45800}
                  required
                />
                <Select
                  name="fuel_level"
                  label={isArabic ? 'مستوى خزان الوقود عند الإرجاع' : 'Return Fuel Tank Level'}
                  options={fuelOptions}
                  defaultValue="full"
                  required
                />
              </div>

              <div>
                <label htmlFor="return_notes" className="block text-xs font-medium text-neutral-700 mb-1.5">
                  {isArabic ? 'ملاحظات الفحص النهائي وسلامة التجهيزات' : 'Return Inspection Notes'}
                </label>
                <textarea
                  id="return_notes"
                  name="notes"
                  rows={2}
                  placeholder={isArabic ? 'المركبة سليمة، تم استلام الوثائق والمفاتيح...' : 'Vehicle returned intact, papers and keys verified...'}
                  className="w-full text-sm bg-white border border-neutral-300 rounded-xl p-3 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="return_damage_noted"
                  name="damage_noted"
                  value="true"
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-neutral-300"
                />
                <label htmlFor="return_damage_noted" className="text-xs text-neutral-700 font-medium">
                  {isArabic ? 'يوجد ضرر أو نقص بالوقود يستوجب اقتطاعاً من العربون' : 'New damage or fuel discrepancy noted (requires deposit deduction)'}
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isCompleting}
                  disabled={isCompleting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 inline me-1.5" />
                  <span>{isArabic ? 'إتمام الكراء وتحرير العربون (Complete Rental)' : 'Finalize Rental & Release Deposit'}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* STATE 4: COMPLETED */}
      {isCompleted && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">
              {isArabic ? 'تم إكمال هذا الكراء بنجاح' : 'Rental Completed Successfully'}
            </span>
            <span className="text-xs text-emerald-700">
              {isArabic
                ? 'تم استلام المركبة والوثائق كاملة وتحرير ضمان العربون.'
                : 'Vehicle returned intact, inspection reports archived, and deposit hold released.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
