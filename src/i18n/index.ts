import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, type Locale, type TranslationKey } from "./translations";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, replacements?: Record<string, string>) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: (navigator.language.startsWith("de") ? "de" : "en") as Locale,

      setLocale: (locale) => set({ locale }),

      t: (key, replacements) => {
        const { locale } = get();
        let str: string = translations[locale][key] ?? translations.en[key] ?? key;
        if (replacements) {
          for (const [k, v] of Object.entries(replacements)) {
            str = str.split(`{${k}}`).join(v);
          }
        }
        return str;
      },
    }),
    { name: "stackpage-locale", partialize: (s) => ({ locale: s.locale }) }
  )
);
