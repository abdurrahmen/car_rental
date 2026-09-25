'use client'

import React from 'react'
import { Check, ClipboardCheck } from 'lucide-react'
import type { Language } from '@/types'

export interface DigitalGuaranteeProps {
  locale: Language
}

export function DigitalGuarantee({ locale }: DigitalGuaranteeProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  return (
    <section id="guarantee" className="py-20 sm:py-28 bg-[#F6F6F9] border-t border-black/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Start: Explanatory Content (Span 6) */}
          <div className="lg:col-span-6 text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
              <span>{isArabic ? 'ضمان الشفافية التامة' : isFrench ? 'Garantie Transparence 100%' : '100% Digital Trust'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight mb-4">
              {isArabic ? (
                <>
                  محضر فحص رقمي (PV) <br />
                  <span className="text-brand-500 font-extrabold">يحمي عربونك وحقك</span> بالكامل.
                </>
              ) : isFrench ? (
                <>
                  État des lieux numérique <br />
                  <span className="text-brand-500 font-extrabold">Votre caution protégée</span> sans surprise.
                </>
              ) : (
                <>
                  Digital Condition Handover <br />
                  <span className="text-brand-500 font-extrabold">Your Deposit Protected</span> With Zero Friction.
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
              {isArabic
                ? 'وداعاً للنزاعات والعقود الورقية المبهمة. قبل استلام المفاتيح، يتم فحص السيارة بشكل مشترك عبر الهاتف أو اللوحة الذكية، مع التقاط صور واضحة لجميع الزوايا وتوثيق عداد الكيلومترات ومستوى الوقود.'
                : isFrench
                ? 'Fini les litiges et les contrats papier illisibles. Avant de prendre la route, notre agent établit avec vous un état des lieux contradictoire avec photos horodatées, niveau de carburant et kilométrage certifié.'
                : 'No more deposit disputes or ambiguous paper slips. Before departure, a joint digital report is compiled with timestamped 360° photos, certified odometer reading, and fuel verification.'}
            </p>

            <div className="space-y-3.5">
              {[
                {
                  title: isArabic ? 'توثيق فوري بالصور عند الاستلام والتسليم' : isFrench ? 'Photos contradictoires horodatées' : '360° Timestamped Photos',
                  desc: isArabic
                    ? 'يتم تخزين صور الهيكل والعجلات في محضر إلكتروني موثق تستلمه فوراً عبر هاتفك.'
                    : 'Inspection photos saved directly to your digital reservation profile.',
                },
                {
                  title: isArabic ? 'استرجاع فوري للعربون (5000 دج)' : isFrench ? 'Restitution immédiate de la caution' : 'Instant 5,000 DZD Deposit Return',
                  desc: isArabic
                    ? 'بمجرد فحص السيارة عند الإرجاع ومطابقتها للمحضر، يُلغى حجز العربون فوراً.'
                    : 'The pre-authorization hold is released upon vehicle return check.',
                },
                {
                  title: isArabic ? 'حماية من تكرار الحجز على قاعدة البيانات' : isFrench ? 'Garantie anti-double réservation' : 'Zero Double-Booking Guarantee',
                  desc: isArabic
                    ? 'قيود قاعدة بيانات متقدمة (GiST) تمنع حجز سيارتك لشخص آخر في نفس التاريخ.'
                    : 'Database exclusion constraints guarantee your vehicle cannot be double-booked.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right / End: Interactive PV Document Mockup Visual (Span 6) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.06)] relative space-y-4">
              {/* PV Sheet Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                      PV #2026-0894
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span>VERIFIED</span>
                      <Check className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono block mt-1">
                    PROCÈS-VERBAL DE PRISE EN CHARGE
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-brand-50 border border-brand-100/60">
                  <ClipboardCheck className="w-6 h-6 text-brand-600" />
                </div>
              </div>

              {/* Inspection Matrix */}
              <div className="space-y-2.5 text-xs text-start">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04]">
                  <span className="text-neutral-500">{isArabic ? 'المركبة' : 'Vehicle'}</span>
                  <span className="font-bold text-neutral-900">Renault Clio V (01423-124-16)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04]">
                    <span className="text-[10px] text-neutral-400 uppercase block font-mono">ODOMETER</span>
                    <span className="font-mono font-bold text-neutral-900">42,180 KM</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04]">
                    <span className="text-[10px] text-neutral-400 uppercase block font-mono">FUEL LEVEL</span>
                    <span className="font-mono font-bold text-emerald-600">FULL (8/8)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/[0.04] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">PHOTOS CAPTURED</span>
                    <span className="text-[11px] text-brand-600 font-semibold">4 / 4 ANGLES</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Front', 'Side L', 'Side R', 'Rear'].map((angle, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] rounded-lg bg-neutral-200/70 overflow-hidden flex items-center justify-center text-[9px] text-neutral-500 font-mono"
                      >
                        {angle}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signature Seal */}
              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-mono">TIMESTAMPED SIGNATURE</span>
                  <span className="font-semibold text-neutral-800">
                    {isArabic ? 'توقيع العميل وطاقم الوكالة' : 'Customer & Agent Digitally Signed'}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
