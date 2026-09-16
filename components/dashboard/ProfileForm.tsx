'use client';

import React, { useActionState } from 'react';
import { updateProfile, uploadLicense } from '@/lib/actions/profiles';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Badge } from '@/components/ui/Badge';
import type { Profile, Language, Dictionary } from '@/types';

export interface ProfileFormProps {
  profile: Profile | null;
  locale?: Language;
  lang?: Language;
  dictionary?: Dictionary;
  dict?: Dictionary;
}

export function ProfileForm({
  profile,
  locale,
  lang,
  dictionary,
  dict,
}: ProfileFormProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language;
  const effectiveDict = dictionary || dict;

  const [updateState, updateAction, isUpdating] = useActionState(
    updateProfile,
    null,
  );
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadLicense,
    null,
  );

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Verification Status */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <div>
          <span className="text-sm font-medium text-neutral-600 block">
            {effectiveDict?.profile?.license_verified || 'Driver License Status'}
          </span>
          <span className="text-xs text-neutral-500">
            {profile?.license_verified
              ? 'Your license has been reviewed and verified by staff.'
              : 'Your license is pending verification.'}
          </span>
        </div>
        <Badge variant={profile?.license_verified ? 'success' : 'warning'}>
          {profile?.license_verified ? 'Verified' : 'Pending Verification'}
        </Badge>
      </div>

      {/* Personal Info Form */}
      <form action={updateAction} className="space-y-4">
        <h2 className="text-lg font-heading font-bold text-brand-900 border-b border-neutral-100 pb-2">
          {effectiveDict?.profile?.my_profile || 'Personal Information'}
        </h2>

        {updateState?.error && (
          <div className="p-3 bg-danger-50 text-danger-700 border border-danger-200 rounded-lg text-sm">
            {updateState.error}
          </div>
        )}

        {updateState?.success && (
          <div className="p-3 bg-success-50 text-success-700 border border-success-200 rounded-lg text-sm">
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

        <Input
          type="text"
          name="license_number"
          label={effectiveDict?.profile?.license_number || 'Driver License Number'}
          defaultValue={profile?.license_number || ''}
        />

        <Button
          type="submit"
          variant="primary"
          loading={isUpdating}
          disabled={isUpdating}
        >
          {effectiveDict?.profile?.save_changes || 'Save Changes'}
        </Button>
      </form>

      {/* License Upload Section */}
      <form action={uploadAction} className="space-y-4 pt-6 border-t border-neutral-200">
        <h2 className="text-lg font-heading font-bold text-brand-900 border-b border-neutral-100 pb-2">
          {effectiveDict?.profile?.upload_license || "Upload Driver's License"}
        </h2>

        {uploadState?.error && (
          <div className="p-3 bg-danger-50 text-danger-700 border border-danger-200 rounded-lg text-sm">
            {uploadState.error}
          </div>
        )}

        {uploadState?.success && (
          <div className="p-3 bg-success-50 text-success-700 border border-success-200 rounded-lg text-sm">
            License document uploaded successfully!
          </div>
        )}

        <p className="text-sm text-neutral-600">
          Please upload a clear copy of your driver's license (front or both sides). Documents are stored securely and reviewed by our branch staff.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Document File (JPG, PNG, PDF)
          </label>
          <input
            type="file"
            name="file"
            accept="image/*,.pdf"
            required
            className="block w-full text-sm text-neutral-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 min-h-[44px]"
          />
        </div>

        {profile?.license_document_url && (
          <p className="text-xs text-success-700 font-medium">
            ✓ You have an uploaded license document on file.
          </p>
        )}

        <Button
          type="submit"
          variant="secondary"
          loading={isUploading}
          disabled={isUploading}
        >
          {effectiveDict?.profile?.upload_license || 'Upload Document'}
        </Button>
      </form>
    </div>
  );
}
