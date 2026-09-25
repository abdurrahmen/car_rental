'use client'

import React, {
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md'
  icon?: React.ReactNode
}

/**
 * Apple-style custom Select dropdown component with frosted glass popover menu,
 * rotating chevron, active checkmark indicator, keyboard accessibility,
 * and seamless fallback synchronization with native form submissions.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      id,
      options = [],
      placeholder,
      value: controlledValue,
      defaultValue,
      onChange,
      disabled,
      required,
      name,
      size = 'md',
      icon,
      ...props
    },
    forwardedRef
  ) => {
    const defaultId = useId()
    const selectId = id || defaultId
    const containerRef = useRef<HTMLDivElement>(null)
    const internalSelectRef = useRef<HTMLSelectElement>(null)

    // Determine initial value
    const initialVal =
      (controlledValue !== undefined ? controlledValue : defaultValue) as string || ''
    const [selectedValue, setSelectedValue] = useState<string>(initialVal)
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    // Synchronize when controlled value changes externally
    useEffect(() => {
      if (controlledValue !== undefined) {
        setSelectedValue(String(controlledValue))
      }
    }, [controlledValue])

    // Find current selected option label
    const selectedOption = options.find(
      (opt) => String(opt.value) === String(selectedValue)
    )
    const displayLabel =
      selectedOption?.label || placeholder || (options[0]?.label ?? '')

    // Click outside and escape key handling
    useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen])

    const handleSelectOption = useCallback(
      (optionValue: string) => {
        setSelectedValue(optionValue)
        setIsOpen(false)

        const selectEl = internalSelectRef.current
        if (selectEl) {
          selectEl.value = optionValue
          // Dispatch native change event so React / forms pick it up
          const event = new Event('change', { bubbles: true })
          selectEl.dispatchEvent(event)
        }

        if (onChange) {
          const syntheticEvent = {
            target: { value: optionValue, name: name || '' },
            currentTarget: { value: optionValue, name: name || '' },
          } as unknown as React.ChangeEvent<HTMLSelectElement>
          onChange(syntheticEvent)
        }
      },
      [name, onChange]
    )

    // Keyboard navigation
    const handleTriggerKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>
    ) => {
      if (disabled) return

      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          const currentIndex = options.findIndex(
            (opt) => String(opt.value) === String(selectedValue)
          )
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0)
        } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelectOption(options[highlightedIndex].value)
        }
      } else if (e.key === 'ArrowUp' && isOpen) {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        )
      } else if (e.key === 'ArrowDown' && isOpen) {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        )
      }
    }

    return (
      <div
        ref={containerRef}
        className={`w-full flex flex-col gap-1.5 relative ${isOpen ? 'z-50' : 'z-10'}`}
      >
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-neutral-700 ps-0.5 text-start"
          >
            {label}
            {required && <span className="text-brand-500 ms-0.5">*</span>}
          </label>
        )}

        {/* Hidden native select for form serialization and ref forwarding */}
        <select
          ref={(node) => {
            internalSelectRef.current = node
            if (typeof forwardedRef === 'function') {
              forwardedRef(node)
            } else if (forwardedRef) {
              forwardedRef.current = node
            }
          }}
          id={selectId}
          name={name}
          value={selectedValue}
          onChange={(e) => {
            setSelectedValue(e.target.value)
            onChange?.(e)
          }}
          disabled={disabled}
          required={required}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Apple-Style Trigger Button */}
        <div className="relative w-full">
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            onKeyDown={handleTriggerKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={`
              flex w-full items-center justify-between appearance-none rounded-xl border border-neutral-300/80 bg-white
              ${size === 'sm' ? 'px-3 pe-8 py-1.5 text-xs min-h-[40px] h-10' : 'px-3.5 pe-9 py-2.5 text-xs sm:text-sm min-h-[44px]'}
              font-medium text-neutral-900
              text-start transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer
              hover:border-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100/50
              ${isOpen ? 'border-brand-500 ring-4 ring-brand-500/15' : ''}
              ${
                error
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15'
                  : ''
              }
              ${className}
            `}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 me-2">
              {icon && <span className="shrink-0">{icon}</span>}
              <span
                className={`truncate ${
                  !selectedOption && placeholder
                    ? 'text-neutral-400'
                    : 'text-neutral-900'
                }`}
              >
                {displayLabel}
              </span>
            </div>

            {/* Rotating Chevron Indicator */}
            <span
              className={`pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-brand-600' : 'text-neutral-400'
              }`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>

          {/* Custom Popover Options Menu */}
          {isOpen && (
            <div
              role="listbox"
              aria-label={label || 'Select option'}
              className="absolute z-[100] mt-1.5 w-full min-w-[200px] overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] p-1.5 shadow-[0_20px_40px_-6px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)] animate-apple-fade-in"
            >
              <div className="max-h-60 overflow-y-auto space-y-0.5 overscroll-contain">
                {options.map((option, idx) => {
                  const isSelected =
                    String(option.value) === String(selectedValue)
                  const isHighlighted = idx === highlightedIndex

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectOption(option.value)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm text-start font-medium transition-colors cursor-pointer
                        ${
                          isSelected
                            ? 'bg-brand-500/10 text-brand-600 font-semibold'
                            : isHighlighted
                            ? 'bg-neutral-100/90 text-neutral-900'
                            : 'text-neutral-700 hover:bg-neutral-100/60'
                        }
                      `}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <svg
                          className="h-4 w-4 shrink-0 text-brand-600 ms-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
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
)

Select.displayName = 'Select'
