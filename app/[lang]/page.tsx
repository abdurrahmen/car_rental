import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDictionary, hasLocale } from './dictionaries'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Language, Vehicle, VehiclePhoto } from '@/types'
import { FALLBACK_VEHICLES, FALLBACK_BRANCHES } from '@/lib/data/fallback'

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const locale = lang as Language
  const dict = await getDictionary(locale)
  const supabase = await createClient()

  // Get featured vehicles with photos and relations
  const { data: vehiclesData } = await supabase
    .from('vehicles')
    .select(`
      *,
      branch:branches(*),
      category:vehicle_categories(*),
      photos:vehicle_photos(*)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)

  // Get active branches for network overview
  const { data: branchesData } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)

  const vehicles = (vehiclesData && vehiclesData.length > 0)
    ? (vehiclesData as unknown as (Vehicle & {
        photos: VehiclePhoto[]
        category?: { name_ar: string; name_fr: string; name_en: string }
      })[])
    : (FALLBACK_VEHICLES.slice(0, 6) as unknown as (Vehicle & {
        photos: VehiclePhoto[]
        category?: { name_ar: string; name_fr: string; name_en: string }
      })[])

  const branches = (branchesData && branchesData.length > 0)
    ? branchesData
    : FALLBACK_BRANCHES

  const isArabic = locale === 'ar'

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFD] text-neutral-900 selection:bg-brand-500/20">
      {/* Frosted Glass Navigation */}
      <Header locale={locale} dictionary={dict} />

      {/* =============================================================
          HERO SECTION — Apple Minimalist Headline & Ambient Lighting
          ============================================================= */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle ambient light gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 start-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-brand-500/10 via-accent-500/5 to-transparent blur-3xl opacity-70"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-xs font-semibold text-neutral-700 tracking-tight mb-6 animate-apple-fade-in shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isArabic
                ? 'منصة كراء السيارات المعتمدة في الجزائر • أسطول 2024-2025'
                : locale === 'fr'
                ? 'Plateforme officielle de location de véhicules en Algérie'
                : 'Premier Vehicle Rental Platform Across Algeria'}
            </span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.08] mb-6 animate-apple-fade-up">
            {isArabic ? (
              <>
                انطلق بثقة عبر الجزائر <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500">
                  بأسهل وأأمن تجربة كراء.
                </span>
              </>
            ) : locale === 'fr' ? (
              <>
                Voyagez en toute sérénité <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500">
                  avec notre flotte premium en Algérie.
                </span>
              </>
            ) : (
              <>
                Drive With Complete Confidence <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500">
                  Across Algeria.
                </span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-500 leading-relaxed mb-10 animate-apple-fade-up delay-100">
            {isArabic
              ? 'احجز سيارتك السياحية أو النفعية في دقائق. عربون رمزي 5,000 دج مسترجع عبر بريدي موب أو CIB، والباقي نقدًا عند الاستلام مع محضر فحص رقمي شفاف.'
              : locale === 'fr'
              ? 'Réservez votre véhicule en quelques clics. Acompte garanti de 5 000 DZD via Edahabia/CIB, solde à la prise en charge et état des lieux numérique complet.'
              : 'Reserve your car, SUV or utility truck in minutes. Small 5,000 DZD deposit via Edahabia/CIB, balance upon pickup, and seamless digital condition reports.'}
          </p>

          {/* CTA Action Pill Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-apple-fade-up delay-200">
            <Link
              href={`/${locale}/vehicles`}
              className="apple-press w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold tracking-tight bg-brand-500 text-white hover:bg-brand-600 shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all min-h-[48px]"
            >
              {dict.vehicles.browse_vehicles || 'Browse Our Fleet'}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="apple-press w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold tracking-tight bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80 border border-black/[0.06] transition-all min-h-[48px]"
            >
              {dict.auth.create_account || 'Create Account'}
            </Link>
          </div>

          {/* Key Confidence Badges */}
          <div className="mt-12 pt-8 border-t border-black/[0.05] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-neutral-500 animate-apple-fade-up delay-300">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{isArabic ? 'ضمان عدم تكرار الحجز' : 'Zero Double Booking'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{isArabic ? 'عربون 5000 دج مسترجع' : '5,000 DZD Safe Deposit'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{isArabic ? '6 وكالات في أهم المدن' : '6 National Hubs'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isArabic ? 'محضر استلام رقمي فوري' : 'Digital Inspection PV'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          FEATURED FLEET SECTION — Scroll-Triggered Reveal
          ============================================================= */}
      {vehicles && vehicles.length > 0 && (
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
                  {isArabic ? 'أسطولنا الحديث' : 'Featured Fleet'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                  {dict.vehicles.browse_vehicles || 'Ready For Departure'}
                </h2>
              </div>
              <Link
                href={`/${locale}/vehicles`}
                className="mt-3 sm:mt-0 text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1 group"
              >
                <span>{isArabic ? 'عرض كل السيارات' : 'View full catalog'}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                    isArabic ? 'rotate-180 group-hover:-translate-x-0.5' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {vehicles.map((vehicle, index) => (
              <ScrollReveal key={vehicle.id} delay={index * 100}>
                <VehicleCard
                  vehicle={vehicle}
                  locale={locale}
                  dictionary={dict}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* =============================================================
          HOW IT WORKS — 4 Clear Apple-Style Steps
          ============================================================= */}
      <section className="py-20 bg-white/70 border-y border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
                {isArabic ? 'بكل بساطة' : 'Transparent Process'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                {isArabic ? 'كيف يعمل كراء السيارات معنا؟' : 'How DZ Rent Works'}
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                {isArabic
                  ? 'من الحجز الأولي عبر هاتفك إلى استلام المفاتيح في الوكالة، خطوات واضحة وموثوقة.'
                  : 'From your online request to collecting keys at the branch, a streamlined experience.'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: isArabic ? 'اختر مركبتك' : 'Choose Vehicle',
                desc: isArabic
                  ? 'تصفح السيارات السياحية، رباعيات الدفع، أو الشاحنات مع أسعار واضحة بدون رسوم خفية.'
                  : 'Browse compacts, 4x4s, utility vans with upfront daily rates.',
              },
              {
                step: '02',
                title: isArabic ? 'أرسل طلب الحجز' : 'Submit Request',
                desc: isArabic
                  ? 'حدد تواريخ الانطلاق وفرع الاستلام مع رفع صورة رخصة السياقة لتسريع الإجراءات.'
                  : 'Select your dates and branches with driver license verification.',
              },
              {
                step: '03',
                title: isArabic ? 'تأكيد ودفع العربون' : 'Confirm & Deposit',
                desc: isArabic
                  ? 'بعد موافقة الوكالة، ادفع عربون 5,000 دج بأمان عبر الذهبية أو CIB خلال 48 ساعة.'
                  : 'Pay a 5,000 DZD refundable deposit via BaridiMob/CIB once approved.',
              },
              {
                step: '04',
                title: isArabic ? 'استلام وانطلاق' : 'Pickup & Drive',
                desc: isArabic
                  ? 'فحص رقمي مشترك لحالة السيارة، دفع المتبقي نقدًا، وانطلق في رحلتك بكل راحة.'
                  : 'Quick digital check-in report, pay remainder in cash, and drive away.',
              },
            ].map((item, index) => (
              <ScrollReveal key={item.step} delay={index * 120}>
                <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.03)] apple-card-hover h-full flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-bold font-mono text-brand-500/80 block mb-3">
                      {item.step}
                    </span>
                    <h3 className="text-base font-semibold text-neutral-900 tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          NATIONAL NETWORK SECTION — 6 Strategic Branches
          ============================================================= */}
      {branches && branches.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
                {isArabic ? 'تغطية واسعة' : 'National Coverage'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
                {isArabic ? 'وكالاتنا عبر القطر الجزائري' : 'Our Branch Network'}
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                {isArabic
                  ? 'متواجدون في المطارات والموانئ والمراكز الحيوية لتسهيل استلام وإرجاع مركبتك.'
                  : 'Present at key airports, ports, and commercial hubs for seamless pickup and drop-off.'}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch, index) => {
              const name =
                isArabic ? branch.name_ar : locale === 'fr' ? branch.name_fr : branch.name_en

              return (
                <ScrollReveal key={branch.id} delay={index * 80}>
                  <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] apple-card-hover flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-brand-600 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                          {branch.city}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 tracking-tight mb-1.5">
                        {name}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                        {branch.address}
                      </p>
                    </div>

                    <a
                      href={`tel:${branch.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 pt-3 border-t border-black/[0.04]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{branch.phone}</span>
                    </a>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </section>
      )}

      {/* =============================================================
          BOTTOM CALL TO ACTION — Dark Apple Accent Card
          ============================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-12">
        <ScrollReveal>
          <div className="relative rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-24 -bottom-24 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl"
            />

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
                {isArabic
                  ? 'جاهز لبدء رحلتك القادمة؟'
                  : 'Ready to Hit the Road?'}
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8">
                {isArabic
                  ? 'اختر سيارتك الآن، أتمم الحجز في دقائق، واستلمها من أقرب وكالة إليك مع ضمان الخدمة والشفافية التامة.'
                  : 'Select your vehicle today, complete reservation in minutes, and pick up from your nearest branch.'}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/${locale}/vehicles`}
                  className="apple-press inline-flex items-center justify-center px-7 py-3 rounded-full text-xs font-semibold tracking-tight bg-brand-500 text-white hover:bg-brand-600 transition-all min-h-[44px]"
                >
                  {dict.vehicles.browse_vehicles || 'Browse Fleet'}
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  className="apple-press inline-flex items-center justify-center px-7 py-3 rounded-full text-xs font-semibold tracking-tight bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all min-h-[44px]"
                >
                  {dict.auth.create_account || 'Create Account'}
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Minimalist Footer */}
      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
