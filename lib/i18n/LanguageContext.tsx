"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Lang } from "./translations";

type T = typeof translations.en;

interface LanguageContextValue {
  lang: Lang;
  t: T;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chief-lang") as Lang | null;
    if (saved === "en" || saved === "zh") setLang(saved);
  }, []);

  const toggle = () => {
    setLang((prev) => {
      const next = prev === "en" ? "zh" : "en";
      localStorage.setItem("chief-lang", next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
