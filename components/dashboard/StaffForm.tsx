'use client';

import React, { useActionState, useState } from 'react';
import { createStaffAccount } from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
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
    <div className="mb-8">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} variant="primary">
          + Add Staff Account
        </Button>
      ) : (
        <form
          action={formAction}
          className="p-6 sm:p-8 bg-white rounded-3xl border border-black/[0.06] shadow-sm space-y-6 max-w-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-heading font-bold text-brand-900 text-lg">
              Create Staff Account
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-700 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-black/[0.04] transition-colors inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>

          {state?.error && (
            <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
              Staff account registered successfully!
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
            <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
              Create Account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
