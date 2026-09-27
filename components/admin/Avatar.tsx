import React from 'react'
import Image from 'next/image'

export interface AvatarProps {
  name?: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const clean = name.replace(/\([^)]*\)/g, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Donezo-styled circular Avatar component with initials fallback.
 * Uses consistent primary blue/neutral tints for clean actor identification.
 */
export function Avatar({
  name = 'User',
  src,
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeMap = {
    sm: {
      box: 'w-7 h-7 text-[11px]',
      pixels: 28,
    },
    md: {
      box: 'w-9 h-9 text-xs',
      pixels: 36,
    },
    lg: {
      box: 'w-11 h-11 text-sm',
      pixels: 44,
    },
  }[size]

  if (src) {
    return (
      <div
        className={`relative ${sizeMap.box} rounded-full overflow-hidden shrink-0 ring-1 ring-black/[0.05] ${className}`}
      >
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${sizeMap.pixels}px`}
        />
      </div>
    )
  }

  const initials = getInitials(name)

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-bold bg-brand-50 text-brand-700 select-none ring-1 ring-brand-200/50 ${sizeMap.box} ${className}`}
      title={name}
    >
      {initials}
    </div>
  )
}
