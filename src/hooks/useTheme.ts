import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark'

/** First-run default: follow the operating system's colour scheme. */
function systemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/**
 * Light/dark theme stored in localStorage. The chosen theme is written to
 * <html data-theme="..."> so the CSS variables in index.css switch palette.
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('studytrack.theme', systemTheme())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1020' : '#4f46e5')
  }, [theme])

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}
