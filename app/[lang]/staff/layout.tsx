import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import type { Language, Branch } from '@/types';

interface StaffLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function StaffLayout({
  children,
  params,
}: StaffLayoutProps) {
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
    .select('role, branch_id, branch:branches(*)')
    .eq('id', user.id)
    .single();

  if (
    !profile ||
    (profile.role !== 'staff' &&
      profile.role !== 'branch_manager' &&
      profile.role !== 'admin')
  ) {
    redirect(`/${lang}`);
  }

  const branch = profile.branch as unknown as Branch | null;
  const branchName = branch
    ? locale === 'ar'
      ? branch.name_ar
      : locale === 'fr'
        ? branch.name_fr
        : branch.name_en
    : 'All Branches (Admin)';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header locale={locale} dictionary={dict} />
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-3">
          <div className="bg-card p-4 rounded-xl border border-neutral-200 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
              {dict.staff.staff_dashboard}
            </span>
            <span className="text-sm font-bold text-brand-900 block mt-1">
              {branchName}
            </span>
            <span className="text-xs text-accent-600 font-medium capitalize">
              Role: {profile.role}
            </span>
          </div>

          <div className="bg-card p-3 rounded-xl border border-neutral-200 shadow-sm space-y-1">
            <Link
              href={`/${lang}/staff`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.staff.pending_requests}
            </Link>
            <Link
              href={`/${lang}/staff/vehicles`}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 text-neutral-800 transition-colors min-h-[44px] flex items-center"
            >
              {dict.staff.vehicle_management}
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
