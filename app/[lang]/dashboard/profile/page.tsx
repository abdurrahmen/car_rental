import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import type { Language, Profile } from '@/types';

interface ProfilePageProps {
  params: Promise<{ lang: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single();

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
