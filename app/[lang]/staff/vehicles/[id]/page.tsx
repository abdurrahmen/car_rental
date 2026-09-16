import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { VehicleForm } from '@/components/dashboard/VehicleForm';
import { notFound } from 'next/navigation';
import type { Language, Vehicle, VehicleCategory, Branch } from '@/types';

interface StaffEditVehiclePageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function StaffEditVehiclePage({
  params,
}: StaffEditVehiclePageProps) {
  const { lang, id } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();

  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*');
  const { data: branches } = await supabase.from('branches').select('*');

  if (!vehicle) notFound();

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-brand-900 mb-6">
        {dict.common.edit} {vehicle.make} {vehicle.model}
      </h1>
      <VehicleForm
        vehicle={vehicle as Vehicle}
        categories={(categories as VehicleCategory[]) || []}
        branches={(branches as Branch[]) || []}
        locale={locale}
        dictionary={dict}
      />
    </div>
  );
}
