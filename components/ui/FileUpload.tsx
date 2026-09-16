'use client'

import React, { useRef, useState } from 'react'

export interface FileUploadProps {
  accept?: string
  maxSize?: number
  onFileSelect: (file: File | null) => void
  label?: string
  error?: string
  preview?: boolean
}

/**
 * Apple-style FileUpload with subtle dashed border, drag-and-drop support,
 * and image thumbnail preview with removal action.
 */
export function FileUpload({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  label,
  error,
  preview = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const processFile = (selectedFile: File) => {
    if (selectedFile.size > maxSize) {
      alert('File size exceeds the limit')
      return
    }
    setFile(selectedFile)
    onFileSelect(selectedFile)

    if (preview && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setPreviewUrl(null)
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 ps-0.5">
          {label}
        </span>
      )}

      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[160px] p-4 border border-dashed rounded-2xl cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            dragActive
              ? 'border-brand-500 bg-brand-500/5 ring-4 ring-brand-500/15'
              : 'border-neutral-300/90 dark:border-neutral-700 bg-neutral-50/70 hover:bg-neutral-100/70 hover:border-neutral-400'
          }
          ${error ? 'border-danger-500 bg-danger-50/30' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {preview && previewUrl ? (
          <div className="relative w-full flex flex-col items-center gap-2">
            <div className="relative w-32 h-24 rounded-xl overflow-hidden shadow-sm border border-black/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-xs text-danger-600 hover:text-danger-700 font-medium px-2 py-1 rounded-full hover:bg-danger-50 transition-colors"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-2">
            <div className="w-10 h-10 mb-2.5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Drop your document here or <span className="text-brand-500">browse</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Supports JPEG, PNG up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger-600 font-medium ps-1 animate-apple-fade-in">
          {error}
        </p>
      )}
    </div>
  )
}
