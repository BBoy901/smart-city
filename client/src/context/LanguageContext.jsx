import { createContext, useContext, useEffect, useState } from 'react';
import en from '../locales/en';
import sw from '../locales/sw';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'smart-city-language';

const translations = {
  en,
  sw,
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const part of keys) {
      value = value?.[part];
    }

    if (value !== undefined) return value;

    // Fallback to English if a translation is missing.
    value = translations.en;

    for (const part of keys) {
      value = value?.[part];
    }

    return value ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}