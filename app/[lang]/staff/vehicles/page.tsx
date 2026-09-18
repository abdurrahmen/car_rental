import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDZD } from '@/lib/utils/constants';
import type { Language } from '@/types';

import { getAuthUser } from '@/lib/auth';

interface StaffVehiclesPageProps {
  params: Promise<{ lang: string }>;
}

export default async function StaffVehiclesPage({
  params,
}: StaffVehiclesPageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const user = await getAuthUser();
  const branchId = user?.branch_id || '10000000-0000-0000-0000-000000000001';

  let query = supabase
    .from('vehicles')
    .select('*, branch:branches(*), category:vehicle_categories(*)')
    .order('created_at', { ascending: false });

  if (user?.role !== 'admin' && branchId) {
    query = query.eq('branch_id', branchId);
  }

  const { data: vehicles } = await query;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'info';
      case 'maintenance':
        return 'warning';
      case 'retired':
        return 'neutral';
      default:
        return 'default';
    }
  };

  const isArabic = locale === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {dict.staff.vehicle_management}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isArabic
              ? 'إدارة مركبات الوكالة، فحص الجاهزية، وتحديث الأسعار اليومية.'
              : 'Manage your branch fleet availability, maintenance, and vehicle rates.'}
          </p>
        </div>
        <Link
          href={`/${lang}/staff/vehicles/new`}
          className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[42px]"
        >
          <span className="text-base leading-none">+</span>
          <span>{dict.staff.add_vehicle}</span>
        </Link>
      </div>

      <div className="grid gap-4">
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="p-6 bg-white border border-black/[0.06] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] hover:shadow-md transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base text-neutral-900">
                    {v.make} {v.model} ({v.year})
                  </h3>
                  <Badge variant={getStatusBadgeVariant(v.status)}>
                    {v.status}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500">
                  Plate: <span className="font-mono font-bold text-neutral-700">{v.plate_number}</span> ·{' '}
                  {v.transmission} · {v.seats} seats · {v.fuel_type}
                </p>
                <p className="text-sm font-extrabold text-brand-600">
                  {formatDZD(v.daily_rate, locale)}{' '}
                  <span className="text-xs font-normal text-neutral-400">/ {dict.vehicles.per_day}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/${lang}/staff/vehicles/${v.id}`}
                  className="apple-press px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
                >
                  {dict.common.edit}
                </Link>
                <Link
                  href={`/${lang}/vehicles/${v.id}`}
                  className="apple-press px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
                  target="_blank"
                >
                  Preview ↗
                </Link>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon="car"
            title={dict.vehicles?.no_vehicles_found || 'No vehicles registered yet'}
            description={
              isArabic
                ? 'لم يتم تسجيل أي مركبات في هذا الفرع بعد. أضف سيارتك الأولى لبدء التأجير.'
                : 'No vehicles registered in this branch yet. Add your first vehicle to begin renting.'
            }
            action={{
              label: `+ ${dict.staff.add_vehicle}`,
              href: `/${lang}/staff/vehicles/new`,
            }}
          />
        )}
      </div>
    </div>
  );
}
