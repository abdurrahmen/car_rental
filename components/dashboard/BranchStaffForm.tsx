'use client';

import React, { useActionState, useState } from 'react';
import { createBranchStaffAccount } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { X, UserPlus, Check } from 'lucide-react';
import type { Language } from '@/types';

export function BranchStaffForm({
  locale,
  branchName,
}: {
  locale: Language;
  branchName: string;
}) {
  const isArabic = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createBranchStaffAccount, null);

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="apple-press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-all min-h-[40px] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isArabic ? 'إضافة موظف لوكالتك' : 'Add Branch Staff'}</span>
        </button>
      ) : (
        <form
          action={formAction}
          className="admin-card p-4 md:p-6 space-y-4 max-w-xl animate-apple-fade-in border border-black/[0.08]"
        >
          <div className="flex justify-between items-center pb-2 border-b border-black/[0.04]">
            <div>
              <h3 className="font-bold text-neutral-900 text-base tracking-tight">
                {isArabic ? 'إضافة عضو جديد لطاقم الوكالة' : 'Add New Branch Staff Member'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isArabic ? `الفرع المخصص: ${branchName}` : `Assigned Branch: ${branchName}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {state?.error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{isArabic ? 'تم إنشاء حساب الموظف بنجاح!' : 'Staff account created successfully!'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              name="full_name"
              label={isArabic ? 'الاسم الكامل' : 'Full Name'}
              placeholder="e.g. Amina Khelif"
              required
            />
            <Input
              type="text"
              name="phone"
              label={isArabic ? 'رقم الهاتف' : 'Phone Number'}
              placeholder="+213 550 12 34 56"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="email"
              name="email"
              label={isArabic ? 'البريد الإلكتروني' : 'Staff Email'}
              placeholder="agent@dzrent.dz"
              required
            />
            <Input
              type="password"
              name="password"
              label={isArabic ? 'كلمة المرور' : 'Initial Password'}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <Select
              name="role"
              label={isArabic ? 'الرتبة والمسؤولية' : 'Assigned Role'}
              defaultValue="staff"
              options={[
                { value: 'staff', label: isArabic ? 'عضو طاقم الوكالة (Staff Agent)' : 'Branch Staff Agent' },
                { value: 'branch_manager', label: isArabic ? 'مدير فرع (Branch Manager)' : 'Branch Manager' },
              ]}
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              disabled={isPending}
            >
              {isArabic ? 'إنشاء الحساب' : 'Create Staff Member'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
