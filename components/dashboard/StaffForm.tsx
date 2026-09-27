'use client';

import React, { useActionState, useState } from 'react';
import { createStaffAccount } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { X } from 'lucide-react';
import type { Branch, Language } from '@/types';

export function StaffForm({
  branches,
  locale,
}: {
  branches: Branch[];
  locale: Language;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createStaffAccount,
    null,
  );

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label:
      locale === 'ar' ? b.name_ar : locale === 'fr' ? b.name_fr : b.name_en,
  }));

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[40px] cursor-pointer"
        >
          <span className="text-sm leading-none">+</span>
          <span>{locale === 'ar' ? 'إضافة موظف جديد' : 'Add Staff Account'}</span>
        </button>
      ) : (
        <form
          action={formAction}
          className="admin-card p-4 md:p-6 space-y-6 max-w-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-neutral-900 text-base tracking-tight">
              {locale === 'ar' ? 'تسجيل موظف أو مدير فرع' : 'Create Staff Account'}
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
              {locale === 'ar' ? 'تم تسجيل الحساب بنجاح!' : 'Staff account registered successfully!'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="email"
              name="email"
              label="Staff Email"
              placeholder="agent@dzrent.dz"
              required
            />
            <Input
              type="password"
              name="password"
              label="Initial Password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              name="role"
              label="Assigned Role"
              placeholder={
                locale === 'ar'
                  ? 'اختر الرتبة...'
                  : locale === 'fr'
                  ? 'Sélectionner un rôle...'
                  : 'Select assigned role...'
              }
              defaultValue=""
              options={[
                { value: 'staff', label: 'Branch Staff Agent' },
                { value: 'branch_manager', label: 'Branch Manager' },
              ]}
              required
            />

            <Select
              name="branch_id"
              label="Assigned Agency Branch"
              placeholder={
                locale === 'ar'
                  ? 'اختر الوكالة...'
                  : locale === 'fr'
                  ? 'Sélectionner une agence...'
                  : 'Select assigned branch...'
              }
              defaultValue=""
              options={branchOptions}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[40px] disabled:opacity-60 cursor-pointer"
            >
              {isPending ? 'Saving...' : locale === 'ar' ? 'إنشاء الحساب' : 'Create Account'}
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
