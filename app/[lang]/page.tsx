import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDictionary, hasLocale } from './dictionaries';
import { notFound } from 'next/navigation';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const supabase = await createClient();

  // Get featured vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      *,
      branch:branches(*),
      category:vehicle_categories(*),
      photos:vehicle_photos(*)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6);

  // Get branches for the hero section
  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true);

  const rtl = lang === 'ar';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-brand-900 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <svg
                className="w-8 h-8 text-accent-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
              <span className="font-heading text-lg font-bold">
                {dict.common.app_name}
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/vehicles`}
                className="hidden sm:inline-flex text-sm hover:text-accent-400 transition-colors"
              >
                {dict.vehicles.browse_vehicles}
              </Link>

              {/* Language switcher */}
              <div className="flex items-center gap-1 text-xs">
                {(['ar', 'fr', 'en'] as const).map((l) => (
                  <Link
                    key={l}
                    href={`/${l}`}
                    className={`px-2 py-1 rounded transition-colors ${
                      lang === l
                        ? 'bg-accent-500 text-brand-900 font-semibold'
                        : 'hover:bg-brand-800'
                    }`}
                  >
                    {l.toUpperCase()}
                  </Link>
                ))}
              </div>

              <Link
                href={`/${lang}/login`}
                className="bg-accent-500 text-brand-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors min-h-[44px] flex items-center"
              >
                {dict.auth.login}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              {lang === 'ar'
                ? 'استأجر سيارتك المثالية في الجزائر'
                : lang === 'fr'
                  ? 'Louez votre voiture idéale en Algérie'
                  : 'Rent Your Perfect Car in Algeria'}
            </h1>
            <p className="text-neutral-300 text-lg mb-8">
              {lang === 'ar'
                ? 'احجز بسهولة وأمان. ادفع العربون إلكترونيًا والباقي نقدًا عند الاستلام.'
                : lang === 'fr'
                  ? 'Réservez facilement et en toute sécurité. Payez un acompte en ligne et le reste en espèces à la prise en charge.'
                  : 'Book easily and securely. Pay a deposit online and the rest in cash at pickup.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${lang}/vehicles`}
                className="bg-accent-500 text-brand-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-accent-400 transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                {dict.vehicles.browse_vehicles}
              </Link>
              <Link
                href={`/${lang}/signup`}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                {dict.auth.create_account}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-12 text-brand-900">
            {lang === 'ar'
              ? 'كيف يعمل؟'
              : lang === 'fr'
                ? 'Comment ça marche ?'
                : 'How It Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title:
                  lang === 'ar'
                    ? 'اختر سيارتك'
                    : lang === 'fr'
                      ? 'Choisissez votre voiture'
                      : 'Choose Your Car',
                desc:
                  lang === 'ar'
                    ? 'تصفح مجموعتنا واختر السيارة المناسبة لك'
                    : lang === 'fr'
                      ? 'Parcourez notre flotte et choisissez le véhicule qui vous convient'
                      : 'Browse our fleet and pick the vehicle that suits you',
              },
              {
                step: '2',
                title:
                  lang === 'ar'
                    ? 'أرسل الطلب'
                    : lang === 'fr'
                      ? 'Envoyez la demande'
                      : 'Submit Request',
                desc:
                  lang === 'ar'
                    ? 'أرسل طلب الحجز مع تواريخ الإيجار ورخصة القيادة'
                    : lang === 'fr'
                      ? 'Envoyez votre demande avec les dates et votre permis de conduire'
                      : 'Send your booking request with dates and your driver\'s license',
              },
              {
                step: '3',
                title:
                  lang === 'ar'
                    ? 'التأكيد والعربون'
                    : lang === 'fr'
                      ? 'Confirmation et acompte'
                      : 'Confirm & Deposit',
                desc:
                  lang === 'ar'
                    ? 'بعد التأكيد، ادفع عربونًا صغيرًا عبر بريدي موب أو CIB'
                    : lang === 'fr'
                      ? 'Après confirmation, payez un petit acompte via BaridiMob ou CIB'
                      : 'After confirmation, pay a small deposit via BaridiMob or CIB',
              },
              {
                step: '4',
                title:
                  lang === 'ar'
                    ? 'استلم سيارتك'
                    : lang === 'fr'
                      ? 'Récupérez votre voiture'
                      : 'Pick Up Your Car',
                desc:
                  lang === 'ar'
                    ? 'ادفع الباقي نقدًا عند الاستلام وانطلق!'
                    : lang === 'fr'
                      ? 'Payez le reste en espèces à la prise en charge et partez !'
                      : 'Pay the rest in cash at pickup and go!',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-accent-500 text-brand-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-lg mb-2 text-brand-900">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      {vehicles && vehicles.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-8 text-brand-900">
              {lang === 'ar'
                ? 'سيارات مميزة'
                : lang === 'fr'
                  ? 'Véhicules en vedette'
                  : 'Featured Vehicles'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => {
                const nameKey = `name_${lang}` as 'name_ar' | 'name_fr' | 'name_en';
                return (
                  <Link
                    key={vehicle.id}
                    href={`/${lang}/vehicles/${vehicle.id}`}
                    className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-video bg-neutral-200 relative overflow-hidden">
                      {vehicle.photos?.[0] ? (
                        <div className="w-full h-full bg-neutral-300 flex items-center justify-center text-neutral-500">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-neutral-300 flex items-center justify-center text-neutral-500">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-lg text-brand-900 group-hover:text-accent-600 transition-colors">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-neutral-500 text-sm mb-3">
                        {vehicle.year} · {vehicle.category?.[nameKey] || ''}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-neutral-600 text-xs">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {vehicle.transmission === 'automatic'
                              ? dict.vehicles.automatic
                              : dict.vehicles.manual}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {vehicle.seats}
                          </span>
                        </div>
                        <div className="text-end">
                          <span className="text-accent-600 font-bold text-lg">
                            {new Intl.NumberFormat(lang === 'ar' ? 'ar-DZ' : 'fr-DZ').format(vehicle.daily_rate)}
                          </span>
                          <span className="text-neutral-500 text-xs block">
                            DZD/{dict.vehicles.per_day}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                href={`/${lang}/vehicles`}
                className="inline-flex items-center gap-2 bg-brand-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors min-h-[44px]"
              >
                {dict.vehicles.browse_vehicles}
                <svg
                  className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Branches */}
      {branches && branches.length > 0 && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-8 text-brand-900">
              {lang === 'ar'
                ? 'فروعنا'
                : lang === 'fr'
                  ? 'Nos agences'
                  : 'Our Branches'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => {
                const nameKey = `name_${lang}` as 'name_ar' | 'name_fr' | 'name_en';
                return (
                  <div
                    key={branch.id}
                    className="bg-card rounded-xl shadow-sm border border-border p-6"
                  >
                    <h3 className="font-heading font-bold text-lg text-brand-900 mb-2">
                      {branch[nameKey]}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-1">{branch.address}</p>
                    <p className="text-neutral-500 text-sm mb-3">{branch.city}</p>
                    <a
                      href={`tel:${branch.phone}`}
                      className="text-accent-600 text-sm font-semibold hover:text-accent-700"
                    >
                      {branch.phone}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-brand-950 text-neutral-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()}{' '}
              {dict.common.app_name}.{' '}
              {lang === 'ar'
                ? 'جميع الحقوق محفوظة'
                : lang === 'fr'
                  ? 'Tous droits réservés'
                  : 'All rights reserved'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link href={`/${lang}/vehicles`} className="hover:text-white transition-colors">
                {dict.vehicles.browse_vehicles}
              </Link>
              <Link href={`/${lang}/login`} className="hover:text-white transition-colors">
                {dict.auth.login}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
