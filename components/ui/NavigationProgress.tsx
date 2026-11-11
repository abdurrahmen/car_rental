'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

/**
 * Apple-style top loading progress bar that gives immediate visual feedback
 * whenever a route transition is initiated, and pre-warms routes on hover.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset when route changes complete
  useEffect(() => {
    setProgress(100)
    const resetTimer = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 180)
    return () => clearTimeout(resetTimer)
  }, [pathname, searchParams])

  // Listen to link clicks globally & pre-warm on hover
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      const isTargetBlank = target.getAttribute('target') === '_blank'
      const isModifierKey = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey

      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !isTargetBlank &&
        !isModifierKey
      ) {
        // Only trigger if destination is different from current page
        const currentUrl = `${window.location.pathname}${window.location.search}`
        if (href !== currentUrl && !href.startsWith('#')) {
          setLoading(true)
          setProgress(35)
          setTimeout(() => setProgress(80), 120)
        }
      }
    }

    const handleAnchorMouseEnter = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('#') &&
        target.getAttribute('target') !== '_blank'
      ) {
        try {
          router.prefetch(href)
        } catch {
          // Ignore prefetch errors silently
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    document.addEventListener('mouseover', handleAnchorMouseEnter, { passive: true })
    return () => {
      document.removeEventListener('click', handleAnchorClick)
      document.removeEventListener('mouseover', handleAnchorMouseEnter)
    }
  }, [router])

  if (!loading && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-brand-500 shadow-[0_0_8px_rgba(0,113,227,0.5)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  )
}
