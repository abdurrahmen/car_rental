import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleFilters } from '@/components/vehicles/VehicleFilters';
import type { Language, Vehicle, Branch, VehicleCategory } from '@/types';

interface VehiclesPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VehiclesPage({
  params,
  searchParams,
}: VehiclesPageProps) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  let query = supabase
    .from('vehicles')
    .select(
      '*, branch:branches(*), category:vehicle_categories(*), photos:vehicle_photos(*)',
    )
    .eq('status', 'available');

  if (resolvedSearchParams.category) {
    query = query.eq('category_id', resolvedSearchParams.category as string);
  }
  if (resolvedSearchParams.transmission) {
    query = query.eq(
      'transmission',
      resolvedSearchParams.transmission as string,
    );
  }
  if (resolvedSearchParams.branch) {
    query = query.eq('branch_id', resolvedSearchParams.branch as string);
  }

  const { data: vehicles } = await query;
  const { data: branches } = await supabase.from('branches').select('*');
  const { data: categories } = await supabase
    .from('vehicle_categories')
    .select('*');

  const locale = lang as Language;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header locale={locale} dictionary={dict} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-brand-900 mb-8">
          {dict.vehicles.browse_vehicles}
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-72">
            <VehicleFilters
              branches={(branches as Branch[]) || []}
              categories={(categories as VehicleCategory[]) || []}
              dictionary={dict}
              locale={locale}
            />
          </aside>
          <div className="flex-1">
            {vehicles && vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle as Vehicle}
                    locale={locale}
                    dictionary={dict}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-xl border border-neutral-200 text-neutral-500">
                <p className="text-lg mb-2">
                  {dict.vehicles.no_vehicles_found}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} dictionary={dict} />
    </div>
  );
}
