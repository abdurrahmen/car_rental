import 'server-only';
import { cache } from 'react';
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

/** Get dictionary by locale (cached per request) */
export const getDictionary = cache(async (locale: string = 'ar') => {
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
});

/** Get dictionary by explicit locale (cached per request) */
export const getDictionaryByLocale = cache(async (locale: string) => {
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
});
