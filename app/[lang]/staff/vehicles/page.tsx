import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { formatDZD } from '@/lib/utils/constants';
import type { Language, Vehicle } from '@/types';

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-brand-900">
            {dict.staff.vehicle_management}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your fleet availability, maintenance, and vehicle rates.
          </p>
        </div>
        <Link
          href={`/${lang}/staff/vehicles/new`}
          className="bg-accent-500 text-brand-900 hover:bg-accent-400 font-bold px-4 py-2 rounded-lg min-h-[44px] flex items-center justify-center transition-colors"
        >
          + {dict.staff.add_vehicle}
        </Link>
      </div>

      <div className="grid gap-4">
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 bg-card border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-neutral-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading font-bold text-lg text-brand-900">
                    {v.make} {v.model} ({v.year})
                  </h3>
                  <Badge variant={getStatusBadgeVariant(v.status)}>
                    {v.status}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600">
                  Plate: <span className="font-mono">{v.plate_number}</span> ·{' '}
                  {v.transmission} · {v.seats} seats · {v.fuel_type}
                </p>
                <p className="text-sm font-semibold text-accent-600">
                  {formatDZD(v.daily_rate, locale)} / {dict.vehicles.per_day}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/${lang}/staff/vehicles/${v.id}`}
                  className="bg-neutral-100 hover:bg-neutral-200 text-brand-800 font-medium px-4 py-2 rounded-lg text-sm min-h-[44px] flex items-center transition-colors"
                >
                  {dict.common.edit}
                </Link>
                <Link
                  href={`/${lang}/vehicles/${v.id}`}
                  className="text-neutral-500 hover:text-neutral-800 text-sm font-medium px-3 py-2 min-h-[44px] flex items-center"
                  target="_blank"
                >
                  Preview ↗
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-500">
            No vehicles registered in this branch yet.
          </div>
        )}
      </div>
    </div>
  );
}
