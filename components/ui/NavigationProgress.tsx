'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Apple-style top loading progress bar that gives immediate visual feedback
 * whenever a route transition is initiated.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset when route changes complete
  useEffect(() => {
    if (loading) {
      setProgress(100)
      const timer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Listen to link clicks globally
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
          setProgress(30)
          setTimeout(() => setProgress(75), 150)
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

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
