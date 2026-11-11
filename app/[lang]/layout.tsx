import { Suspense } from 'react';
import { Cairo, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { isRtl, LOCALES } from '@/lib/utils/constants';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import type { Language } from '@/types';

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});


export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

/**
 * Locale-aware root layout.
 * Sets lang and dir attributes on <html> for RTL/LTR support.
 * Loads Cairo (Arabic+Latin) and Inter (Latin fallback) fonts.
 */
export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const { lang } = await params;

  // Validate locale
  if (!LOCALES.includes(lang as Language)) {
    notFound();
  }

  const rtl = isRtl(lang);

  return (
    <html
      lang={lang}
      dir={rtl ? 'rtl' : 'ltr'}
      className={`${cairo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-background text-foreground selection:bg-brand-500/20 selection:text-brand-900">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
