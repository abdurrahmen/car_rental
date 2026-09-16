import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { VehicleForm } from '@/components/dashboard/VehicleForm';
import type { Language, VehicleCategory, Branch } from '@/types';

interface StaffNewVehiclePageProps {
  params: Promise<{ lang: string }>;
}

export default async function StaffNewVehiclePage({
  params,
}: StaffNewVehiclePageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*');
  const { data: branches } = await supabase.from('branches').select('*');

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-brand-900 mb-6">
        {dict.staff.add_vehicle}
      </h1>
      <VehicleForm
        categories={(categories as VehicleCategory[]) || []}
        branches={(branches as Branch[]) || []}
        locale={locale}
        dictionary={dict}
      />
    </div>
  );
}
