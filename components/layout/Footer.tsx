import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import type { Language, Dictionary } from '@/types'

export interface FooterProps {
  locale?: Language
  lang?: Language
  dictionary?: Dictionary
  dict?: Dictionary
}

/**
 * Apple-style minimalist footer with generous spacing and hairline borders.
 */
export function Footer({ locale, lang, dictionary, dict }: FooterProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language
  const effectiveDict = dictionary || dict

  return (
    <footer className="mt-auto border-t border-black/[0.06] bg-neutral-100/60 text-neutral-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo href={`/${effectiveLocale}`} locale={effectiveLocale} size="sm" />
            <span className="text-xs text-neutral-400">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <Link
              href={`/${effectiveLocale}/vehicles`}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {effectiveDict?.vehicles?.browse_vehicles || 'Browse Fleet'}
            </Link>
            <Link
              href={`/${effectiveLocale}/login`}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {effectiveDict?.auth?.login || 'Sign In'}
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-400">
              {effectiveLocale === 'ar'
                ? 'منصة كراء السيارات الأولى في الجزائر • دفع إلكتروني ونقدي'
                : effectiveLocale === 'fr'
                ? 'Plateforme de location de véhicules en Algérie • CIB / Edahabia / Espèces'
                : 'Premier Algerian Vehicle Rental Platform • CIB / Edahabia / Cash'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
