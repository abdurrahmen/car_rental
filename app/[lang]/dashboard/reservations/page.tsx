import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { ReservationTable } from '@/components/dashboard/ReservationTable';
import type { Language, Reservation } from '@/types';

import { getAuthUser } from '@/lib/auth';

interface ReservationsPageProps {
  params: Promise<{ lang: string }>;
}

export default async function ReservationsPage({
  params,
}: ReservationsPageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const user = await getAuthUser();

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), branch:branches(*)')
    .eq('customer_id', user?.id || 'd0000000-0000-0000-0000-000000000001')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-neutral-900 tracking-tight mb-6">
        {dict.reservations.my_reservations}
      </h1>
      <ReservationTable
        reservations={(reservations as unknown as Reservation[]) || []}
        locale={locale}
        dictionary={dict}
        showCustomer={false}
      />
    </div>
  );
}
