'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, User, Car, MapPin, DollarSign, CheckCircle2, Loader2 } from 'lucide-react'
import { ClientPicker } from '@/components/reservations/ClientPicker'
import { VehiclePicker } from '@/components/reservations/VehiclePicker'
import { ValidationSummary } from '@/components/reservations/ValidationSummary'
import { ReservationSummary } from '@/components/reservations/ReservationSummary'
import { StepBadge, StepStatus } from '@/components/reservations/StepBadge'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { Checkbox } from '@/components/ui/Checkbox'
import { Select } from '@/components/ui/Select'
import { createWalkInReservation } from '@/lib/actions/reservations'
import type { Language } from '@/types'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plate_number: string
  daily_rate: number
  deposit_amount: number
  status: string
  branch_id: string
}

interface Branch {
  id: string
  name_ar: string
  name_fr: string
  name_en: string
}

interface WalkInReservationFormProps {
  locale: Language
  vehicles: Vehicle[]
  branches: Branch[]
  userRole: string
  userBranchId?: string | null
}

export function WalkInReservationForm({
  locale,
  vehicles,
  branches,
  userRole,
  userBranchId,
}: WalkInReservationFormProps) {
  const router = useRouter()
  const isArabic = locale === 'ar'
  const [isPending, startTransition] = useTransition()
  
  // Refs for focus management
  const clientSectionRef = useRef<HTMLDivElement>(null)
  const vehicleSectionRef = useRef<HTMLDivElement>(null)
  const datesSectionRef = useRef<HTMLDivElement>(null)
  
  // Form state
  const [customerId, setCustomerId] = useState('')
  const [customerType, setCustomerType] = useState<'profile' | 'guest'>('profile')
  const [customerName, setCustomerName] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pickupBranchId, setPickupBranchId] = useState(userBranchId || '')
  const [dropoffBranchId, setDropoffBranchId] = useState(userBranchId || '')
  const [sameAgency, setSameAgency] = useState(true)
  const [notes, setNotes] = useState('')
  const [staffNotes, setStaffNotes] = useState('')
  const [autoConfirm, setAutoConfirm] = useState(true)
  const [depositPaidCash, setDepositPaidCash] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  // Set today as default start date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
  }, [])

  // Sync dropoff with pickup when sameAgency is true
  useEffect(() => {
    if (sameAgency) {
      setDropoffBranchId(pickupBranchId)
    }
  }, [sameAgency, pickupBranchId])

  // Update selected vehicle when vehicleId changes
  useEffect(() => {
    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === vehicleId)
      setSelectedVehicle(vehicle || null)
    } else {
      setSelectedVehicle(null)
    }
  }, [vehicleId, vehicles])

  // Calculated pricing
  const days = startDate && endDate 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  const totalPrice = selectedVehicle ? (selectedVehicle.daily_rate * days) : 0
  const depositAmount = selectedVehicle?.deposit_amount || 0

  // Validation
  const validationIssues = []
  if (!customerId) {
    validationIssues.push({
      field: 'customer',
      message: isArabic ? 'اختر الزبون' : 'Sélectionnez un client',
    })
  }
  if (!vehicleId) {
    validationIssues.push({
      field: 'vehicle',
      message: isArabic ? 'اختر المركبة' : 'Sélectionnez un véhicule',
    })
  }
  if (!startDate) {
    validationIssues.push({
      field: 'startDate',
      message: isArabic ? 'حدد تاريخ الاستلام' : 'Sélectionnez la date de début',
    })
  }
  if (!endDate) {
    validationIssues.push({
      field: 'endDate',
      message: isArabic ? 'حدد تاريخ الإرجاع' : 'Sélectionnez la date de fin',
    })
  }
  if (!pickupBranchId) {
    validationIssues.push({
      field: 'pickupBranch',
      message: isArabic ? 'اختر فرع الاستلام' : 'Sélectionnez l\'agence de retrait',
    })
  }
  if (!dropoffBranchId) {
    validationIssues.push({
      field: 'dropoffBranch',
      message: isArabic ? 'اختر فرع الإرجاع' : 'Sélectionnez l\'agence de restitution',
    })
  }

  const isValid = validationIssues.length === 0

  // Get branch names for summary
  const pickupBranch = branches.find(b => b.id === pickupBranchId)
  const dropoffBranch = branches.find(b => b.id === dropoffBranchId)
  const pickupBranchName = pickupBranch ? (locale === 'ar' ? pickupBranch.name_ar : pickupBranch.name_fr) : ''
  const dropoffBranchName = dropoffBranch ? (locale === 'ar' ? dropoffBranch.name_ar : dropoffBranch.name_fr) : ''

  // Step status calculation
  const getStepStatus = (stepNumber: number): StepStatus => {
    switch (stepNumber) {
      case 1: // Client
        return customerId ? 'done' : 'active'
      case 2: // Dates
        return startDate && endDate ? 'done' : customerId ? 'active' : 'todo'
      case 3: // Vehicle
        return vehicleId ? 'done' : (customerId && startDate && endDate) ? 'active' : 'todo'
      case 4: // Notes (always optional/done)
        return 'done'
      case 5: // Payment (always done)
        return 'done'
      default:
        return 'todo'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttemptedSubmit(true)
    
    if (!isValid) {
      // Focus first invalid field
      if (!customerId && clientSectionRef.current) {
        clientSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (!vehicleId && vehicleSectionRef.current) {
        vehicleSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if ((!startDate || !endDate) && datesSectionRef.current) {
        datesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('customer_id', customerId)
      formData.append('customer_type', customerType)
      formData.append('vehicle_id', vehicleId)
      formData.append('start_date', startDate)
      formData.append('end_date', endDate)
      formData.append('pickup_branch_id', pickupBranchId)
      formData.append('dropoff_branch_id', dropoffBranchId)
      formData.append('notes', notes)
      formData.append('staff_notes', staffNotes)
      formData.append('auto_confirm', autoConfirm.toString())
      formData.append('deposit_paid_cash', depositPaidCash.toString())
      formData.append('payment_method', paymentMethod)

      const result = await createWalkInReservation(null, formData)

      if (result.error) {
        alert(result.error)
      } else {
        alert(
          isArabic
            ? '✅ تم إنشاء الحجز بنجاح!'
            : '✅ Réservation créée avec succès!'
        )
        router.push(`/${locale}/${userRole === 'admin' ? 'admin' : 'staff'}/reservations`)
      }
    })
  }

  return (
    <div className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header - No card */}
      <div className="mb-6 lg:mb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          <a href={`/${locale}/${userRole === 'admin' ? 'admin' : 'staff'}/reservations`} className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            {isArabic ? 'الحجوزات' : 'Réservations'}
          </a>
          <span>›</span>
          <span className="text-neutral-900 dark:text-neutral-100">
            {isArabic ? 'حجز جديد' : 'Nouvelle réservation'}
          </span>
        </nav>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
          {isArabic ? 'حجز جديد في الوكالة' : 'Nouvelle réservation walk-in'}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {isArabic 
            ? 'إنشاء حجز جديد لزبون حاضر في الوكالة'
            : 'Créer une réservation pour un client présent en agence'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
        {/* Main form column */}
        <div className="space-y-4 lg:space-y-5 pb-32 lg:pb-8">

          {/* Validation Summary */}
          {attemptedSubmit && validationIssues.length > 0 && (
            <ValidationSummary issues={validationIssues} locale={locale} />
          )}

          {/* Client Selection */}
          <div ref={clientSectionRef} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge number={1} status={getStepStatus(1)} />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {isArabic ? 'زبون' : 'Client'}
              </h2>
            </div>
            
            <ClientPicker
              value={customerId}
              onChange={(id, type, name) => {
                setCustomerId(id)
                setCustomerType(type)
                setCustomerName(name || '')
              }}
              locale={locale}
            />
          </div>

          {/* Dates & Locations - NOW STEP 2 */}
          <div ref={datesSectionRef} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge number={2} status={getStepStatus(2)} />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {isArabic ? 'تواريخ و أماكن' : 'Dates et lieux'}
              </h2>
            </div>

            <div className="space-y-4">
              {/* Date Range Picker */}
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                locale={locale}
                label={isArabic ? 'فترة الإيجار' : 'Période de location'}
                error={attemptedSubmit && (!startDate || !endDate) ? (isArabic ? 'الفترة مطلوبة' : 'La période est requise') : undefined}
              />

              {/* Pickup Agency */}
              <Select
                label={isArabic ? 'فرع الاستلام' : 'Agence de retrait'}
                value={pickupBranchId}
                onChange={(e) => setPickupBranchId(e.target.value)}
                options={branches.map(branch => ({
                  value: branch.id,
                  label: locale === 'ar' ? branch.name_ar : branch.name_fr
                }))}
                placeholder={isArabic ? 'Choisir une agence' : 'Choisir une agence'}
                disabled={userRole !== 'admin'}
                required
              />

              {/* Same Agency Checkbox */}
              <Checkbox
                checked={sameAgency}
                onChange={(e) => setSameAgency(e.target.checked)}
                label={isArabic ? 'الإرجاع في نفس الوكالة' : 'Restitution dans la même agence'}
                description={isArabic
                  ? 'سيتم إرجاع المركبة في نفس مكان الاستلام'
                  : 'Le véhicule sera restitué au même endroit'}
              />

              {/* Dropoff Agency - Hidden when sameAgency is true */}
              {!sameAgency && (
                <div className="animate-apple-fade-in">
                  <Select
                    label={isArabic ? 'فرع الإرجاع' : 'Agence de restitution'}
                    value={dropoffBranchId}
                    onChange={(e) => setDropoffBranchId(e.target.value)}
                    options={branches.map(branch => ({
                      value: branch.id,
                      label: locale === 'ar' ? branch.name_ar : branch.name_fr
                    }))}
                    placeholder={isArabic ? 'Choisir une agence' : 'Choisir une agence'}
                    disabled={userRole !== 'admin'}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Selection - NOW STEP 3 */}
          <div ref={vehicleSectionRef} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge number={3} status={getStepStatus(3)} />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {isArabic ? 'مركبة' : 'Véhicule'}
              </h2>
            </div>
            
            <VehiclePicker
              value={vehicleId}
              onChange={setVehicleId}
              locale={locale}
              branchId={pickupBranchId}
              startDate={startDate}
              endDate={endDate}
              userRole={userRole}
            />
          </div>

          {/* Notes */}
          <details className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <summary className="px-6 py-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StepBadge number={4} status={getStepStatus(4)} />
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  {isArabic ? 'ملاحظات' : 'Notes'}
                </h2>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  {isArabic ? 'اختياري' : 'Optionnel'}
                </span>
              </div>
            </summary>
            <div className="px-6 pb-6 pt-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {isArabic ? 'ملاحظات الزبون' : 'Notes du client'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={isArabic ? 'طلبات خاصة للزبون...' : 'Demandes spéciales du client...'}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {isArabic ? 'ملاحظات داخلية' : 'Notes internes (staff)'}
                </label>
                <textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  rows={2}
                  placeholder={isArabic ? 'ملاحظات داخلية للفريق...' : 'Notes internes pour l\'équipe...'}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>
          </details>

          {/* Payment Options */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <StepBadge number={5} status={getStepStatus(5)} />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {isArabic ? 'دفع' : 'Paiement'}
              </h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoConfirm}
                  onChange={(e) => setAutoConfirm(e.target.checked)}
                  className="mt-1 w-4 h-4 text-brand-600 rounded border-neutral-300 focus:ring-brand-500"
                />
                <div>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {isArabic ? 'تأكيد الحجز مباشرة' : 'Confirmer immédiatement'}
                  </span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {isArabic 
                      ? 'تأكيد الحجز بدون انتظار موافقة إدارية'
                      : 'Confirmer sans attendre validation administrative'
                    }
                  </p>
                </div>
              </label>

              {autoConfirm && (
                <label className="flex items-start gap-3 cursor-pointer ms-7">
                  <input
                    type="checkbox"
                    checked={depositPaidCash}
                    onChange={(e) => setDepositPaidCash(e.target.checked)}
                    className="mt-1 w-4 h-4 text-brand-600 rounded border-neutral-300 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {isArabic ? 'تم دفع العربون نقداً' : 'Caution réglée en espèces'}
                    </span>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {isArabic 
                        ? `المبلغ المستلم: ${depositAmount.toLocaleString()} دج`
                        : `Montant encaissé: ${depositAmount.toLocaleString()} DZD`
                      }
                    </p>
                  </div>
                </label>
              )}

              {depositPaidCash && (
                <div className="ms-7">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {isArabic ? 'طريقة الدفع' : 'Méthode de paiement'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full max-w-xs px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="cash">{isArabic ? 'نقدي' : 'Espèces'}</option>
                    <option value="edahabia">Edahabia</option>
                    <option value="ccp">CCP</option>
                    <option value="baridimob">Baridimob</option>
                    <option value="cib">CIB</option>
                    <option value="bank_transfer">{isArabic ? 'تحويل بنكي' : 'Virement'}</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar summary - hidden on mobile, sticky on desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <ReservationSummary
              locale={locale}
              clientName={customerName}
              vehicleLabel={selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})` : undefined}
              startDate={startDate}
              endDate={endDate}
              pickupBranchName={pickupBranchName}
              dropoffBranchName={dropoffBranchName}
              days={days}
              dailyRate={selectedVehicle?.daily_rate || 0}
              totalPrice={totalPrice}
              depositAmount={depositAmount}
            />
          </div>
        </div>

        {/* Sticky action bar - mobile only */}
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            {days > 0 && totalPrice > 0 && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isArabic ? 'المبلغ الإجمالي' : 'Total'}
                </p>
                <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
                  {totalPrice.toLocaleString()} DZD
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="px-4 py-3 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={isPending || !isValid}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isArabic ? 'جارٍ...' : 'En cours...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isArabic ? 'إنشاء' : 'Créer'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden lg:flex items-center justify-end gap-4 pt-4 col-span-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="px-6 py-3 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isArabic ? 'إلغاء' : 'Annuler'}
          </button>
          <button
            type="submit"
            disabled={isPending || !isValid}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isArabic ? 'جارٍ الإنشاء...' : 'Création...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{isArabic ? 'إنشاء الحجز' : 'Créer la Réservation'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
