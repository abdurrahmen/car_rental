'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Language } from '@/types'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Hero photo: Black Toyota Land Cruiser on desert sand at golden hour
const HERO_IMAGE_SRC =
  'https://images.unsplash.com/photo-1572629166063-011a332eafed?w=2400&auto=format&fit=crop&q=85'

// Tiny warm-sand blur placeholder (10×6 base64 JPEG)
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAGAAoDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB4QAAICAgIDAAAAAAAAAAAAAAECAAMEEQUhEjFB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQEAAwEAAAAAAAAAAAAAAAABAAIRA//aAAwDAQACEQMRAD8AJ5HkLeNxqs1S6u0EqKwNn30ZFhyzUk4n/9k='

export interface HeroParallaxVisualProps {
  locale: Language
  /** Ref to the parent hero <section> — used as ScrollTrigger trigger */
  heroRef: React.RefObject<HTMLElement | null>
}

export function HeroParallaxVisual({ heroRef }: HeroParallaxVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgLayerRef = useRef<HTMLDivElement>(null)
  const vehicleLayerRef = useRef<HTMLDivElement>(null)
  const fgLayerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // If reduced motion, render static — no GSAP needed
    if (prefersReducedMotion || !heroRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      })

      // Background environment layer: slowest parallax (0.3×)
      if (bgLayerRef.current) {
        tl.fromTo(
          bgLayerRef.current,
          { y: -60 },
          { y: 40, ease: 'none' },
          0
        )
      }

      // Vehicle layer: medium parallax (0.6×)
      if (vehicleLayerRef.current) {
        tl.fromTo(
          vehicleLayerRef.current,
          { y: -30 },
          { y: 20, ease: 'none' },
          0
        )
      }

      // Foreground gradient strip: fastest parallax (0.8×)
      if (fgLayerRef.current) {
        tl.fromTo(
          fgLayerRef.current,
          { y: -15 },
          { y: 10, ease: 'none' },
          0
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [heroRef])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] overflow-hidden select-none"
      style={{
        /* Soft vignette fade at edges — no hard card border */
        maskImage:
          'radial-gradient(ellipse 85% 90% at 50% 50%, black 55%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 85% 90% at 50% 50%, black 55%, transparent 100%)',
      }}
    >
      {/* Layer 1: Background environment (sky, sand, horizon) — slowest parallax */}
      <div
        ref={bgLayerRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <Image
          src={HERO_IMAGE_SRC}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 42vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover object-center scale-110"
        />
      </div>

      {/* Layer 2: Vehicle emphasis — medium parallax, slightly offset focus */}
      <div
        ref={vehicleLayerRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <Image
          src={HERO_IMAGE_SRC}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 42vw"
          className="object-cover object-[center_60%] scale-110"
          style={{
            /* Mask to only show the vehicle / lower portion, creating depth separation */
            maskImage:
              'linear-gradient(to top, black 20%, rgba(0,0,0,0.6) 45%, transparent 70%)',
            WebkitMaskImage:
              'linear-gradient(to top, black 20%, rgba(0,0,0,0.6) 45%, transparent 70%)',
          }}
        />
      </div>

      {/* Layer 3: Foreground gradient strip — fastest parallax, motion depth cue */}
      <div
        ref={fgLayerRef}
        className="absolute inset-x-0 bottom-0 h-1/3 will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <div className="w-full h-full bg-gradient-to-t from-[#FBFBFD]/80 via-[#FBFBFD]/30 to-transparent" />
      </div>
    </div>
  )
}
