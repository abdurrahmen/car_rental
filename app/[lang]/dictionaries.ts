import 'server-only';
import { notFound } from 'next/navigation';

const dictionaries = {
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
  fr: () => import('@/dictionaries/fr.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = Awaited<ReturnType<typeof dictionaries.ar>>;

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

/** Get dictionary by locale */
export const getDictionary = async (locale: string = 'ar') => {
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
};

/** Get dictionary by explicit locale */
export const getDictionaryByLocale = async (locale: string) => {
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
};
