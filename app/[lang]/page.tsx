import { createClient } from '@/lib/supabase/server'
import { getDictionary, hasLocale } from './dictionaries'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroAsymmetric } from '@/components/home/HeroAsymmetric'
import { TrustBar } from '@/components/home/TrustBar'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { Language, Vehicle, VehiclePhoto } from '@/types'
import { FALLBACK_VEHICLES, FALLBACK_BRANCHES } from '@/lib/data/fallback'
import { unstable_cache } from 'next/cache'

// Lazy load heavy components for better initial page load
const JourneyTimeline = dynamic(() => import('@/components/home/JourneyTimeline').then(mod => ({ default: mod.JourneyTimeline })), {
  loading: () => <div className="h-[600px] bg-neutral-50 animate-pulse rounded-3xl" />
})
const FleetShowcase = dynamic(() => import('@/components/home/FleetShowcase').then(mod => ({ default: mod.FleetShowcase })), {
  loading: () => <div className="h-[800px] bg-neutral-50 animate-pulse rounded-3xl" />
})
const HubExplorer = dynamic(() => import('@/components/home/HubExplorer').then(mod => ({ default: mod.HubExplorer })), {
  loading: () => <div className="h-[600px] bg-neutral-50 animate-pulse rounded-3xl" />
})
const DigitalGuarantee = dynamic(() => import('@/components/home/DigitalGuarantee').then(mod => ({ default: mod.DigitalGuarantee })), {
  loading: () => <div className="h-[400px] bg-neutral-50 animate-pulse rounded-3xl" />
})
const BoardingPassCta = dynamic(() => import('@/components/home/BoardingPassCta').then(mod => ({ default: mod.BoardingPassCta })), {
  loading: () => <div className="h-[300px] bg-neutral-50 animate-pulse rounded-3xl" />
})

// Cache homepage data with 5-minute revalidation
const getHomePageData = unstable_cache(
  async (supabaseUrl: string, supabaseKey: string) => {
    // Create client without using cookies() inside the cache
    const { createClient: createBrowserClient } = await import('@supabase/supabase-js')
    const supabase = createBrowserClient(supabaseUrl, supabaseKey)
    
    const [{ data: vehiclesData }, { data: branchesData }] = await Promise.all([
      supabase
        .from('vehicles')
        .select(`
          *,
          branch:branches(*),
          category:vehicle_categories(*),
          photos:vehicle_photos(*)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('branches')
        .select('*')
        .eq('is_active', true),
    ])
    
    return { vehiclesData, branchesData }
  },
  ['homepage-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['homepage', 'vehicles', 'branches']
  }
)

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export const revalidate = 300 // Revalidate page every 5 minutes

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const locale = lang as Language
  
  // Parallel data fetching
  const [dict, { vehiclesData, branchesData }] = await Promise.all([
    getDictionary(locale),
    getHomePageData(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
  ])

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
      <Header locale={locale} dictionary={dict} branches={branches} />

      {/* Main Creative Journey Layout */}
      <main className="flex-1 w-full block">
        {/* 1. Asymmetric Hero with Terminal Card & Quick-Finder */}
        <HeroAsymmetric locale={locale} branches={branches} dict={dict} />

        {/* 2. Trust Metrics Bar with GSAP Animated Counters */}
        <TrustBar locale={locale} />

        {/* 3. The 4-Stage Digital Transit Timeline (Connected Progress Track) */}
        <Suspense fallback={<div className="h-[600px] bg-neutral-50 animate-pulse rounded-3xl mx-4 my-8" />}>
          <JourneyTimeline locale={locale} />
        </Suspense>

        {/* 4. Curated Fleet Showcase by Algerian Terrain & Categories */}
        <Suspense fallback={<div className="h-[800px] bg-neutral-50 animate-pulse rounded-3xl mx-4 my-8" />}>
          <FleetShowcase locale={locale} vehicles={vehicles} />
        </Suspense>

        {/* 5. National Gateway & Wilaya Hub Explorer (Airports, Ports & Corridors) */}
        <Suspense fallback={<div className="h-[600px] bg-neutral-50 animate-pulse rounded-3xl mx-4 my-8" />}>
          <HubExplorer locale={locale} branches={branches} />
        </Suspense>

        {/* 6. The DZRent Digital Guarantee: Procès-Verbal (PV) Handover Spotlight */}
        <Suspense fallback={<div className="h-[400px] bg-neutral-50 animate-pulse rounded-3xl mx-4 my-8" />}>
          <DigitalGuarantee locale={locale} />
        </Suspense>

        {/* 7. Closing CTA: Algerian Mobility Boarding Pass */}
        <Suspense fallback={<div className="h-[300px] bg-neutral-50 animate-pulse rounded-3xl mx-4 my-8" />}>
          <BoardingPassCta locale={locale} dict={dict} />
        </Suspense>
      </main>

      {/* Global Clean Footer */}
      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
