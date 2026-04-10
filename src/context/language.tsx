"use client";

import { loadData } from "@/utils/secureStorage";
import { createContext, useContext, useState, ReactNode } from "react";

export const countries = [
  { id: "vi", label: "", icon: "/flags/vi.png" },
  { id: "eng", label: "", icon: "/flags/eng.png" },
];

export const countriesLabel = [
  { id: "vi", label: "Tiếng Việt", icon: "" },
  { id: "eng", label: "English", icon: "" },
];

export type LanguageContextType = {
  language?: string;
  setLanguage: (state: string) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: loadData<string>("KEY_LANGUAGE") ?? "",
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<string>();

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
