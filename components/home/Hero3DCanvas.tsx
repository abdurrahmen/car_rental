'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'
import type { Language } from '@/types'

// Dynamically import the inner Three.js scene so Three.js never blocks the initial bundle
const CarModelScene = dynamic(() => import('./CarModelScene'), {
  ssr: false,
})

export interface Hero3DCanvasProps {
  locale: Language
}

export function Hero3DCanvas({ locale }: Hero3DCanvasProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  // Pre-render decision states (determined after hydration)
  const [shouldUseFallback, setShouldUseFallback] = useState<boolean>(false)
  const [isReadyToCheck, setIsReadyToCheck] = useState<boolean>(false)
  const [isSceneLoaded, setIsSceneLoaded] = useState<boolean>(false)
  const [hasWebGLError, setHasWebGLError] = useState<boolean>(false)

  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Schedule check after initial paint to prevent cascading render warning
    const timer = setTimeout(() => {
      // 1. Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      // 2. Check WebGL2 availability
      let isWebGLSupported = false
      try {
        const testCanvas = document.createElement('canvas')
        isWebGLSupported = Boolean(
          testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
        )
      } catch {
        isWebGLSupported = false
      }

      // 3. Check mobile breakpoint (< 768px defaults to static high-perf image)
      const isMobile = window.innerWidth < 768

      if (prefersReducedMotion || !isWebGLSupported || isMobile) {
        setShouldUseFallback(true)
      }

      setIsReadyToCheck(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // WebGL context loss listener to gracefully fall back without crashing
  useEffect(() => {
    const wrapper = canvasWrapperRef.current
    if (!wrapper) return

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      setHasWebGLError(true)
    }

    wrapper.addEventListener('webglcontextlost', handleContextLost)
    return () => {
      wrapper.removeEventListener('webglcontextlost', handleContextLost)
    }
  }, [shouldUseFallback])

  // Static Fallback Vehicle Image (Peugeot 208 GT Line from DZRent fleet)
  const fallbackVisual = (
    <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200/70 border border-black/[0.08] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] flex items-center justify-center group">
      <Image
        src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1400&q=85"
        alt="Peugeot 208 GT Line, DZRent fleet vehicle"
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 42vw"
        className="object-contain p-4 sm:p-6 drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
      />

      {/* Fleet Showcase Badge */}
      <div className="absolute top-4 start-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[11px] font-semibold text-neutral-800 shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>
          {isArabic ? 'الأسطول المعتمد 2024-2025' : isFrench ? 'Flotte Certifiée 2024-2025' : 'Verified Fleet 2024-2025'}
        </span>
      </div>

      {/* Subtle specs strip */}
      <div className="absolute bottom-4 inset-x-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-black/[0.06] shadow-sm flex items-center justify-between text-xs text-neutral-700">
        <span className="font-bold text-neutral-900">Peugeot 208 GT Line</span>
        <span className="font-mono font-semibold text-brand-600">6,500 DZD / jour</span>
      </div>
    </div>
  )

  // If fallback conditions met or WebGL errored out, render static photo immediately
  if (shouldUseFallback || hasWebGLError) {
    return fallbackVisual
  }

  // Before hydration check, render a clean placeholder of the exact same dimensions to avoid any layout shift
  if (!isReadyToCheck) {
    return (
      <div className="w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-3xl bg-neutral-100/60 border border-black/[0.05] animate-pulse" />
    )
  }

  return (
    <div
      ref={canvasWrapperRef}
      aria-hidden="true"
      className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-50/80 via-white to-neutral-100/60 border border-black/[0.08] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.08)] select-none"
    >
      {/* 3D Canvas Container */}
      <div
        className={`w-full h-full transition-opacity duration-700 ${
          isSceneLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Canvas
          dpr={[1, 1.5]}
          frameloop="always"
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
        >
          <Suspense fallback={null}>
            <CarModelScene onLoaded={() => setIsSceneLoaded(true)} />
          </Suspense>
        </Canvas>
      </div>

      {/* Shimmer Placeholder while 3D Model streams in */}
      {!isSceneLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-neutral-50/90 backdrop-blur-sm z-10 transition-opacity duration-500">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-3 animate-bounce">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-neutral-800 tracking-tight">
            {isArabic ? 'جاري تحميل النموذج ثلاثي الأبعاد...' : isFrench ? 'Chargement du modèle 3D...' : 'Loading 3D Showpiece...'}
          </span>
          <span className="text-[11px] text-neutral-400 font-mono mt-0.5">
            FIAT ABARTH 500 • DZRENT
          </span>
        </div>
      )}

      {/* Interactive Drag Hint Pill */}
      {isSceneLoaded && (
        <div className="pointer-events-none absolute bottom-4 start-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[11px] font-semibold text-neutral-700 shadow-sm flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-brand-600 animate-spin"
            style={{ animationDuration: '8s' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>
            {isArabic
              ? 'تفاعل ثلاثي الأبعاد • اسحب للتدوير'
              : isFrench
              ? 'Interactif 3D • Glissez pour pivoter'
              : '3D Interactive • Drag to inspect'}
          </span>
        </div>
      )}

      {/* Model Showpiece Badge */}
      <div className="pointer-events-none absolute top-4 end-4 px-2.5 py-1 rounded-full bg-black/5 backdrop-blur-md border border-black/[0.06] text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider">
        DZRENT 3D
      </div>
    </div>
  )
}
