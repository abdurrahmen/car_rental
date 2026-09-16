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

export function FileUpload({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  label,
  error,
  preview = false
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
      alert('File too large')
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

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-neutral-700">{label}</span>
      )}
      
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors
          ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'}
          ${error ? 'border-danger-500' : ''}
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
          <div className="absolute inset-0 p-2">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-neutral-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-neutral-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-neutral-500">Max size: {Math.round(maxSize / 1024 / 1024)}MB</p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-danger-500 mt-1">{error}</p>
      )}
    </div>
  )
}
