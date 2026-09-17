'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteVehicle } from '@/lib/actions/vehicles'

export interface VehicleDeleteButtonProps {
  vehicleId: string
  vehicleName: string
  confirmTitle?: string
  confirmMessage?: string
  deleteLabel?: string
  cancelLabel?: string
}

export function VehicleDeleteButton({
  vehicleId,
  vehicleName,
  confirmTitle = 'Remove Vehicle from Fleet?',
  confirmMessage = 'Are you sure you want to remove this vehicle? If it has historical rental records, it will be safely retired from active service.',
  deleteLabel = 'Delete',
  cancelLabel = 'Cancel',
}: VehicleDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const res = await deleteVehicle(vehicleId)
      if (res.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors min-h-[36px]"
        title={deleteLabel}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span>{deleteLabel}</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-apple-fade-in"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {confirmTitle}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                {vehicleName}
              </p>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {confirmMessage}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setError(null)
                  setIsOpen(false)
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="apple-press px-4 py-2 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Processing...' : deleteLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
