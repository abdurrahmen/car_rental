import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import Link from 'next/link';
import type { Language } from '@/types';

interface AdminOverviewPageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminOverviewPage({
  params,
}: AdminOverviewPageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { count: vehicleCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true });
  const { count: reservationCount } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true });
  const { count: activeCount } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  const { count: branchCount } = await supabase
    .from('branches')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-brand-900">
          {dict.admin.admin_dashboard}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          System-wide performance, fleet statistics, and branch management.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brand-50 border border-brand-100 p-6 rounded-xl">
          <p className="text-brand-600 text-sm font-medium">
            {dict.staff.vehicle_management}
          </p>
          <p className="text-3xl font-heading font-bold text-brand-900 mt-2">
            {vehicleCount || 0}
          </p>
        </div>

        <div className="bg-info-50 border border-info-100 p-6 rounded-xl">
          <p className="text-info-700 text-sm font-medium">
            {dict.admin.all_reservations}
          </p>
          <p className="text-3xl font-heading font-bold text-info-900 mt-2">
            {reservationCount || 0}
          </p>
        </div>

        <div className="bg-success-50 border border-success-100 p-6 rounded-xl">
          <p className="text-success-700 text-sm font-medium">
            {dict.dashboard.active_rentals}
          </p>
          <p className="text-3xl font-heading font-bold text-success-800 mt-2">
            {activeCount || 0}
          </p>
        </div>

        <div className="bg-accent-50 border border-accent-100 p-6 rounded-xl">
          <p className="text-accent-800 text-sm font-medium">
            {dict.admin.manage_branches}
          </p>
          <p className="text-3xl font-heading font-bold text-accent-900 mt-2">
            {branchCount || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link
          href={`/${lang}/admin/branches`}
          className="p-6 bg-card border border-neutral-200 rounded-xl hover:border-accent-500 hover:shadow-md transition-all block"
        >
          <h3 className="font-heading font-bold text-lg text-brand-900 mb-2">
            🏢 {dict.admin.manage_branches}
          </h3>
          <p className="text-sm text-neutral-600">
            Create and edit rental agency branches across Algerian wilayas.
          </p>
        </Link>

        <Link
          href={`/${lang}/admin/staff`}
          className="p-6 bg-card border border-neutral-200 rounded-xl hover:border-accent-500 hover:shadow-md transition-all block"
        >
          <h3 className="font-heading font-bold text-lg text-brand-900 mb-2">
            👥 {dict.admin.manage_staff}
          </h3>
          <p className="text-sm text-neutral-600">
            Create staff accounts, assign branch managers, and manage permissions.
          </p>
        </Link>

        <Link
          href={`/${lang}/admin/reservations`}
          className="p-6 bg-card border border-neutral-200 rounded-xl hover:border-accent-500 hover:shadow-md transition-all block"
        >
          <h3 className="font-heading font-bold text-lg text-brand-900 mb-2">
            📑 {dict.admin.all_reservations}
          </h3>
          <p className="text-sm text-neutral-600">
            View full audit logs and active reservations across all branches.
          </p>
        </Link>
      </div>
    </div>
  );
}
