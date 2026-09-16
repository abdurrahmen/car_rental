import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { VehicleGallery } from '@/components/vehicles/VehicleGallery';
import { formatDZD } from '@/lib/utils/constants';
import { notFound } from 'next/navigation';
import type { Language, Branch, Vehicle } from '@/types';

interface VehicleDetailPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { lang, id } = await params;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select(
      '*, branch:branches(*), category:vehicle_categories(*), photos:vehicle_photos(*)',
    )
    .eq('id', id)
    .single();

  if (!vehicle) {
    notFound();
  }

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true);

  const locale = lang as Language;
  const catName =
    locale === 'ar'
      ? vehicle.category?.name_ar
      : locale === 'fr'
        ? vehicle.category?.name_fr
        : vehicle.category?.name_en;

  const branchName =
    locale === 'ar'
      ? vehicle.branch?.name_ar
      : locale === 'fr'
        ? vehicle.branch?.name_fr
        : vehicle.branch?.name_en;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header locale={locale} dictionary={dict} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery and Specs */}
          <div className="lg:col-span-7 space-y-6">
            <VehicleGallery
              photos={vehicle.photos || []}
              vehicleName={`${vehicle.make} ${vehicle.model}`}
            />

            <div className="bg-card p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-heading font-bold text-brand-900 mb-4">
                {dict.vehicles.vehicle_details}
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-neutral-500">
                    {dict.vehicles.transmission}
                  </dt>
                  <dd className="font-semibold text-neutral-900 mt-1 capitalize">
                    {vehicle.transmission === 'automatic'
                      ? dict.vehicles.automatic
                      : dict.vehicles.manual}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">{dict.vehicles.seats}</dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {vehicle.seats}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">
                    {dict.vehicles.fuel_type}
                  </dt>
                  <dd className="font-semibold text-neutral-900 mt-1 capitalize">
                    {vehicle.fuel_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">
                    {dict.vehicles.category}
                  </dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {catName || 'Standard'}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">
                    {dict.reservations.pickup_branch}
                  </dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {branchName || 'Main Branch'}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">
                    {dict.vehicles.mileage_limit}
                  </dt>
                  <dd className="font-semibold text-neutral-900 mt-1">
                    {vehicle.mileage_limit_km
                      ? `${vehicle.mileage_limit_km} km`
                      : dict.vehicles.unlimited_mileage}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: Title, Pricing & Booking Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card p-6 rounded-xl border border-neutral-200 shadow-sm">
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 bg-accent-50 px-2.5 py-1 rounded">
                  {vehicle.year}
                </span>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-brand-900 mt-2">
                  {vehicle.make} {vehicle.model}
                </h1>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-accent-600">
                    {formatDZD(vehicle.daily_rate, locale)}
                  </span>
                  <span className="text-neutral-500 text-sm">
                    / {dict.vehicles.per_day}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {dict.reservations.deposit_required}:{' '}
                  <span className="font-semibold text-neutral-700">
                    {formatDZD(vehicle.deposit_amount, locale)}
                  </span>{' '}
                  (refundable)
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <h3 className="font-heading font-bold text-lg text-brand-900 mb-4">
                  {dict.vehicles.book_now}
                </h3>
                <ReservationForm
                  vehicle={vehicle as Vehicle}
                  dailyRate={vehicle.daily_rate}
                  branches={(branches as Branch[]) || []}
                  dictionary={dict}
                  lang={locale}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} dictionary={dict} />
    </div>
  );
}
