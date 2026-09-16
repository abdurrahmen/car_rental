import type { ReservationStatus, VehicleStatus, Language } from '@/types';

/** Reservation status flow and metadata */
export const RESERVATION_STATUSES: Record<
  ReservationStatus,
  { label: { ar: string; fr: string; en: string }; color: string }
> = {
  pending: {
    label: { ar: 'قيد الانتظار', fr: 'En attente', en: 'Pending' },
    color: 'warning',
  },
  confirmed: {
    label: { ar: 'مؤكد', fr: 'Confirmé', en: 'Confirmed' },
    color: 'info',
  },
  deposit_paid: {
    label: { ar: 'تم دفع العربون', fr: 'Acompte payé', en: 'Deposit Paid' },
    color: 'info',
  },
  active: {
    label: { ar: 'نشط', fr: 'Actif', en: 'Active' },
    color: 'success',
  },
  completed: {
    label: { ar: 'مكتمل', fr: 'Terminé', en: 'Completed' },
    color: 'success',
  },
  cancelled: {
    label: { ar: 'ملغى', fr: 'Annulé', en: 'Cancelled' },
    color: 'neutral',
  },
  no_show: {
    label: { ar: 'لم يحضر', fr: 'Non présenté', en: 'No Show' },
    color: 'danger',
  },
};

/** Vehicle status metadata */
export const VEHICLE_STATUSES: Record<
  VehicleStatus,
  { label: { ar: string; fr: string; en: string } }
> = {
  available: {
    label: { ar: 'متاح', fr: 'Disponible', en: 'Available' },
  },
  rented: {
    label: { ar: 'مؤجر', fr: 'Loué', en: 'Rented' },
  },
  maintenance: {
    label: { ar: 'في الصيانة', fr: 'En maintenance', en: 'Maintenance' },
  },
  retired: {
    label: { ar: 'متقاعد', fr: 'Retiré', en: 'Retired' },
  },
};

/** Supported locales */
export const LOCALES: Language[] = ['ar', 'fr', 'en'];
export const DEFAULT_LOCALE: Language = 'ar';

/** RTL languages */
export const RTL_LOCALES: Language[] = ['ar'];

/** Check if a locale uses RTL direction */
export function isRtl(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Language);
}

/** Get localized name from an entity with name_ar, name_fr, name_en fields */
export function getLocalizedName(
  entity: { name_ar: string; name_fr: string; name_en: string },
  locale: Language,
): string {
  const key = `name_${locale}` as const;
  return entity[key];
}

/** Default deposit deadline in hours after confirmation */
export const DEFAULT_DEPOSIT_DEADLINE_HOURS = 48;

/** Deposit amount in DZD if not set per vehicle */
export const DEFAULT_DEPOSIT_AMOUNT = 5000;

/** Currency formatting for DZD */
export function formatDZD(amount: number, locale: Language = 'ar'): string {
  const formatted = new Intl.NumberFormat(
    locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-DZ',
    {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(amount);
  return formatted;
}

/** Date formatting */
export function formatDate(date: string, locale: Language = 'ar'): string {
  return new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-GB',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  ).format(new Date(date));
}

/** Calculate rental days between two dates */
export function calculateRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/** Get vehicle photo URL from storage path or external URL */
export function getPhotoUrl(photo?: { storage_path?: string; photo_url?: string } | null): string {
  if (!photo) return '';
  if (photo.photo_url) return photo.photo_url;
  if (!photo.storage_path) return '';
  if (photo.storage_path.startsWith('http://') || photo.storage_path.startsWith('https://')) {
    return photo.storage_path;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/vehicle-photos/${photo.storage_path}`;
}
