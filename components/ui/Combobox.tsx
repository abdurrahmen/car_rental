'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Check, ChevronDown, Loader2 } from 'lucide-react'

export interface ComboboxOption {
  id: string
  label: string
  subtitle?: string
  metadata?: Record<string, unknown>
  disabled?: boolean
  renderOption?: () => React.ReactNode
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string, option: ComboboxOption | null) => void
  onSearch?: (query: string) => void
  placeholder?: string
  emptyMessage?: string
  loading?: boolean
  disabled?: boolean
  className?: string
  noResultsAction?: {
    label: string
    onClick: () => void
  }
}

/**
 * Searchable combobox with keyboard navigation
 * Supports debounced search, custom actions on empty results
 */
export function Combobox({
  options,
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  emptyMessage = 'No results found',
  loading = false,
  disabled = false,
  className = '',
  noResultsAction,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const selectedOption = options.find((opt) => opt.id === value)

  // Debounced search
  useEffect(() => {
    if (!onSearch) return

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, onSearch])

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [options])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return
    const items = listRef.current.querySelectorAll('li')
    const highlighted = items[highlightedIndex]
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, isOpen])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (isOpen && options.length > 0) {
          const selected = options[highlightedIndex]
          if (selected && !selected.disabled) {
            onChange(selected.id, selected)
            setIsOpen(false)
            setQuery('')
          }
        } else if (isOpen && options.length === 0 && noResultsAction) {
          noResultsAction.onClick()
        } else {
          setIsOpen(true)
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setQuery('')
        break

      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex((prev) => 
            prev < options.length - 1 ? prev + 1 : prev
          )
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break

      case 'Tab':
        if (isOpen) {
          setIsOpen(false)
        }
        break

      default:
        if (!isOpen) {
          setIsOpen(true)
        }
    }
  }

  const handleSelect = (option: ComboboxOption) => {
    if (option.disabled) return
    onChange(option.id, option)
    setIsOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-neutral-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : selectedOption?.label || ''}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            setQuery('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full ps-10 pe-10 py-3 rounded-xl
            border border-neutral-300 dark:border-neutral-700
            bg-white dark:bg-neutral-800
            text-neutral-900 dark:text-white
            placeholder-neutral-400
            focus:ring-2 focus:ring-brand-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
          aria-label="Search client"
          aria-expanded={isOpen}
          aria-controls="combobox-list"
          aria-activedescendant={
            isOpen && options.length > 0
              ? `option-${highlightedIndex}`
              : undefined
          }
          role="combobox"
        />

        <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          id="combobox-list"
          role="listbox"
          className="
            absolute z-50 w-full mt-2 
            bg-white dark:bg-neutral-800
            border border-neutral-200 dark:border-neutral-700
            rounded-xl shadow-lg
            max-h-60 overflow-auto
            py-1
          "
        >
          {loading && options.length === 0 && (
            <li className="px-4 py-3 text-sm text-neutral-500 text-center">
              <Loader2 className="w-4 h-4 animate-spin inline-block me-2" />
              Recherche en cours...
            </li>
          )}

          {!loading && options.length === 0 && (
            <li className="px-4 py-3 text-sm text-neutral-500">
              {emptyMessage}
              {noResultsAction && query.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    noResultsAction.onClick()
                    setIsOpen(false)
                  }}
                  className="
                    mt-2 w-full px-3 py-2 rounded-lg
                    bg-brand-50 dark:bg-brand-950/30
                    text-brand-700 dark:text-brand-400
                    text-xs font-semibold
                    hover:bg-brand-100 dark:hover:bg-brand-950/50
                    transition-colors
                  "
                >
                  {noResultsAction.label}
                </button>
              )}
            </li>
          )}

          {options.map((option, index) => (
            <li
              key={option.id}
              id={`option-${index}`}
              role="option"
              aria-selected={option.id === value}
              aria-disabled={option.disabled}
              onClick={() => !option.disabled && handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-4 py-2.5 transition-colors
                ${option.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
                ${highlightedIndex === index && !option.disabled
                  ? 'bg-brand-50 dark:bg-brand-950/30' 
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                }
                ${option.id === value ? 'font-semibold' : ''}
              `}
            >
              {option.renderOption ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    {option.renderOption()}
                  </div>
                  {option.id === value && (
                    <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ms-2" />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-neutral-900 dark:text-white truncate">
                      {option.label}
                    </div>
                    {option.subtitle && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5" dir="ltr">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                  {option.id === value && (
                    <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ms-2" />
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
