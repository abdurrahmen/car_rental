import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { ReservationTable } from '@/components/dashboard/ReservationTable';
import Link from 'next/link';
import type { Language, Reservation } from '@/types';

interface DashboardOverviewProps {
  params: Promise<{ lang: string }>;
}

export default async function DashboardOverview({
  params,
}: DashboardOverviewProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), branch:branches(*)')
    .eq('customer_id', user?.id || '')
    .order('created_at', { ascending: false })
    .limit(5);

  const active =
    reservations?.filter((r) => r.status === 'active').length || 0;
  const pending =
    reservations?.filter((r) => r.status === 'pending').length || 0;

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-brand-900 mb-6">
        {dict.dashboard.overview}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-50 border border-brand-100 p-6 rounded-xl">
          <p className="text-brand-600 text-sm font-medium">
            {dict.dashboard.total_reservations}
          </p>
          <p className="text-3xl font-heading font-bold text-brand-900 mt-2">
            {reservations?.length || 0}
          </p>
        </div>
        <div className="bg-success-50 border border-success-100 p-6 rounded-xl">
          <p className="text-success-700 text-sm font-medium">
            {dict.dashboard.active_rentals}
          </p>
          <p className="text-3xl font-heading font-bold text-success-800 mt-2">
            {active}
          </p>
        </div>
        <div className="bg-warning-50 border border-warning-100 p-6 rounded-xl">
          <p className="text-warning-800 text-sm font-medium">
            {dict.dashboard.pending_requests}
          </p>
          <p className="text-3xl font-heading font-bold text-warning-900 mt-2">
            {pending}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-heading font-bold text-brand-900">
            {dict.reservations.my_reservations}
          </h2>
          <Link
            href={`/${lang}/dashboard/reservations`}
            className="text-accent-600 hover:text-accent-700 font-semibold text-sm min-h-[44px] flex items-center"
          >
            {dict.vehicles.browse_vehicles} →
          </Link>
        </div>
        <ReservationTable
          reservations={(reservations as unknown as Reservation[]) || []}
          locale={locale}
          dictionary={dict}
          showCustomer={false}
        />
      </div>
    </div>
  );
}
