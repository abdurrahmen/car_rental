import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import type { Language, Profile } from '@/types';

import { getAuthUser } from '@/lib/auth';

interface ProfilePageProps {
  params: Promise<{ lang: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const user = await getAuthUser();
  const userId = user?.id || 'd0000000-0000-0000-0000-000000000001';

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile && user) {
    profile = {
      id: user.id,
      full_name: user.full_name || 'Karim Benali',
      phone: '+213 550 12 34 56',
      role: user.role,
      branch_id: user.branch_id || null,
      preferred_language: locale,
      license_number: 'DZ-2018-094821',
      license_document_url: null,
      license_verified: true,
      is_blacklisted: false,
      no_show_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-brand-900 mb-6">
        {dict.profile.my_profile}
      </h1>
      <ProfileForm
        profile={profile as Profile}
        locale={locale}
        dictionary={dict}
      />
    </div>
  );
}
