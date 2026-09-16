export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-800 to-brand-900 p-4 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <a href={`/${lang}`} className="absolute top-4 start-4 text-white hover:text-brand-200">
        &larr; Back to Home
      </a>
      {children}
    </div>
  );
}
