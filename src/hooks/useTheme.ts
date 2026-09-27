import { useCallback, useEffect, useState } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

/** Values applied before first paint — kept in sync with index.html. */
const metaThemeColor: Record<ResolvedTheme, string> = {
  light: '#f9f7f3',
  dark: '#1b1613',
}

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isPreference(stored)) return stored
  } catch {
    /* private mode / storage blocked — fall through to system */
  }
  return 'system'
}

function apply(resolved: ResolvedTheme, animate: boolean) {
  const root = document.documentElement

  if (animate) {
    root.classList.add('theme-switching')
    window.setTimeout(() => root.classList.remove('theme-switching'), 300)
  }

  root.dataset.theme = resolved

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = metaThemeColor[resolved]
}

/**
 * Three-state theme: explicit light, explicit dark, or follow the OS.
 * The resolved value is written to <html data-theme>, which is the only
 * switch the stylesheet needs — no class juggling, no duplicated palettes.
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [resolved, setResolved] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const initial = readPreference()
    const next = initial === 'system' ? systemTheme() : initial
    setPreferenceState(initial)
    setResolved(next)
    apply(next, false)
  }, [])

  // Follow the OS live while the preference is "system".
  useEffect(() => {
    if (preference !== 'system') return

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const next = systemTheme()
      setResolved(next)
      apply(next, true)
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((next: ThemePreference) => {
    const applied = next === 'system' ? systemTheme() : next

    setPreferenceState(next)
    setResolved(applied)
    apply(applied, true)

    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* preference simply will not persist */
    }
  }, [])

  return { preference, resolved, setPreference }
}
