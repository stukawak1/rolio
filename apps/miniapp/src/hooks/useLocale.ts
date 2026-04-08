import { createContext, useContext } from 'react'
import ru from '../i18n/ru.json'
import en from '../i18n/en.json'

type Locale = 'ru' | 'en'

const translations = { ru, en }

// Simple deep get by dot path: t('chat.inputPlaceholder')
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return path
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : path
}

export interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ru',
  setLocale: () => {},
  t: (key) => key,
})

export function useLocale() {
  return useContext(LocaleContext)
}

export function createTranslator(locale: Locale) {
  return (key: string): string => {
    const dict = translations[locale] as Record<string, unknown>
    return getNestedValue(dict, key)
  }
}
