/**
 * DZRent Semantic Design Tokens
 * Algeria car rental platform - Arabic-first, RTL-aware
 */

export const SEMANTIC_COLORS = {
  // Primary brand blue - actions, links, focus, selected nav only
  brand: {
    DEFAULT: '#0071E3',
    hover: '#0062C4',
    active: '#004FA1',
    bg: '#F5F9FF',
    bgHover: '#E6F0FE',
    border: '#C7DEFD',
  },

  // Status colors with WCAG AA contrast
  status: {
    success: {
      DEFAULT: '#10B981', // emerald-500
      bg: '#ECFDF5', // emerald-50
      bgSubtle: '#D1FAE5', // emerald-100
      border: '#A7F3D0', // emerald-200
      text: '#065F46', // emerald-900
    },
    warning: {
      DEFAULT: '#F59E0B', // amber-500
      bg: '#FFFBEB', // amber-50
      bgSubtle: '#FEF3C7', // amber-100
      border: '#FDE68A', // amber-200
      text: '#78350F', // amber-900
    },
    danger: {
      DEFAULT: '#EF4444', // red-500
      bg: '#FEF2F2', // red-50
      bgSubtle: '#FEE2E2', // red-100
      border: '#FECACA', // red-200
      text: '#991B1B', // red-800
    },
    neutral: {
      DEFAULT: '#6B7280', // gray-500
      bg: '#F9FAFB', // gray-50
      bgSubtle: '#F3F4F6', // gray-100
      border: '#E5E7EB', // gray-200
      text: '#374151', // gray-700
    },
    // "Rented" gets distinct violet (not brand blue)
    rented: {
      DEFAULT: '#8B5CF6', // violet-500
      bg: '#F5F3FF', // violet-50
      bgSubtle: '#EDE9FE', // violet-100
      border: '#DDD6FE', // violet-200
      text: '#5B21B6', // violet-800
    },
  },

  // Neutral surfaces
  surface: {
    canvas: '#F6F7F9', // soft neutral canvas
    card: '#FFFFFF', // white elevated cards
    cardHover: '#FAFAFA',
    muted: '#F9FAFB', // subtle backgrounds
    border: 'rgba(0, 0, 0, 0.06)',
    borderStrong: 'rgba(0, 0, 0, 0.12)',
  },

  // Text hierarchy
  text: {
    primary: '#1D1D1F', // Apple obsidian
    secondary: '#6B7280', // gray-500
    tertiary: '#9CA3AF', // gray-400
    disabled: '#D1D5DB', // gray-300
    inverse: '#FFFFFF',
  },
} as const;

// Severity tiers for attention items
export const SEVERITY_TIERS = {
  urgent: {
    threshold: 7 * 24 * 60, // > 7 days in minutes
    color: 'danger',
    buttonVariant: 'solid' as const,
  },
  high: {
    threshold: 24 * 60, // > 24 hours
    color: 'warning',
    buttonVariant: 'outline' as const,
  },
  medium: {
    threshold: 2 * 60, // > 2 hours
    color: 'warning',
    buttonVariant: 'outline' as const,
  },
} as const;

// Utilization targets and thresholds
export const UTILIZATION_TARGET = 75; // percent
export const UTILIZATION_THRESHOLDS = {
  danger: 0.7, // below 70% of target (52.5%)
  warning: 0.99, // 70–99% of target (52.5–74.25%)
  success: 1.0, // at or above target (75%+)
} as const;

// Type scale (ensuring minimum 12px/13px for Arabic)
export const TYPE_SCALE = {
  xs: '0.75rem', // 12px
  sm: '0.8125rem', // 13px - preferred for Arabic body
  base: '0.875rem', // 14px
  lg: '1rem', // 16px
  xl: '1.125rem', // 18px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem', // 24px
  '4xl': '1.875rem', // 30px - KPI numbers
  '5xl': '2.25rem', // 36px
} as const;

// Line heights for Arabic text
export const LINE_HEIGHTS = {
  tight: 1.25,
  normal: 1.5,
  arabic: 1.6, // Arabic body text
  relaxed: 1.75,
} as const;

// Payment method labels (localized)
export const PAYMENT_METHODS = {
  cash: { ar: 'نقدا', fr: 'Espèces', en: 'Cash' },
  baridimob: { ar: 'بريدي موب', fr: 'BaridiMob', en: 'BaridiMob' },
  ccp: { ar: 'سي سي بي', fr: 'CCP', en: 'CCP' },
  edahabia: { ar: 'الذهبية', fr: 'Edahabia', en: 'Edahabia' },
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;
