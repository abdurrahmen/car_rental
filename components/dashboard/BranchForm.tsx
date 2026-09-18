'use client';

import React, { useActionState, useState } from 'react';
import { createBranch } from '@/lib/actions/branches';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Language } from '@/types';

export function BranchForm({ locale }: { locale: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createBranch, null);

  return (
    <div className="mb-8">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} variant="primary">
          + Add New Branch
        </Button>
      ) : (
        <form
          action={formAction}
          className="p-6 sm:p-8 bg-white rounded-3xl border border-black/[0.06] shadow-sm space-y-6 max-w-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-heading font-bold text-brand-900 text-lg">
              Create New Branch
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-700 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-black/[0.04] transition-colors"
            >
              ✕ Cancel
            </button>
          </div>

          {state?.error && (
            <div className="p-3.5 bg-danger-50 text-danger-700 border border-danger-200 rounded-2xl text-xs font-medium">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="p-3.5 bg-success-50 text-success-700 border border-success-200 rounded-2xl text-xs font-medium">
              Branch created successfully!
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
            <Button type="submit" variant="primary" loading={isPending} disabled={isPending}>
              Create Branch
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
