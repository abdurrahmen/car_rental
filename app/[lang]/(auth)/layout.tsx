import Link from 'next/link'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isArabic = lang === 'ar'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBFD] dark:bg-black p-4 sm:p-6 relative overflow-hidden"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 start-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-brand-500/10 via-brand-500/5 to-transparent blur-3xl opacity-60"
      />

      {/* Floating Home Back Button */}
      <Link
        href={`/${lang}`}
        className="absolute top-6 start-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 hover:bg-white transition-all shadow-xs apple-press min-h-[36px]"
      >
        <span className={isArabic ? 'rotate-180' : ''}>&larr;</span>
        <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
      </Link>

      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  )
}
