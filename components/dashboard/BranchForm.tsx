'use client';

import React, { useActionState, useState } from 'react';
import { createBranch } from '@/lib/actions/branches';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';
import type { Language } from '@/types';

export function BranchForm({ locale }: { locale: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createBranch, null);

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[40px] cursor-pointer"
        >
          <span className="text-sm leading-none">+</span>
          <span>{locale === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch'}</span>
        </button>
      ) : (
        <form
          action={formAction}
          className="admin-card p-4 md:p-6 space-y-6 max-w-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-neutral-900 text-base tracking-tight">
              {locale === 'ar' ? 'إنشاء فرع جديد' : 'Create New Branch'}
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-700 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-black/[0.04] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</span>
            </button>
          </div>

          {state?.error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium">
              {locale === 'ar' ? 'تم إنشاء الفرع بنجاح!' : 'Branch created successfully!'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              name="name_ar"
              label="Name (Arabic)"
              placeholder="فرع الجزائر العاصمة"
              required
            />
            <Input
              name="name_fr"
              label="Name (French)"
              placeholder="Agence Alger Centre"
              required
            />
            <Input
              name="name_en"
              label="Name (English)"
              placeholder="Algiers Central Branch"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="city"
              label="City / Wilaya"
              placeholder="Algiers"
              required
            />
            <Input
              name="phone"
              label="Contact Phone"
              placeholder="+213 21 00 00 00"
              required
            />
          </div>

          <Input
            name="address"
            label="Street Address"
            placeholder="123 Didouche Mourad Street"
            required
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[40px] disabled:opacity-60 cursor-pointer"
            >
              {isPending ? 'Saving...' : locale === 'ar' ? 'حفظ الفرع' : 'Create Branch'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="apple-press inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-all min-h-[40px] cursor-pointer"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
