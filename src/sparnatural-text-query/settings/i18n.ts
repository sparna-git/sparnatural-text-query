// i18n.ts
import en from "../lang/en.json";
import fr from "../lang/fr.json";

// If you use TS: set "resolveJsonModule": true in tsconfig.json
// or use: import en from "./lang/en.json" assert { type: "json" };

export type Lang = "en" | "fr";
export type I18n = typeof en;

const RESOURCES: Record<Lang, I18n> = { en, fr };

export const pickI18n = (lang: string): I18n =>
  RESOURCES[lang as Lang] || RESOURCES.en;

export const fmt = (s: string, params: Record<string, string | number> = {}) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
