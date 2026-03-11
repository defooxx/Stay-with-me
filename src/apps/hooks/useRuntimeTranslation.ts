import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const RUNTIME_TRANSLATION_CACHE_KEY = "runtime_translation_cache";

const APP_LANG_TO_TRANSLATE_LANG: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  hi: "hi",
  zh: "zh-CN",
  ja: "ja",
  ar: "ar",
  ne: "ne",
};

function readCache(): Record<string, string> {
  const saved = localStorage.getItem(RUNTIME_TRANSLATION_CACHE_KEY);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, string>) {
  localStorage.setItem(RUNTIME_TRANSLATION_CACHE_KEY, JSON.stringify(cache));
}

async function translateText(text: string, targetLanguage: string) {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLanguage
    )}&dt=t&q=${encodeURIComponent(text)}`
  );

  if (!response.ok) {
    return text;
  }

  const data = await response.json();

  if (!Array.isArray(data?.[0])) {
    return text;
  }

  return data[0].map((chunk: unknown) => {
    if (!Array.isArray(chunk)) {
      return "";
    }

    return typeof chunk[0] === "string" ? chunk[0] : "";
  }).join("") || text;
}

export function useTranslatedText(text: string) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let cancelled = false;

    if (!text || language === "en") {
      setTranslated(text);
      return () => {
        cancelled = true;
      };
    }

    const targetLanguage = APP_LANG_TO_TRANSLATE_LANG[language] || "en";
    const cache = readCache();
    const cacheKey = `${targetLanguage}:${text}`;
    const cached = cache[cacheKey];

    if (cached) {
      setTranslated(cached);
      return () => {
        cancelled = true;
      };
    }

    setTranslated(text);

    const run = async () => {
      try {
        const nextValue = await translateText(text, targetLanguage);

        if (cancelled) {
          return;
        }

        setTranslated(nextValue);
        writeCache({ ...cache, [cacheKey]: nextValue });
      } catch {
        if (!cancelled) {
          setTranslated(text);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [language, text]);

  return translated;
}

export function useTranslatedTexts(texts: string[]) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(texts);
  const textSignature = texts.join("\u241f");

  useEffect(() => {
    let cancelled = false;

    if (language === "en" || texts.length === 0) {
      setTranslated(texts);
      return () => {
        cancelled = true;
      };
    }

    const targetLanguage = APP_LANG_TO_TRANSLATE_LANG[language] || "en";
    const cache = readCache();
    const nextValues = [...texts];
    const missingTexts = Array.from(
      new Set(
        texts.filter((text) => {
          if (!text) {
            return false;
          }

          return !cache[`${targetLanguage}:${text}`];
        })
      )
    );

    texts.forEach((text, index) => {
      const cached = cache[`${targetLanguage}:${text}`];
      nextValues[index] = cached || text;
    });

    setTranslated(nextValues);

    if (missingTexts.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      try {
        const resolvedEntries = await Promise.all(
          missingTexts.map(async (text) => [
            text,
            await translateText(text, targetLanguage),
          ] as const)
        );

        if (cancelled) {
          return;
        }

        const updatedCache = { ...cache };

        resolvedEntries.forEach(([source, value]) => {
          updatedCache[`${targetLanguage}:${source}`] = value;
        });

        writeCache(updatedCache);

        setTranslated(
          texts.map(
            (text) => updatedCache[`${targetLanguage}:${text}`] || text
          )
        );
      } catch {
        if (!cancelled) {
          setTranslated(texts);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [language, textSignature]);

  return translated;
}
