/**
 * DZRent Number and Currency Formatters
 * Consistent formatting across dashboard, charts, tooltips, badges
 */

import type { Language } from '@/types';
import type { PaymentMethod } from './design-tokens';
import { PAYMENT_METHODS } from './design-tokens';

/**
 * Format money in DZD with non-breaking space grouping
 * Examples: "868 000 دج", "25 000 DZD"
 * Used by: KPIs, revenue charts, payment splits, tooltips
 */
export function formatMoney(amount: number, locale: Language = 'ar'): string {
  // Use French/Algerian standard grouping with Latin numerals
  const formattedNumber = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  })
    .format(amount)
    .replace(/\s/g, '\u00A0'); // non-breaking space

  if (locale === 'ar') {
    return `${formattedNumber}\u00A0دج`;
  } else if (locale === 'fr') {
    return `${formattedNumber}\u00A0DZD`;
  }
  return `${formattedNumber}\u00A0DZD`;
}

/**
 * Format compact numbers for space-constrained displays
 * Examples: "1.2K", "25K", "1.5M"
 */
export function formatCompact(amount: number, locale: Language = 'ar'): string {
  const localeCode = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-GB';
  return new Intl.NumberFormat(localeCode, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Format regular numbers with grouping (no currency)
 * Example: "1 234" for counts, IDs, etc.
 */
export function formatNumber(value: number, locale: Language = 'ar'): string {
  return new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  })
    .format(value)
    .replace(/\s/g, '\u00A0');
}

/**
 * Format percentage with optional decimal places
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format date using Intl with active locale
 */
export function formatDate(date: string | Date, locale: Language = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeCode = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-GB';
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format short date (day/month)
 */
export function formatShortDate(date: string | Date, locale: Language = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeCode = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-GB';
  return new Intl.DateTimeFormat(localeCode, {
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format time (HH:MM) - 24-hour format
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-DZ', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Format weekday name (short)
 * Used by availability grid - respects locale and week starts Saturday
 */
export function formatWeekday(date: Date, locale: Language = 'ar', length: 'short' | 'narrow' = 'short'): string {
  const localeCode = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-GB';
  return new Intl.DateTimeFormat(localeCode, {
    weekday: length,
  }).format(date);
}

/**
 * Get localized payment method name
 */
export function getPaymentMethodName(method: PaymentMethod, locale: Language): string {
  return PAYMENT_METHODS[method][locale];
}

/**
 * Normalize Algerian phone number for tel:, sms:, WhatsApp links
 * Convert leading 0 to +213
 * Examples: "0550123456" → "+213550123456"
 */
export function normalizeAlgerianPhone(phone: string): string {
  // Remove all whitespace and special chars
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // If starts with 0, replace with +213
  if (cleaned.startsWith('0')) {
    return `+213${cleaned.slice(1)}`;
  }

  // If starts with 213, add +
  if (cleaned.startsWith('213')) {
    return `+${cleaned}`;
  }

  // If already has +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Otherwise assume it's missing country code
  return `+213${cleaned}`;
}

/**
 * Format relative time from ISO string or Date
 * Examples: "الآن", "منذ 5 دقيقة", "منذ 3 ساعة", "منذ 2 يوم"
 */
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

/**
 * Calculate duration in minutes between two dates
 */
export function getDurationMinutes(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
}

/**
 * Format overdue duration as human-readable string
 * Examples: "متأخر 3 أيام", "En retard de 5 heures"
 */
export function formatOverdueDuration(minutes: number, locale: Language): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    if (locale === 'ar') return `متأخر ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    if (locale === 'fr') return `En retard de ${days} jour${days > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''} overdue`;
  }

  if (hours > 0) {
    if (locale === 'ar') return `متأخر ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    if (locale === 'fr') return `En retard de ${hours} heure${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} overdue`;
  }

  if (locale === 'ar') return `متأخر ${minutes} دقيقة`;
  if (locale === 'fr') return `En retard de ${minutes} min`;
  return `${minutes} min overdue`;
}
