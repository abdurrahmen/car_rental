'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Loader2, AlertCircle, User as UserIcon } from 'lucide-react'
import { Field } from '@/components/ui/Field'
import { createGuestClient } from '@/lib/actions/guest-clients'
import type { Language } from '@/types'

export interface AddClientModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (client: { id: string; full_name: string; phone: string; phone_display: string }) => void
  locale: Language
  prefillName?: string
  prefillPhone?: string
}

interface FieldError {
  full_name?: string
  phone?: string
}

export function AddClientModal({
  open,
  onClose,
  onSuccess,
  locale,
  prefillName = '',
  prefillPhone = '',
}: AddClientModalProps) {
  const isArabic = locale === 'ar'
  
  const [fullName, setFullName] = useState(prefillName)
  const [phone, setPhone] = useState(prefillPhone)
  const [errors, setErrors] = useState<FieldError>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [duplicateClient, setDuplicateClient] = useState<{
    id: string
    full_name: string
    phone: string
  } | null>(null)
  
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Prefill when modal opens
  useEffect(() => {
    if (open) {
      // Use a microtask to avoid setState during render
      Promise.resolve().then(() => {
        setFullName(prefillName)
        setPhone(prefillPhone)
        setErrors({})
        setServerError(null)
        setIsDirty(false)
        setDuplicateClient(null)
      })
      
      // Focus name input after modal animation
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [open, prefillName, prefillPhone])

  const validateField = (field: 'full_name' | 'phone', value: string): string | undefined => {
    if (field === 'full_name') {
      const trimmed = value.trim()
      if (trimmed.length === 0) {
        return isArabic ? 'الاسم مطلوب' : 'Le nom est requis'
      }
      if (trimmed.length < 2) {
        return isArabic ? 'الاسم قصير جداً' : 'Le nom est trop court'
      }
      if (!/^[\p{L}\p{M}\s'-]+$/u.test(trimmed)) {
        return isArabic 
          ? 'الاسم يحتوي على أحرف غير صالحة'
          : 'Le nom contient des caractères invalides'
      }
    }

    if (field === 'phone') {
      const trimmed = value.trim()
      if (trimmed.length === 0) {
        return isArabic ? 'رقم الهاتف مطلوب' : 'Le téléphone est requis'
      }
    }

    return undefined
  }

  const handleBlur = (field: 'full_name' | 'phone') => {
    const value = field === 'full_name' ? fullName : phone
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent, forceCreate = false) => {
    e.preventDefault()
    
    // Validate all fields
    const nameError = validateField('full_name', fullName)
    const phoneError = validateField('phone', phone)
    
    if (nameError || phoneError) {
      setErrors({ full_name: nameError, phone: phoneError })
      return
    }
    
    setIsSubmitting(true)
    setServerError(null)
    
    try {
      const result = await createGuestClient({
        full_name: fullName.trim(),
        phone: phone.trim(),
      })
      
      if (result.error) {
        if (result.error === 'duplicate' && result.existing && !forceCreate) {
          // Show duplicate confirmation
          setDuplicateClient(result.existing)
          setIsSubmitting(false)
          return
        }
        
        // Handle field-specific errors
        if (result.field) {
          setErrors((prev) => ({ ...prev, [result.field!]: result.error }))
        } else {
          setServerError(result.error)
        }
        setIsSubmitting(false)
        return
      }
      
      if (result.success && result.client) {
        // Success - call onSuccess and close
        onSuccess(result.client)
        handleClose()
      }
    } catch (error) {
      console.error('[AddClientModal] submit error:', error)
      setServerError(
        isArabic
          ? 'حدث خطأ غير متوقع'
          : 'Une erreur inattendue s\'est produite'
      )
      setIsSubmitting(false)
    }
  }

  const handleUseDuplicate = () => {
    if (!duplicateClient) return
    
    onSuccess({
      id: duplicateClient.id,
      full_name: duplicateClient.full_name,
      phone: duplicateClient.phone,
      phone_display: duplicateClient.phone,
    })
    handleClose()
  }

  const handleClose = () => {
    // Prevent closing if form is dirty and unsaved (unless explicitly cancelled)
    if (isDirty && !window.confirm(
      isArabic
        ? 'هل تريد إغلاق النموذج بدون حفظ؟'
        : 'Fermer sans enregistrer ?'
    )) {
      return
    }
    
    onClose()
  }

  const handleChange = (field: 'full_name' | 'phone', value: string) => {
    if (field === 'full_name') {
      setFullName(value)
    } else {
      setPhone(value)
    }
    
    setIsDirty(true)
    
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setServerError(null)
    setDuplicateClient(null)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isArabic ? 'زبون جديد' : 'Nouveau client'}
      size="md"
    >
      {/* Icon header */}
      <div className="flex justify-center mb-4 -mt-2">
        <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        </div>
      </div>
      {/* Server error banner */}
      {serverError && (
        <div 
          className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{serverError}</p>
          </div>
        </div>
      )}

      {/* Duplicate client confirmation */}
      {duplicateClient && (
        <div 
          className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <UserIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                {isArabic
                  ? 'زبون موجود بهذا الرقم:'
                  : 'Un client avec ce numéro existe déjà :'}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                <strong>{duplicateClient.full_name}</strong>
                <br />
                <bdi dir="ltr" className="text-xs">{duplicateClient.phone}</bdi>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseDuplicate}
                  className="
                    px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-amber-600 text-white
                    hover:bg-amber-700
                    transition-colors
                  "
                >
                  {isArabic ? 'استخدم هذا الزبون' : 'Utiliser ce client'}
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateClient(null)}
                  className="
                    px-3 py-1.5 rounded-lg text-xs font-semibold
                    text-amber-700 dark:text-amber-300
                    hover:bg-amber-100 dark:hover:bg-amber-950/50
                    transition-colors
                  "
                >
                  {isArabic ? 'إنشاء على أي حال' : 'Créer quand même'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name */}
        <Field
          label={isArabic ? 'الاسم الكامل' : 'Nom complet'}
          error={errors.full_name}
          required
        >
          <input
            ref={nameInputRef}
            id="client-name"
            type="text"
            value={fullName}
            onChange={(e) => handleChange('full_name', e.target.value)}
            onBlur={() => handleBlur('full_name')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            disabled={isSubmitting}
            className={`
              w-full h-11 px-4 rounded-xl
              border ${errors.full_name ? 'border-danger-500' : 'border-neutral-300 dark:border-neutral-700'}
              bg-white dark:bg-neutral-800
              text-neutral-900 dark:text-white
              focus:ring-2 focus:ring-brand-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
            placeholder={isArabic ? 'مثال: محمد بن علي' : 'Ex: Ahmed Benali'}
            autoComplete="name"
            aria-invalid={!!errors.full_name}
          />
        </Field>

        {/* Phone */}
        <Field
          label={isArabic ? 'رقم الهاتف' : 'Téléphone'}
          error={errors.phone}
          helper={isArabic
            ? 'صيغ مقبولة: 0550123456 أو +213 550 12 34 56'
            : 'Formats acceptés : 0550 12 34 56 ou +213 550 12 34 56'}
          required
        >
          <input
            id="client-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            disabled={isSubmitting}
            className={`
              w-full h-11 px-4 rounded-xl
              border ${errors.phone ? 'border-danger-500' : 'border-neutral-300 dark:border-neutral-700'}
              bg-white dark:bg-neutral-800
              text-neutral-900 dark:text-white
              focus:ring-2 focus:ring-brand-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
            placeholder="05 XX XX XX XX"
            autoComplete="tel"
            dir="ltr"
            aria-invalid={!!errors.phone}
          />
        </Field>

        {/* Helper text */}
        <div className="pt-2 pb-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isArabic
              ? 'الاسم ورقم الهاتف كافيان. لا حاجة لإنشاء حساب.'
              : 'Nom et téléphone suffisent. Aucun compte à créer.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="
              px-5 py-2.5 rounded-xl
              text-sm font-semibold
              text-neutral-700 dark:text-neutral-300
              hover:bg-neutral-100 dark:hover:bg-neutral-800
              transition-colors
              disabled:opacity-50
            "
          >
            {isArabic ? 'إلغاء' : 'Annuler'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !!errors.full_name || !!errors.phone}
            className="
              inline-flex items-center gap-2
              px-5 py-2.5 rounded-xl
              text-sm font-bold
              bg-brand-600 text-white
              hover:bg-brand-700
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isArabic ? 'جارٍ الحفظ...' : 'Enregistrement...'}</span>
                </>
              ) : (
                <span>{isArabic ? 'حفظ ومتابعة' : 'Enregistrer et continuer'}</span>
              )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
