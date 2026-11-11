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

/** Currency formatting for DZD with non-breaking space and consistent presentation */
export function formatDZD(amount: number, locale: Language = 'ar'): string {
  // Use French/Algerian standard grouping with Latin numerals as common in Algerian banking
  const formattedNumber = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s/g, '\u00A0');

  if (locale === 'ar') {
    return `${formattedNumber}\u00A0دج`;
  } else if (locale === 'fr') {
    return `${formattedNumber}\u00A0DZD`;
  }
  return `${formattedNumber}\u00A0DZD`;
}

/** Format pure numbers with locale */
export function formatCompactNumber(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Get current time-of-day segment for the hero backdrop */
export type TimeOfDay = 'dawn' | 'day' | 'golden' | 'night';
export function getTimeOfDay(hour?: number): TimeOfDay {
  const currentHour = hour !== undefined ? hour : new Date().getHours();
  if (currentHour >= 5 && currentHour < 9) return 'dawn';
  if (currentHour >= 9 && currentHour < 17) return 'day';
  if (currentHour >= 17 && currentHour < 20) return 'golden';
  return 'night';
}

/** Get greeting key based on current hour */
export function getGreetingKey(hour?: number): 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening' {
  const currentHour = hour !== undefined ? hour : new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return 'greeting_morning';
  if (currentHour >= 12 && currentHour < 17) return 'greeting_afternoon';
  return 'greeting_evening';
}

/** Format relative time from ISO string */
export function formatRelativeTime(dateInput: string | Date, locale: Language = 'ar'): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) {
    if (locale === 'ar') return 'الآن';
    if (locale === 'fr') return "À l'instant";
    return 'Just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    if (locale === 'ar') return `منذ ${diffMin} دقيقة`;
    if (locale === 'fr') return `il y a ${diffMin} min`;
    return `${diffMin} min ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    if (locale === 'ar') return `منذ ${diffHours} ساعة`;
    if (locale === 'fr') return `il y a ${diffHours} h`;
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (locale === 'ar') return `منذ ${diffDays} يوم`;
  if (locale === 'fr') return `il y a ${diffDays} j`;
  return `${diffDays}d ago`;
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

/** Format short time HH:MM */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-DZ', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
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

