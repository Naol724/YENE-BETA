import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Locale = 'en' | 'am';

type Dict = Record<string, string>;

const en: Dict = {
  'nav.home': 'Home',
  'nav.listings': 'Listings',
  'nav.messages': 'Messages',
  'nav.post': 'Post',
  'nav.more': 'More',
  'hero.title': 'Find homes for rent in Ethiopia',
  'hero.subtitle': 'Discover apartments, houses, and studios across Ethiopian cities.',
  'hero.cta': 'View listings',
  'hero.searchPlaceholder': 'Location, price, property type…',
};

/** Amharic placeholder labels — replace with real translations when ready */
const am: Dict = {
  ...en,
  'nav.home': 'መነሻ',
  'nav.listings': 'ዝርዝሮች',
  'nav.messages': 'መልዕክቶች',
  'hero.title': 'በኢትዮጵያ የሚከራዩ ቤቶች ያግኙ',
  'hero.subtitle': 'በአዲስ አበባ እና በሌሎች ከተሞች አፓርታማ፣ ቪላ እና ስቱዲዮ ያግኙ።',
  'hero.cta': 'ዝርዝሮችን ይመልከቱ',
};

const LOCALES: Record<Locale, Dict> = { en, am };

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof en | string) => string;
} | null>(null);

const STORAGE_KEY = 'houserental_locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    const s = localStorage.getItem(STORAGE_KEY) as Locale | null;
    return s === 'am' ? 'am' : 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string) => {
      const table = LOCALES[locale];
      return table[key] ?? en[key] ?? key;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
