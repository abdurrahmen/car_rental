import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { ReservationTable } from '@/components/dashboard/ReservationTable';
import type { Language, Reservation } from '@/types';

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), branch:branches(*)')
    .eq('customer_id', user?.id || '')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-brand-900 mb-6">
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
