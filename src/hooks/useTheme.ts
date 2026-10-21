import { useEffect, useState } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'
const readChoice = (): ThemeChoice => { try { const value = localStorage.getItem('cm-theme'); return value === 'light' || value === 'dark' ? value : 'system' } catch { return 'system' } }
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => { const media = window.matchMedia('(prefers-color-scheme: dark)'); const change = () => setSystemDark(media.matches); media.addEventListener('change', change); return () => media.removeEventListener('change', change) }, [])
  const theme = choice === 'system' ? (systemDark ? 'dark' : 'light') : choice
  useEffect(() => { document.documentElement.dataset.theme = theme; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1220' : '#f7f9fc') }, [theme])
  const update = (value: ThemeChoice) => { setChoice(value); try { localStorage.setItem('cm-theme', value) } catch { /* Storage may be unavailable */ } }
  return { theme, choice, update }
}
