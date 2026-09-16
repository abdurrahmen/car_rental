import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { BranchForm } from '@/components/dashboard/BranchForm';
import type { Language, Branch } from '@/types';

interface AdminBranchesPageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminBranchesPage({
  params,
}: AdminBranchesPageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-brand-900">
            {dict.admin.manage_branches}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure rental agency locations, cities, and contact details.
          </p>
        </div>
      </div>

      <BranchForm locale={locale} />

      <div className="grid gap-4">
        {branches && branches.length > 0 ? (
          (branches as Branch[]).map((b) => (
            <div
              key={b.id}
              className="p-5 bg-card border border-neutral-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-heading font-bold text-lg text-brand-900">
                  {locale === 'ar'
                    ? b.name_ar
                    : locale === 'fr'
                      ? b.name_fr
                      : b.name_en}
                </h3>
                <p className="text-xs text-neutral-400">
                  {b.name_ar} · {b.name_fr} · {b.name_en}
                </p>
                <p className="text-sm text-neutral-600 mt-2">
                  📍 {b.address}, {b.city}
                </p>
                <p className="text-sm text-accent-600 font-medium mt-1">
                  📞 {b.phone}
                </p>
              </div>

              <span className="text-xs px-3 py-1 bg-success-50 text-success-700 font-semibold rounded-full self-start sm:self-center">
                Active Branch
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-500">
            No branches found. Add your first agency branch above!
          </div>
        )}
      </div>
    </div>
  );
}
