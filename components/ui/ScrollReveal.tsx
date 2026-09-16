'use client'

import React, { useEffect, useRef, useState } from 'react'

export interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number // ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  threshold?: number
}

/**
 * Apple-style Scroll Reveal component.
 * Uses IntersectionObserver to trigger smooth cubic-bezier reveal animations
 * as elements scroll into the viewport.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.15,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = domRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  const directionTransform = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: '',
  }[direction]

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: '750ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`
        transform-gpu transition-all will-change-[transform,opacity]
        ${
          isVisible
            ? 'opacity-100 translate-y-0 translate-x-0 scale-100'
            : `opacity-0 ${directionTransform} scale-[0.985]`
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}
