'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, User, Car, MapPin, DollarSign, CheckCircle2, Loader2 } from 'lucide-react'
import { ClientPicker } from '@/components/reservations/ClientPicker'
import { VehiclePicker } from '@/components/reservations/VehiclePicker'
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
  
  // Form state
  const [customerId, setCustomerId] = useState('')
  const [customerType, setCustomerType] = useState<'profile' | 'guest'>('profile')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerId || !vehicleId || !startDate || !endDate || !pickupBranchId || !dropoffBranchId) {
      alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis')
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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          {isArabic ? 'حجز جديد في الوكالة' : 'Nouvelle Réservation Walk-in'}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isArabic 
            ? 'إنشاء حجز جديد لزبون حاضر في الوكالة'
            : 'Créer une réservation pour un client présent en agence'
          }
        </p>
      </div>

      {/* Customer Selection */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {isArabic ? '1. اختر الزبون' : '1. Sélectionner le Client'}
          </h2>
        </div>
        
        <ClientPicker
          value={customerId}
          onChange={(id, type) => {
            setCustomerId(id)
            setCustomerType(type)
          }}
          locale={locale}
        />
      </div>

      {/* Vehicle Selection */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {isArabic ? '2. اختر المركبة' : '2. Sélectionner le Véhicule'}
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

      {/* Dates & Branches */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {isArabic ? '3. التواريخ و المكان' : '3. Dates et Lieux'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {isArabic ? 'تاريخ الاستلام' : 'Date de début'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {isArabic ? 'تاريخ الإرجاع' : 'Date de fin'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {isArabic ? 'فرع الاستلام' : 'Agence de retrait'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <select
              value={pickupBranchId}
              onChange={(e) => setPickupBranchId(e.target.value)}
              required
              disabled={userRole !== 'admin'}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">{isArabic ? '-- اختر فرعاً --' : '-- Choisir une agence --'}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {locale === 'ar' ? branch.name_ar : branch.name_fr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {isArabic ? 'فرع الإرجاع' : 'Agence de restitution'}
              <span className="text-red-500 ms-1">*</span>
            </label>
            <select
              value={dropoffBranchId}
              onChange={(e) => setDropoffBranchId(e.target.value)}
              required
              disabled={sameAgency || userRole !== 'admin'}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">{isArabic ? '-- اختر فرعاً --' : '-- Choisir une agence --'}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {locale === 'ar' ? branch.name_ar : branch.name_fr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Same agency checkbox */}
        <div className="mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAgency}
              onChange={(e) => setSameAgency(e.target.checked)}
              className="mt-1 w-4 h-4 text-brand-600 rounded border-neutral-300 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                {isArabic ? 'الإرجاع في نفس الوكالة' : 'Restitution dans la même agence'}
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isArabic
                  ? 'سيتم إرجاع المركبة في نفس مكان الاستلام'
                  : 'Le véhicule sera restitué au même endroit'}
              </p>
            </div>
          </label>
        </div>

        {/* Price calculation */}
        {days > 0 && selectedVehicle && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-700 dark:text-emerald-300">
                {isArabic ? 'عدد الأيام:' : 'Nombre de jours:'}
              </span>
              <span className="font-bold text-emerald-900 dark:text-emerald-100">{days}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-700 dark:text-emerald-300">
                {isArabic ? 'التعريفة اليومية:' : 'Tarif journalier:'}
              </span>
              <span className="font-bold text-emerald-900 dark:text-emerald-100">{selectedVehicle.daily_rate.toLocaleString()} DZD</span>
            </div>
            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-100">
                  {isArabic ? 'المبلغ الإجمالي:' : 'Montant total:'}
                </span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalPrice.toLocaleString()} DZD</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
          {isArabic ? '4. ملاحظات' : '4. Notes'}
        </h2>

        <div className="space-y-4">
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
      </div>

      {/* Payment Options */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {isArabic ? '5. خيارات الدفع' : '5. Options de Paiement'}
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

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
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
          disabled={isPending || !customerId || !vehicleId || !startDate || !endDate}
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
  )
}
