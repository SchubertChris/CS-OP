// =============================================================================
// THEME UTILITY
//
// Zentraler Einstiegspunkt für alle Theme-Wechsel.
// Wickelt den Wechsel in document.startViewTransition() ein →
// diagonaler Pinsel-Wipe von oben-links nach unten-rechts.
//
// Verwendung:
//   import { applyTheme } from '@/utils/theme'
//   applyTheme('dark')       → Dark Mode
//   applyTheme('light')      → Light Mode
//   applyTheme('ocean')      → Ocean Accent
//   applyTheme('forest')     → Forest Accent
//   applyTheme('rose')       → Rose Accent
//   applyTheme('midnight')   → Midnight (dunkel + blauer Accent)
//   applyTheme('system')     → System-Präferenz (kein theme-* class)
//
// Unterstützte Theme-Klassen (auf <html> gesetzt):
//   .theme-dark       → Dunkler Modus (globale Farb-Tokens überschrieben)
//   .theme-light      → Heller Modus (blockiert system-dark Fallback)
//   .theme-midnight   → Dark + blauer Accent
//   .theme-ocean      → Gold → Blau Accent
//   .theme-forest     → Gold → Grün Accent
//   .theme-rose       → Gold → Rot-Pink Accent
//
// Wipe-Richtung:
//   Dunkel→Hell: polygon von rechts-unten (data-wipe-reverse auf <html>)
//   Hell→Dunkel: polygon von oben-links (default)
// =============================================================================

type ThemeName =
  | 'dark'
  | 'light'
  | 'system'
  | 'midnight'
  | 'ocean'
  | 'forest'
  | 'rose'

const ACCENT_THEMES = ['ocean', 'forest', 'rose', 'midnight'] as const

function isDark(): boolean {
  return document.documentElement.classList.contains('theme-dark')
    || document.documentElement.classList.contains('theme-midnight')
}

function _applyThemeClass(theme: ThemeName) {
  const html = document.documentElement

  // Accent-Klassen immer bereinigen
  ACCENT_THEMES.forEach((t) => html.classList.remove(`theme-${t}`))
  html.removeAttribute('data-wipe-reverse')

  switch (theme) {
    case 'dark':
      html.classList.add('theme-dark')
      html.classList.remove('theme-light')
      break

    case 'light':
      html.classList.remove('theme-dark')
      html.classList.add('theme-light')
      break

    case 'system':
      html.classList.remove('theme-dark', 'theme-light')
      break

    case 'midnight':
      html.classList.add('theme-dark', 'theme-midnight')
      html.classList.remove('theme-light')
      break

    case 'ocean':
    case 'forest':
    case 'rose':
      html.classList.add(`theme-${theme}`)
      break
  }
}

export function applyTheme(theme: ThemeName): void {
  const html = document.documentElement
  const currentlyDark = isDark()

  // Wipe-Richtung: Hell→Dunkel = von oben-links (default)
  //                Dunkel→Hell  = von rechts-unten (reverse)
  const goingLight = (theme === 'light' || theme === 'system') && currentlyDark
  if (goingLight) {
    html.setAttribute('data-wipe-reverse', '')
  }

  if ('startViewTransition' in document) {
    ;(document as Document & { startViewTransition: (fn: () => void) => void })
      .startViewTransition(() => _applyThemeClass(theme))
  } else {
    // Fallback für Firefox < 126 und ältere Browser
    _applyThemeClass(theme)
  }
}

// Hilfsfunktion für appStore.ts / App.tsx (kompatibel mit bestehendem Pattern)
export function applyThemeFromStore(storeTheme: string): void {
  applyTheme(storeTheme as ThemeName)
}

// ─── Kombinierter Switch — Base + Accent gleichzeitig (Sandbox, Settings) ────
//
// Ermöglicht "Ocean Dark" / "Forest Light" etc. in einem Aufruf.
// Erhält den vollen Wipe-Effekt da intern auf startViewTransition aufgebaut.
//
export type BaseMode   = 'light' | 'dark'
export type AccentMode = 'default' | 'ocean' | 'forest' | 'rose' | 'midnight'

function _applyFull(base: BaseMode, accent: AccentMode): void {
  const html = document.documentElement
  html.classList.remove('theme-light', 'theme-dark', 'theme-ocean', 'theme-forest', 'theme-rose', 'theme-midnight')
  html.removeAttribute('data-wipe-reverse')

  if (accent === 'midnight') {
    html.classList.add('theme-midnight')
  } else {
    html.classList.add(base === 'dark' ? 'theme-dark' : 'theme-light')
    if (accent !== 'default') html.classList.add(`theme-${accent}`)
  }
}

export function applyThemeFull(base: BaseMode, accent: AccentMode): void {
  const html = document.documentElement

  // Wipe-Richtung bestimmen (dunkel→hell = reverse)
  const wasDark = isDark()
  const willBeDark = base === 'dark' || accent === 'midnight'
  if (wasDark && !willBeDark) {
    html.setAttribute('data-wipe-reverse', '')
  }

  if ('startViewTransition' in document) {
    ;(document as Document & { startViewTransition: (fn: () => void) => void })
      .startViewTransition(() => _applyFull(base, accent))
  } else {
    _applyFull(base, accent)
  }
}

export function resetTheme(): void {
  document.documentElement.classList.remove(
    'theme-light', 'theme-dark', 'theme-ocean', 'theme-forest', 'theme-rose', 'theme-midnight'
  )
  document.documentElement.removeAttribute('data-wipe-reverse')
}
