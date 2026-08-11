"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Language, translations, TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en" ? "pl" : "en"));
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook - rzuca czytelny błąd, jeśli ktoś użyje go poza LanguageProvider,
// zamiast mylącego "Cannot read property of null"
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage musi być użyty wewnątrz <LanguageProvider>");
  }
  return context;
}