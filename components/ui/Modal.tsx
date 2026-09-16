'use client'

import React, { useEffect, useRef } from 'react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Apple-style Modal dialog with frosted glass backdrop, rounded-3xl container,
 * and smooth scale-in entrance.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <dialog
      ref={dialogRef}
      className={`
        backdrop:bg-black/35 backdrop:backdrop-blur-md
        bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
        rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.18)]
        border border-black/[0.06] dark:border-white/[0.1]
        w-[calc(100%-2rem)] ${sizes[size]} p-0 m-auto
        overflow-hidden animate-apple-scale-in
      `}
    >
      <div className="flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  )
}
