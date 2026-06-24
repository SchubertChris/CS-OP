import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
})

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  // Safari & Co.: native UI (Scrollbars, Inputs, Formularelemente) sofort passend rendern
  root.style.colorScheme = theme
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = theme === 'dark' ? '#080808' : '#F2EDE2'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('cs-theme') as Theme) || 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('cs-theme', theme)
  }, [theme])

  // Alle offenen Tabs/Fenster sofort mitziehen lassen
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cs-theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setTheme(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = () => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next) // sofort anwenden — nicht erst nach dem Render-Zyklus
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
