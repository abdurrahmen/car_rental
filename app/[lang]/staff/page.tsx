import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { ReservationTable } from '@/components/dashboard/ReservationTable';
import type { Language, Reservation } from '@/types';

interface StaffOverviewPageProps {
  params: Promise<{ lang: string }>;
}

export default async function StaffOverviewPage({
  params,
}: StaffOverviewPageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user?.id || '')
    .single();

  let query = supabase
    .from('reservations')
    .select('*, vehicle:vehicles(*), customer:profiles!customer_id(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (profile?.role !== 'admin' && profile?.branch_id) {
    query = query.eq('pickup_branch_id', profile.branch_id);
  }

  const { data: pending } = await query;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold text-brand-900">
          {dict.staff.pending_requests}
        </h1>
        <span className="bg-warning-100 text-warning-800 text-xs font-semibold px-2.5 py-1 rounded-full">
          {pending?.length || 0} Pending
        </span>
      </div>

      <ReservationTable
        reservations={(pending as unknown as Reservation[]) || []}
        locale={locale}
        dictionary={dict}
        showCustomer={true}
        baseActionPath={`/${lang}/staff/reservations`}
      />
    </div>
  );
}
