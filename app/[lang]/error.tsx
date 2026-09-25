'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-neutral-500 mb-6 text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="apple-press inline-flex items-center justify-center h-11 px-6 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm"
      >
        Try Again
      </button>
    </div>
  )
}
