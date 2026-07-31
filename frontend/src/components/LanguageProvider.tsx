"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Dictionaries
import tr from '../locales/tr.json';
import en from '../locales/en.json';
import az from '../locales/az.json';
import ru from '../locales/ru.json';

const dictionaries: Record<string, any> = {
  tr,
  en,
  az,
  ru
};

type TranslateParams = Record<string, string | number>;

type LanguageContextType = {
  locale: string;
  setLocale: (lang: string) => void;
  t: (key: string, params?: TranslateParams) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLocale = 'tr' }: { children: ReactNode, initialLocale?: string }) {
  const [locale, setLocaleState] = useState<string>(initialLocale);

  useEffect(() => {
    // İstemcide cookie okuyarak locale güncelle
    const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/);
    if (match) {
      const storedLocale = match[2];
      if (['tr', 'en', 'az', 'ru'].includes(storedLocale)) {
        setLocaleState(storedLocale);
      }
    }
  }, []);

  const setLocale = (lang: string) => {
    setLocaleState(lang);
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`; // 1 yıl
  };

  const t = (key: string, params?: TranslateParams): string => {
    const dict = dictionaries[locale] || dictionaries['tr'];
    let text = dict[key] || (params && params.defaultValue ? String(params.defaultValue) : key);
    
    if (params) {
      Object.keys(params).forEach(paramKey => {
        if (paramKey !== 'defaultValue') {
          text = text.replace(new RegExp(`\\{\\{${paramKey}\\}\\}|\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
        }
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
