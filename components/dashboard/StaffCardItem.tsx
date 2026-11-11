'use client';

import React, { useState } from 'react';
import { Avatar, StatusBadge } from '@/components/admin';
import { EditStaffModal } from '@/components/dashboard/EditStaffModal';
import { Phone, Building, Edit3 } from 'lucide-react';
import type { Branch, Language, Profile } from '@/types';

export interface StaffCardItemProps {
  staff: Profile & { branch?: Branch };
  branches: Branch[];
  locale: Language;
  currentRole?: string;
}

export function StaffCardItem({
  staff,
  branches,
  locale,
  currentRole = 'admin',
}: StaffCardItemProps) {
  const isArabic = locale === 'ar';
  const [isEditOpen, setIsEditOpen] = useState(false);

  const roleColor =
    staff.role === 'admin'
      ? 'blue'
      : staff.role === 'branch_manager'
      ? 'amber'
      : 'green';

  const roleLabel =
    staff.role === 'admin'
      ? isArabic ? 'مدير عام (Superadmin)' : 'Superadmin'
      : staff.role === 'branch_manager'
      ? isArabic ? 'مدير وكالة (Manager)' : 'Branch Manager'
      : isArabic ? 'عضو طاقم (Staff)' : 'Staff Agent';

  const branchLabel = staff.branch
    ? locale === 'ar'
      ? staff.branch.name_ar
      : locale === 'fr'
      ? staff.branch.name_fr
      : staff.branch.name_en
    : isArabic ? 'الإدارة العامة / جميع الوكالات' : 'Headquarters / All Branches';

  return (
    <>
      <div className="admin-card p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 admin-card-hover">
        <div className="flex items-start sm:items-center gap-4">
          <Avatar name={staff.full_name || 'Staff'} size="lg" />

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-bold text-base text-neutral-900 tracking-tight">
                {staff.full_name || (isArabic ? 'عضو طاقم' : 'Staff Member')}
              </h3>
              <StatusBadge color={roleColor} showDot>
                {roleLabel}
              </StatusBadge>
            </div>

            <p className="text-xs text-neutral-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{staff.phone || (isArabic ? 'لا يوجد رقم مسجل' : 'No phone registered')}</span>
            </p>

            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{branchLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <span className="text-[11px] text-neutral-400 font-mono px-2 py-1 rounded-md bg-neutral-100">
            #{staff.id.substring(0, 8)}
          </span>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="apple-press inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تعديل' : 'Edit'}</span>
          </button>
        </div>
      </div>

      <EditStaffModal
        staff={staff}
        branches={branches}
        locale={locale}
        currentRole={currentRole}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  );
}
