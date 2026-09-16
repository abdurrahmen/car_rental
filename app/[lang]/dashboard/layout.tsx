import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import type { Language } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header locale={locale} dictionary={dict} />
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          <div className="bg-card p-4 rounded-xl border border-neutral-200 shadow-sm space-y-1">
            <Link
              href={`/${lang}/dashboard`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.dashboard.overview}
            </Link>
            <Link
              href={`/${lang}/dashboard/reservations`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.dashboard.my_reservations}
            </Link>
            <Link
              href={`/${lang}/dashboard/profile`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.dashboard.profile}
            </Link>
          </div>
        </aside>
        <main className="flex-1 bg-card p-6 rounded-xl shadow-sm border border-neutral-200">
          {children}
        </main>
      </div>
    </div>
  );
}
