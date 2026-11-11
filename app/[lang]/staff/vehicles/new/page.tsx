import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { VehicleForm } from '@/components/dashboard/VehicleForm';
import { FALLBACK_BRANCHES, FALLBACK_CATEGORIES } from '@/lib/data/fallback';
import Link from 'next/link';
import type { Language, VehicleCategory, Branch } from '@/types';

interface StaffNewVehiclePageProps {
  params: Promise<{ lang: string }>;
}

export default async function StaffNewVehiclePage({
  params,
}: StaffNewVehiclePageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { data: dbCategories } = await supabase
    .from('vehicle_categories')
    .select('*');
  const categories = (dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES) as VehicleCategory[];

  const { data: dbBranches } = await supabase.from('branches').select('*');
  const branches = (dbBranches && dbBranches.length > 0 ? dbBranches : FALLBACK_BRANCHES) as Branch[];

  const isArabic = locale === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/staff/vehicles`}
          className="apple-press w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          &larr;
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {dict.staff?.add_vehicle || 'Add Vehicle'}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isArabic
              ? 'إضافة مركبة جديدة إلى أسطول الوكالة وتحديد الأسعار اليومية.'
              : 'Add a new vehicle to the branch fleet with daily rental pricing.'}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <VehicleForm
          categories={categories}
          branches={branches}
          locale={locale}
          dictionary={dict}
        />
      </div>
    </div>
  );
}
