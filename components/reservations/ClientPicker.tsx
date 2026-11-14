'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { User, Plus, Check } from 'lucide-react'
import { Combobox, ComboboxOption } from '@/components/ui/Combobox'
import { AddClientModal } from '@/components/reservations/AddClientModal'
import { searchClients, getRecentClients } from '@/lib/actions/guest-clients'
import type { Language } from '@/types'

export interface ClientPickerProps {
  value: string
  onChange: (clientId: string, clientType: 'profile' | 'guest', clientName?: string) => void
  locale: Language
  className?: string
}

export function ClientPicker({
  value,
  onChange,
  locale,
  className = '',
}: ClientPickerProps) {
  const isArabic = locale === 'ar'
  
  const [options, setOptions] = useState<ComboboxOption[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prefillName, setPrefillName] = useState('')
  const [prefillPhone, setPrefillPhone] = useState('')
  const [selectedClient, setSelectedClient] = useState<{
    id: string
    full_name: string
    phone_display: string
    type: 'profile' | 'guest'
  } | null>(null)

  const loadRecentClients = useCallback(async () => {
    setLoading(true)
    const result = await getRecentClients(10)
    if (result.success && result.clients) {
      setOptions(
        result.clients.map((c) => ({
          id: c.id,
          label: c.full_name,
          subtitle: c.phone_display,
          metadata: { type: c.type },
        }))
      )
    }
    setLoading(false)
  }, [])

  // Load recent clients on mount
  useEffect(() => {
    void loadRecentClients()
  }, [loadRecentClients])

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadRecentClients()
      return
    }

    setLoading(true)
    const result = await searchClients(query)
    
    if (result.success && result.clients) {
      setOptions(
        result.clients.map((c) => ({
          id: c.id,
          label: c.full_name,
          subtitle: c.phone_display,
          metadata: { type: c.type },
        }))
      )
    } else {
      setOptions([])
    }
    
    setLoading(false)
  }, [])

  const handleChange = (clientId: string, option: ComboboxOption | null) => {
    if (!option) return
    
    const clientType = option.metadata?.type as 'profile' | 'guest'
    setSelectedClient({
      id: clientId,
      full_name: option.label,
      phone_display: option.subtitle || '',
      type: clientType,
    })
    onChange(clientId, clientType, option.label)
  }

  const handleOpenModal = (searchQuery?: string) => {
    // Parse search query to detect phone vs name
    const digitsOnly = searchQuery?.replace(/\D/g, '') || ''
    const hasDigits = digitsOnly.length >= 3
    
    setPrefillName(hasDigits ? '' : searchQuery || '')
    setPrefillPhone(hasDigits ? searchQuery || '' : '')
    setIsModalOpen(true)
  }

  const handleModalSuccess = (client: {
    id: string
    full_name: string
    phone: string
    phone_display: string
  }) => {
    // Add to options
    const newOption: ComboboxOption = {
      id: client.id,
      label: client.full_name,
      subtitle: client.phone_display,
      metadata: { type: 'guest' },
    }
    setOptions((prev) => [newOption, ...prev])
    
    // Select it
    setSelectedClient({
      id: client.id,
      full_name: client.full_name,
      phone_display: client.phone_display,
      type: 'guest',
    })
    onChange(client.id, 'guest', client.full_name)
    
    // Show success toast (simple alert for now)
    setTimeout(() => {
      const message = isArabic ? 'تم إضافة الزبون ✓' : 'Client ajouté ✓'
      // Create a toast-like notification
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 start-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-lg animate-apple-fade-in'
      toast.textContent = message
      toast.setAttribute('role', 'status')
      toast.setAttribute('aria-live', 'polite')
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(-50%) translateY(-10px)'
        toast.style.transition = 'opacity 300ms, transform 300ms'
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    }, 100)
  }

  const handleClearSelection = () => {
    setSelectedClient(null)
    onChange('', 'profile')
  }

  return (
    <div className={className}>
      {!selectedClient ? (
        <>
          <div className="flex gap-2">
            <div className="flex-1">
              <Combobox
                options={options}
                value={value}
                onChange={handleChange}
                onSearch={handleSearch}
                placeholder={isArabic ? 'ابحث عن زبون...' : 'Rechercher un client...'}
                emptyMessage={isArabic ? 'لم يتم العثور على زبون' : 'Aucun client trouvé'}
                loading={loading}
                noResultsAction={{
                  label: isArabic ? '+ إضافة زبون' : '+ Ajouter un client',
                  onClick: () => handleOpenModal(),
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="
                inline-flex items-center gap-2 px-4 py-3 rounded-xl
                text-sm font-semibold
                bg-neutral-100 dark:bg-neutral-800
                text-neutral-700 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-neutral-700
                transition-colors
                shrink-0
              "
              aria-label={isArabic ? 'إضافة زبون جديد' : 'Ajouter un nouveau client'}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'إضافة' : 'Ajouter'}
              </span>
            </button>
          </div>

          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {isArabic
              ? 'زبون جديد؟ الاسم والهاتف كافيان، لا حاجة لإنشاء حساب.'
              : 'Nouveau client ? Nom et téléphone suffisent, aucun compte à créer.'}
          </p>
        </>
      ) : (
        /* Selected client card */
        <div className="p-4 rounded-xl border-2 border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {selectedClient.full_name}
                  </h3>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5" dir="ltr">
                  {selectedClient.phone_display}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="
                px-3 py-1.5 rounded-lg text-xs font-semibold
                text-brand-700 dark:text-brand-300
                hover:bg-brand-100 dark:hover:bg-brand-950/50
                transition-colors
                shrink-0
              "
            >
              {isArabic ? 'تغيير' : 'Changer'}
            </button>
          </div>
        </div>
      )}

      <AddClientModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        locale={locale}
        prefillName={prefillName}
        prefillPhone={prefillPhone}
      />
    </div>
  )
}
