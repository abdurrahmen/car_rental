import React from 'react'
import Link from 'next/link'
import type { Language } from '@/types'

export interface LogoProps {
  variant?: 'full' | 'mark' | 'vertical'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  locale?: Language
  href?: string
}

/**
 * Apple-style Precision Automotive Mobility Logo for "DZ Rent".
 * Features a sleek aerodynamic silhouette, highway curve, and refined typography.
 */
export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  locale = 'ar',
  href,
}: LogoProps) {
  const sizeMap = {
    sm: {
      box: 'w-7 h-7',
      icon: 28,
      title: 'text-base',
      subtitle: 'text-[9px]',
    },
    md: {
      box: 'w-8 h-8',
      icon: 32,
      title: 'text-lg',
      subtitle: 'text-[10px]',
    },
    lg: {
      box: 'w-10 h-10',
      icon: 40,
      title: 'text-xl',
      subtitle: 'text-xs',
    },
    xl: {
      box: 'w-14 h-14',
      icon: 56,
      title: 'text-2xl',
      subtitle: 'text-xs',
    },
  }[size]

  // Pure SVG Emblem Mark
  const Emblem = (
    <div
      className={`relative ${sizeMap.box} rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0077ED] via-[#0071E3] to-[#0055B3] p-[1.5px] shadow-[0_2px_8px_rgba(0,113,227,0.3)] shrink-0 group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
    >
      {/* Inner glass shine */}
      <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-b from-white/20 via-transparent to-black/15 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[82%] h-[82%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
        >
          {/* Subtle highway perspective arc */}
          <path
            d="M5 29C11 26 25 26 31 29"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />

          {/* Aerodynamic car roofline & silhouette */}
          <path
            d="M6 23.5L9.8 17.2C10.6 15.9 12 15 13.5 15H22.5C24 15 25.4 15.9 26.2 17.2L30 23.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Precision windshield pillar */}
          <path
            d="M17.5 15.5V23"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />

          {/* Speed line & front headlight accent */}
          <path
            d="M4 23.5H32C32.8 23.5 33.5 24.2 33.3 25L32.2 28.2C32 28.7 31.5 29 31 29H5C4.5 29 4 28.7 3.8 28.2L2.7 25C2.5 24.2 3.2 23.5 4 23.5Z"
            fill="white"
          />

          {/* Stylized headlight glow */}
          <circle cx="7" cy="26" r="1.4" fill="#F59E0B" />
          <circle cx="29" cy="26" r="1.4" fill="#F59E0B" />

          {/* Minimalist central DZ monogram accent */}
          <text
            x="18"
            y="11.5"
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="900"
            letterSpacing="-0.5"
            fontFamily="system-ui, sans-serif"
          >
            DZ
          </text>
        </svg>
      </div>
    </div>
  )

  if (variant === 'mark') {
    return href ? (
      <Link href={href} className={`inline-flex group ${className}`} aria-label="DZ Rent">
        {Emblem}
      </Link>
    ) : (
      <div className={`inline-flex group ${className}`}>{Emblem}</div>
    )
  }

  const isArabic = locale === 'ar'

  const Content = (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        variant === 'vertical' ? 'flex-col text-center' : ''
      } ${className}`}
    >
      {Emblem}

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={`font-bold tracking-tight text-neutral-900 dark:text-white ${sizeMap.title}`}>
            DZ<span className="text-brand-500">Rent</span>
          </span>
        </div>
        <span
          className={`font-medium tracking-normal text-neutral-400 dark:text-neutral-500 mt-1 ${sizeMap.subtitle}`}
        >
          {isArabic ? 'كراء السيارات بالجزائر' : 'Car Rental Algeria'}
        </span>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center min-h-[44px]">
        {Content}
      </Link>
    )
  }

  return Content
}
