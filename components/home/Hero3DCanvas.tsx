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
      <div className="w-full h-[340px] sm:h-[420px] lg:h-[480px] bg-transparent" />
    )
  }

  return (
    <div
      ref={canvasWrapperRef}
      aria-hidden="true"
      className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] select-none group"
    >
      {/* 3D Canvas — no card chrome, bleeds directly into page background */}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 transition-opacity duration-500">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-3 animate-bounce">
            <svg
              className="w-5 h-5 text-brand-600"
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
          <span className="text-xs font-medium text-neutral-500 tracking-tight">
            {isArabic ? 'جاري التحميل...' : isFrench ? 'Chargement...' : 'Loading...'}
          </span>
        </div>
      )}

      {/* Subtle hover-only drag hint — replaces the two prominent badges */}
      {isSceneLoaded && (
        <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 backdrop-blur-sm text-[10px] font-medium text-neutral-400">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            <span>
              {isArabic ? 'اسحب للتدوير' : isFrench ? 'Glissez pour pivoter' : 'Drag to rotate'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
