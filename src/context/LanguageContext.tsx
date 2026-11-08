import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  dictionaries,
  type Language,
  type TranslationKey,
} from '../i18n/translations'

/** Replace {name} placeholders in a template with the given values. */
function fill(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  )
}

interface LanguageContextValue {
  lang: Language
  /** BCP-47 locale for Intl/date formatting. */
  locale: string
  toggle: () => void
  setLang: (lang: Language) => void
  /** Translate a key, optionally filling in {placeholders}. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const LOCALES: Record<Language, string> = { th: 'th-TH', en: 'en-GB' }

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Language>('studytrack.lang', 'th')

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      fill(dictionaries[lang][key], vars),
    [lang],
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      locale: LOCALES[lang],
      toggle: () => setLang(lang === 'th' ? 'en' : 'th'),
      setLang,
      t,
    }),
    [lang, setLang, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/** Access translation + language controls from any component. */
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
