'use client';

import React, { useActionState, useEffect } from 'react';
import { updateStaffMember } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { X, UserCog, Check } from 'lucide-react';
import type { Branch, Language, Profile } from '@/types';

export interface EditStaffModalProps {
  staff: Profile & { branch?: Branch };
  branches: Branch[];
  locale: Language;
  currentRole?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditStaffModal({
  staff,
  branches,
  locale,
  currentRole = 'admin',
  isOpen,
  onClose,
}: EditStaffModalProps) {
  const isArabic = locale === 'ar';
  const isSuperadmin = currentRole === 'admin';
  const [state, formAction, isPending] = useActionState(updateStaffMember, null);

  const roleOptions = isSuperadmin
    ? [
        { value: 'staff', label: isArabic ? 'عضو طاقم الوكالة (Staff Agent)' : 'Branch Staff Agent' },
        { value: 'branch_manager', label: isArabic ? 'مدير فرع (Branch Manager)' : 'Branch Manager' },
        { value: 'admin', label: isArabic ? 'مدير عام للنظام (Superadmin)' : 'Superadmin' },
      ]
    : [
        { value: 'staff', label: isArabic ? 'عضو طاقم الوكالة (Staff Agent)' : 'Branch Staff Agent' },
        { value: 'branch_manager', label: isArabic ? 'مدير فرع (Branch Manager)' : 'Branch Manager' },
      ];

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: locale === 'ar' ? b.name_ar : locale === 'fr' ? b.name_fr : b.name_en,
  }));

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-apple-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/[0.08] p-6 sm:p-8 z-10 animate-apple-scale-in text-start">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base tracking-tight">
                {isArabic ? 'تعديل بيانات ورتبة الموظف' : 'Edit Staff Member & Role'}
              </h3>
              <span className="text-[11px] text-neutral-400 font-mono">
                #{staff.id.substring(0, 8)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {state?.error && (
          <div className="p-3.5 mb-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="p-3.5 mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{isArabic ? 'تم تحديث بيانات الموظف بنجاح!' : 'Staff profile updated successfully!'}</span>
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={staff.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              name="full_name"
              label={isArabic ? 'الاسم الكامل' : 'Full Name'}
              defaultValue={staff.full_name || ''}
              required
            />

            <Input
              type="text"
              name="phone"
              label={isArabic ? 'رقم الهاتف' : 'Phone Number'}
              defaultValue={staff.phone || ''}
              placeholder="+213 550 11 22 33"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              name="role"
              label={isArabic ? 'الرتبة والمسؤولية' : 'Assigned Role'}
              options={roleOptions}
              defaultValue={staff.role}
              required
            />

            {isSuperadmin ? (
              <Select
                name="branch_id"
                label={isArabic ? 'الوكالة التابع لها' : 'Assigned Branch'}
                options={branchOptions}
                defaultValue={staff.branch_id || ''}
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  {isArabic ? 'الوكالة' : 'Branch Scope'}
                </label>
                <div className="p-2.5 rounded-xl bg-neutral-100 text-xs text-neutral-600 font-medium">
                  {staff.branch
                    ? locale === 'ar'
                      ? staff.branch.name_ar
                      : staff.branch.name_en
                    : isArabic ? 'وكالتك الحالية' : 'Current Branch'}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.04]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              disabled={isPending}
            >
              {isArabic ? 'حفظ التعديلات' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
