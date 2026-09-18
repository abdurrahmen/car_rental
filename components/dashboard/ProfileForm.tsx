'use client'

import React, { useActionState } from 'react'
import { updateProfile, uploadLicense } from '@/lib/actions/profiles'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { Badge } from '@/components/ui/Badge'
import type { Profile, Language, Dictionary } from '@/types'

export interface ProfileFormProps {
  profile: Profile | null
  locale?: Language
  lang?: Language
  dictionary?: Dictionary
  dict?: Dictionary
}

/**
 * Apple-style Customer Profile Form with license upload & verification badge.
 */
export function ProfileForm({
  profile,
  locale,
  lang,
  dictionary,
  dict,
}: ProfileFormProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language
  const effectiveDict = dictionary || dict

  const [updateState, updateAction, isUpdating] = useActionState(
    updateProfile,
    null
  )
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadLicense,
    null
  )

  const isArabic = effectiveLocale === 'ar'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Verification Status Pill Banner */}
      <div className="flex items-center justify-between p-5 bg-neutral-50/80 rounded-2xl border border-black/[0.04]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
            {effectiveDict?.profile?.license_verified || 'License Status'}
          </span>
          <span className="text-xs text-neutral-600">
            {profile?.license_verified
              ? isArabic
                ? 'رخصة السياقة معتمدة ومحققة من قبل طاقم الوكالة.'
                : 'Your driver license is fully verified.'
              : isArabic
              ? 'الرخصة قيد المراجعة أو بانتظار رفع الوثيقة.'
              : 'Driver license pending upload or verification.'}
          </span>
        </div>
        <Badge
          variant={profile?.license_verified ? 'success' : 'warning'}
          showDot={true}
          className="text-xs font-semibold px-3 py-1"
        >
          {profile?.license_verified
            ? isArabic ? 'معتمدة' : 'Verified'
            : isArabic ? 'قيد التدقيق' : 'Pending'}
        </Badge>
      </div>

      {/* Personal Info Form */}
      <form action={updateAction} className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900 border-b border-black/[0.05] pb-3">
          {effectiveDict?.profile?.my_profile || 'Personal Information'}
        </h2>

        {updateState?.error && (
          <div className="p-3.5 bg-rose-500/10 text-rose-700 border border-rose-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            {updateState.error}
          </div>
        )}

        {updateState?.success && (
          <div className="p-3.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            {effectiveDict?.profile?.save_changes || 'Profile updated successfully!'}
          </div>
        )}

        <Input
          type="text"
          name="full_name"
          label={effectiveDict?.profile?.full_name || 'Full Name'}
          defaultValue={profile?.full_name || ''}
          required
        />

        <Input
          type="tel"
          name="phone"
          label={effectiveDict?.profile?.phone || 'Phone Number'}
          defaultValue={profile?.phone || ''}
          required
        />

        <Input
          type="text"
          name="license_number"
          label={effectiveDict?.profile?.license_number || 'Driver License Number'}
          defaultValue={profile?.license_number || ''}
          placeholder="e.g. 16/1234567"
        />

        <Select
          name="preferred_language"
          label={effectiveDict?.profile?.language || 'Preferred Language'}
          defaultValue={profile?.preferred_language || effectiveLocale}
          options={[
            { value: 'ar', label: 'العربية (Arabic)' },
            { value: 'fr', label: 'Français (French)' },
            { value: 'en', label: 'English' },
          ]}
        />

        <Button
          type="submit"
          variant="primary"
          loading={isUpdating}
          disabled={isUpdating}
          className="mt-2"
        >
          {effectiveDict?.profile?.edit_profile || 'Save Changes'}
        </Button>
      </form>

      {/* Driver License Document Upload */}
      <form action={uploadAction} className="space-y-4 pt-6 border-t border-black/[0.05]">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900">
          {effectiveDict?.profile?.upload_license || 'Upload License Document'}
        </h2>

        {uploadState?.error && (
          <div className="p-3.5 bg-rose-500/10 text-rose-700 border border-rose-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            {uploadState.error}
          </div>
        )}

        {uploadState?.success && (
          <div className="p-3.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
            License uploaded successfully!
          </div>
        )}

        <FileUpload
          accept="image/*,application/pdf"
          onFileSelect={() => {}}
          label="License Photo or Scan (Front & Back)"
          preview={true}
        />

        <Button
          type="submit"
          variant="secondary"
          loading={isUploading}
          disabled={isUploading}
        >
          Upload Document
        </Button>
      </form>
    </div>
  )
}
