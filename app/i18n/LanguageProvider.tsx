"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import english from "./en.json";

export type Language = "th" | "en";
export type Translate = (text: string) => string;
const dictionary: Record<string, string> = english;
const eventName = "spider-lab-language";
const storageKey = "spider-lab-language";
const titles = { th: "ห้องแล็บแมงมุม — คลังสิ่งประดิษฐ์", en: "Spider Lab — The Invention Archive" };
const descriptions = {
  th: "สำรวจสิ่งประดิษฐ์ อุปกรณ์ และพลังของสไปเดอร์แมนทั้ง 3 ยุค ผ่านโมเดลสามมิติและเครื่องติดตามจำลอง",
  en: "Explore Spider-Man gadgets and powers across three cinematic eras with interactive 3D models and a simulated Spider Tracker.",
};
let memoryLanguage: Language = "th";

function snapshot(): Language {
  const query = new URLSearchParams(window.location.search).get("lang");
  if (query === "en" || query === "th") return query;
  try { const stored = localStorage.getItem(storageKey); return stored === "en" || stored === "th" ? stored : memoryLanguage; }
  catch { return memoryLanguage; }
}
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("popstate", callback);
  };
}
function setLanguage(language: Language) {
  memoryLanguage = language;
  try { localStorage.setItem(storageKey, language); } catch { /* Preference still works for this session. */ }
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(eventName));
}
const LanguageContext = createContext<{ language: Language; setLanguage: typeof setLanguage; t: Translate }>({
  language: "th", setLanguage, t: (text) => text,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, snapshot, () => "th" as const);
  const t: Translate = (text) => language === "en" ? dictionary[text] ?? text : text;
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = titles[language];
    for (const [selector, content] of [
      ['meta[name="description"]', descriptions[language]],
      ['meta[property="og:title"]', titles[language]],
      ['meta[property="og:description"]', descriptions[language]],
      ['meta[property="og:locale"]', language === "en" ? "en_US" : "th_TH"],
    ]) document.querySelector(selector)?.setAttribute("content", content);
  }, [language]);
  return <LanguageContext value={{ language, setLanguage, t }}>{children}</LanguageContext>;
}
export const useLanguage = () => useContext(LanguageContext);
