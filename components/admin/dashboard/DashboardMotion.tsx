'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export interface DashboardMotionProps {
  children: React.ReactNode
}

/**
 * Client Motion Orchestrator for DZRent Dashboard:
 * - GSAP staggered entrance animation for dashboard tiles
 * - Strictly respects `prefers-reduced-motion`
 * - Keep every animation under 500ms
 */
export function DashboardMotion({ children }: DashboardMotionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const cards = containerRef.current.querySelectorAll('.admin-card')
    if (cards.length === 0) return

    // Quick subtle entrance stagger (<500ms total feel)
    gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 12,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'all',
      }
    )
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  )
}
