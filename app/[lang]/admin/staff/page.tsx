import { createClient } from '@/lib/supabase/server';
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries';
import { StaffForm } from '@/components/dashboard/StaffForm';
import { Badge } from '@/components/ui/Badge';
import type { Language, Profile, Branch } from '@/types';

interface AdminStaffPageProps {
  params: Promise<{ lang: string }>;
}

export default async function AdminStaffPage({ params }: AdminStaffPageProps) {
  const { lang } = await params;
  const locale = lang as Language;
  const dict = await getDictionaryByLocale(lang);
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from('profiles')
    .select('*, branch:branches(*)')
    .in('role', ['staff', 'branch_manager', 'admin'])
    .order('created_at', { ascending: false });

  const { data: branches } = await supabase.from('branches').select('*');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-brand-900">
            {dict.admin.manage_staff}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage branch agents, managers, and system administrators.
          </p>
        </div>
      </div>

      <StaffForm
        branches={(branches as Branch[]) || []}
        locale={locale}
      />

      <div className="grid gap-4">
        {staff && staff.length > 0 ? (
          (staff as (Profile & { branch?: Branch })[]).map((s) => (
            <div
              key={s.id}
              className="p-5 bg-card border border-neutral-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-heading font-bold text-lg text-brand-900">
                    {s.full_name || 'Staff Member'}
                  </h3>
                  <Badge
                    variant={
                      s.role === 'admin'
                        ? 'danger'
                        : s.role === 'branch_manager'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {s.role}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  📞 {s.phone || 'No phone'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Branch:{' '}
                  <span className="font-medium text-neutral-800">
                    {s.branch
                      ? locale === 'ar'
                        ? s.branch.name_ar
                        : locale === 'fr'
                          ? s.branch.name_fr
                          : s.branch.name_en
                      : 'Headquarters / All Branches'}
                  </span>
                </p>
              </div>

              <span className="text-xs text-neutral-400 font-mono">
                ID: #{s.id.substring(0, 8)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-500">
            No staff accounts found.
          </div>
        )}
      </div>
    </div>
  );
}
