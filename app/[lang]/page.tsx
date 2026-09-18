import { createClient } from '@/lib/supabase/server'
import { getDictionary, hasLocale } from './dictionaries'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroAsymmetric } from '@/components/home/HeroAsymmetric'
import { TrustBar } from '@/components/home/TrustBar'
import { JourneyTimeline } from '@/components/home/JourneyTimeline'
import { FleetShowcase } from '@/components/home/FleetShowcase'
import { HubExplorer } from '@/components/home/HubExplorer'
import { DigitalGuarantee } from '@/components/home/DigitalGuarantee'
import { BoardingPassCta } from '@/components/home/BoardingPassCta'
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

  // Fetch up to 12 available vehicles for the interactive terrain/category showcase
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
    .limit(12)

  // Fetch active branches for national hub explorer & quick-finder
  const { data: branchesData } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)

  const vehicles =
    vehiclesData && vehiclesData.length > 0
      ? (vehiclesData as unknown as (Vehicle & {
          photos: VehiclePhoto[]
          category?: { name_ar: string; name_fr: string; name_en: string }
          branch?: { name_ar: string; name_fr: string; name_en: string; city?: string }
        })[])
      : (FALLBACK_VEHICLES as unknown as (Vehicle & {
          photos: VehiclePhoto[]
          category?: { name_ar: string; name_fr: string; name_en: string }
          branch?: { name_ar: string; name_fr: string; name_en: string; city?: string }
        })[])

  const branches =
    branchesData && branchesData.length > 0 ? branchesData : FALLBACK_BRANCHES

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFD] text-neutral-900 selection:bg-brand-500/20">
      {/* Frosted Glass Navigation */}
      <Header locale={locale} dictionary={dict} />

      {/* Main Creative Journey Layout */}
      <main className="flex-1 w-full block">
        {/* 1. Asymmetric Hero with Terminal Card & Quick-Finder */}
        <HeroAsymmetric locale={locale} branches={branches} dict={dict} />

        {/* 2. Trust Metrics Bar with GSAP Animated Counters */}
        <TrustBar locale={locale} />

        {/* 3. The 4-Stage Digital Transit Timeline (Connected Progress Track) */}
        <JourneyTimeline locale={locale} />

        {/* 4. Curated Fleet Showcase by Algerian Terrain & Categories */}
        <FleetShowcase locale={locale} vehicles={vehicles} />

        {/* 5. National Gateway & Wilaya Hub Explorer (Airports, Ports & Corridors) */}
        <HubExplorer locale={locale} branches={branches} />

        {/* 6. The DZRent Digital Guarantee: Procès-Verbal (PV) Handover Spotlight */}
        <DigitalGuarantee locale={locale} />

        {/* 7. Closing CTA: Algerian Mobility Boarding Pass */}
        <BoardingPassCta locale={locale} dict={dict} />
      </main>

      {/* Global Clean Footer */}
      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
