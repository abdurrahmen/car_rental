import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { Language, Dictionary } from '@/types';

export interface HeaderProps {
  locale?: Language;
  lang?: Language;
  dictionary?: Dictionary;
  dict?: Dictionary;
}

export async function Header({ locale, lang, dictionary, dict }: HeaderProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language;
  const effectiveDict = dictionary || dict;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appName = effectiveDict?.common?.app_name || 'DZ Rent';
  const browseVehicles =
    effectiveDict?.vehicles?.browse_vehicles || 'Vehicles';
  const loginText = effectiveDict?.auth?.login || 'Login';
  const dashboardText = effectiveDict?.nav?.dashboard || 'Dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-900 text-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${effectiveLocale}`}
            className="text-xl font-heading font-bold text-accent-500 flex items-center min-h-[44px]"
          >
            {appName}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`/${effectiveLocale}/vehicles`}
            className="hover:text-accent-400 font-medium min-h-[44px] flex items-center"
          >
            {browseVehicles}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={effectiveLocale} />

          <div className="hidden md:flex items-center">
            {user ? (
              <Link
                href={`/${effectiveLocale}/dashboard`}
                className="bg-brand-800 hover:bg-brand-700 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] flex items-center"
              >
                {dashboardText}
              </Link>
            ) : (
              <Link
                href={`/${effectiveLocale}/login`}
                className="bg-accent-500 text-brand-900 hover:bg-accent-400 px-4 py-2 rounded-lg font-bold transition-colors min-h-[44px] flex items-center"
              >
                {loginText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
