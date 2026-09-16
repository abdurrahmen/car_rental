import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'كراء السيارات | Car Rental Algeria',
  description:
    'منصة كراء السيارات في الجزائر - احجز سيارتك بسهولة | Plateforme de location de voitures en Algérie',
};

/**
 * Minimal root layout that wraps the entire app.
 * The actual HTML shell with lang/dir is in app/[lang]/layout.tsx.
 * This exists because Next.js requires a root layout at app/layout.tsx.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return children;
}
