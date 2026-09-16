import React from 'react';
import Link from 'next/link';
import type { Language, Dictionary } from '@/types';

export interface FooterProps {
  locale?: Language;
  lang?: Language;
  dictionary?: Dictionary;
  dict?: Dictionary;
}

export function Footer({ locale, lang, dictionary, dict }: FooterProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language;
  const effectiveDict = dictionary || dict;
  const appName = effectiveDict?.common?.app_name || 'DZ Rent';

  return (
    <footer className="bg-brand-950 text-neutral-400 py-8 border-t border-brand-900 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-4">
          &copy; {new Date().getFullYear()} {appName}.{' '}
          {effectiveLocale === 'ar'
            ? 'جميع الحقوق محفوظة'
            : effectiveLocale === 'fr'
              ? 'Tous droits réservés'
              : 'All rights reserved'}
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <Link
            href={`/${effectiveLocale}/vehicles`}
            className="hover:text-white transition-colors min-h-[44px] flex items-center px-2"
          >
            {effectiveDict?.vehicles?.browse_vehicles || 'Vehicles'}
          </Link>
          <Link
            href={`/${effectiveLocale}/login`}
            className="hover:text-white transition-colors min-h-[44px] flex items-center px-2"
          >
            {effectiveDict?.auth?.login || 'Login'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
