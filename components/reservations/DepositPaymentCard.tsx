'use client';

import React, { useActionState } from 'react';
import { submitCustomerDeposit } from '@/lib/actions/reservations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CreditCard, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDZD } from '@/lib/utils/constants';
import type { Language } from '@/types';

export interface DepositPaymentCardProps {
  reservationId: string;
  depositAmount: number;
  depositDeadline?: string | null;
  locale: Language;
}

export function DepositPaymentCard({
  reservationId,
  depositAmount,
  depositDeadline,
  locale,
}: DepositPaymentCardProps) {
  const isArabic = locale === 'ar';
  const [state, formAction, isPending] = useActionState(submitCustomerDeposit, null);

  const paymentOptions = [
    {
      value: 'edahabia',
      label: isArabic ? 'البطاقة الذهبية (Edahabia / بريد الجزائر)' : 'Carte Edahabia (Algérie Poste)',
    },
    {
      value: 'cib',
      label: isArabic ? 'بطاقة بنكية CIB (Satim)' : 'Carte Bancaire CIB',
    },
    {
      value: 'baridimob',
      label: isArabic ? 'تطبيق بريدي موب (BaridiMob RIP)' : 'Virement BaridiMob',
    },
    {
      value: 'ccp',
      label: isArabic ? 'حوالة بريدية أو صك CCP' : 'Virement / Versement CCP',
    },
    {
      value: 'cash',
      label: isArabic ? 'دفع نقداً بوكالة الاستلام (Cash)' : 'Paiement en espèces à l’agence',
    },
  ];

  const formattedDeadline = depositDeadline
    ? new Date(depositDeadline).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="bg-gradient-to-br from-blue-50/70 via-white to-amber-50/40 p-6 sm:p-8 rounded-3xl border border-brand-500/20 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block">
              {isArabic ? 'الخطوة 2: دفع العربون المطلوب' : 'Step 2: Guarantee Deposit Payment'}
            </span>
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">
              {isArabic ? 'تأكيد الحجز بدفع مبلغ الضمان' : 'Secure Booking with Refundable Deposit'}
            </h3>
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-2xl border border-black/[0.06] shadow-2xs self-start sm:self-auto">
          <span className="text-[11px] text-neutral-400 block font-medium">
            {isArabic ? 'مبلغ العربون' : 'Deposit Amount'}
          </span>
          <span className="text-xl font-bold text-brand-600 tracking-tight">
            {formatDZD(depositAmount, locale)}
          </span>
        </div>
      </div>

      {/* 48h Deadline Alert */}
      {formattedDeadline && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {isArabic
              ? `مهلة السداد تنتهي في: ${formattedDeadline} (نافذة 48 ساعة لمنع إلغاء الحجز تلقائياً).`
              : `Deposit payment deadline: ${formattedDeadline} (48-hour window before reservation release).`}
          </span>
        </div>
      )}

      {/* Info Boxes: Bank RIP / Post Offices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
        <div className="p-3.5 bg-white/90 rounded-2xl border border-black/[0.04]">
          <span className="font-bold text-neutral-900 block mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isArabic ? 'بريدي موب / Algérie Poste' : 'BaridiMob / Algérie Poste'}</span>
          </span>
          <p className="font-mono text-[11px] text-neutral-800">
            RIP: <span className="font-semibold">007 99999 0023456789 42</span>
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {isArabic ? 'أدخل رقم الحجز في خانة الملاحظات' : 'Mention booking ID in transfer notes'}
          </p>
        </div>

        <div className="p-3.5 bg-white/90 rounded-2xl border border-black/[0.04]">
          <span className="font-bold text-neutral-900 block mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>{isArabic ? 'ضمان الاسترجاع الكامل' : '100% Refundable Guarantee'}</span>
          </span>
          <p className="text-[11px] text-neutral-500">
            {isArabic
              ? 'العربون مسترجع بالكامل فور تسليم السيارة وفحصها بنهاية فترة الكراء.'
              : 'Deposit is fully released/refunded upon vehicle return and inspection.'}
          </p>
        </div>
      </div>

      {/* Feedback Messages */}
      {state?.error && (
        <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isArabic
              ? 'تم تسجيل بيانات العربون بنجاح! تم تثبيت حجزك بانتظار استلام السيارة.'
              : 'Deposit payment recorded successfully! Your vehicle is secured for pickup.'}
          </span>
        </div>
      )}

      {/* Payment Submit Form */}
      <form action={formAction} className="bg-white p-5 sm:p-6 rounded-2xl border border-black/[0.06] space-y-4 shadow-2xs">
        <input type="hidden" name="reservation_id" value={reservationId} />

        <h4 className="font-bold text-neutral-900 text-sm">
          {isArabic ? 'تسجيل إيصال أو عملية دفع العربون' : 'Submit Deposit Payment Reference'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            name="payment_method"
            label={isArabic ? 'طريقة الدفع' : 'Payment Method'}
            options={paymentOptions}
            defaultValue="edahabia"
            required
          />

          <Input
            type="text"
            name="payment_reference"
            label={isArabic ? 'رقم الإيصال / الرقم المرجعي للعملية' : 'Receipt No. / Transaction Reference'}
            placeholder={isArabic ? 'مثال: TXN-9842145 أو إيصال بريد' : 'e.g. TXN-9842145 or receipt no.'}
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <CreditCard className="w-4 h-4 inline me-1.5" />
            <span>
              {isArabic
                ? `تأكيد دفع العربون (${formatDZD(depositAmount, locale)})`
                : `Submit Deposit Payment (${formatDZD(depositAmount, locale)})`}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
