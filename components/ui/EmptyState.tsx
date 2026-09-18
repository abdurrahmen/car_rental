'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
}

export interface EmptyStateProps {
  icon?: 'car' | 'building' | 'users' | 'calendar' | 'search' | React.ReactNode
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

function renderDefaultIcon(iconType: string) {
  switch (iconType) {
    case 'car':
      return (
        <svg className="w-7 h-7 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
          />
        </svg>
      )
    case 'building':
      return (
        <svg className="w-7 h-7 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      )
    case 'users':
      return (
        <svg className="w-7 h-7 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )
    case 'calendar':
      return (
        <svg className="w-7 h-7 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    case 'search':
    default:
      return (
        <svg className="w-7 h-7 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )
  }
}

/**
 * Apple-style Unified Empty State Component.
 * Standardized on 48px padding (py-12 px-6), elevated white card, and crisp typography.
 */
export function EmptyState({
  icon = 'search',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-3xl border border-black/[0.06] bg-white shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] py-12 px-6 text-center flex flex-col items-center justify-center transition-all ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-neutral-100/90 flex items-center justify-center mb-4 shadow-xs">
        {typeof icon === 'string' ? renderDefaultIcon(icon) : icon}
      </div>

      <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-neutral-500 max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && (
        <div>
          {action.href ? (
            <Link
              href={action.href}
              className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[40px]"
            >
              {action.label}
            </Link>
          ) : (
            <Button
              variant={action.variant || 'primary'}
              size="sm"
              onClick={action.onClick}
              className="px-5 py-2.5 min-h-[40px]"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
