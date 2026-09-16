import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import type { Language } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect(`/${lang}/dashboard`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header locale={locale} dictionary={dict} />
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-3">
          <div className="bg-brand-900 text-white p-4 rounded-xl shadow-sm">
            <span className="text-xs uppercase tracking-wider text-accent-400 font-semibold block">
              System Admin
            </span>
            <span className="text-base font-bold block mt-1">
              {dict.admin.admin_dashboard}
            </span>
          </div>

          <div className="bg-card p-3 rounded-xl border border-neutral-200 shadow-sm space-y-1">
            <Link
              href={`/${lang}/admin`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.dashboard.overview}
            </Link>
            <Link
              href={`/${lang}/admin/branches`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.admin.manage_branches}
            </Link>
            <Link
              href={`/${lang}/admin/staff`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.admin.manage_staff}
            </Link>
            <Link
              href={`/${lang}/admin/reservations`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.admin.all_reservations}
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
