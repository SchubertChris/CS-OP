// ── THEMES ───────────────────────────────────────────────────

export type Theme = 'candlescope' | 'dark' | 'light' | 'ivory' | 'crimson' | 'mono';

// ── FONTS ────────────────────────────────────────────────────

export type FontFamily = 'default' | 'barlow' | 'inter' | 'outfit' | 'syne';

// ── BREAKPOINTS ──────────────────────────────────────────────

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

export const BREAKPOINTS: Record<Breakpoint, number> = {
  sm:  480,
  md:  768,
  lg: 1024,
  xl: 1280,
} as const;

// ── GLOBALE EINSTELLUNGEN ────────────────────────────────────

export interface Settings {
  theme: Theme;
  font: FontFamily;
  fontSize: number;       // 13–18
  blurPx: number;         // 0–200
  zahltag: number;        // 1–31
  autosave: boolean;
  privacyAutoLock: boolean;
  tooltips: boolean;
  userName: string;
  avatarDataUrl: string | null;
  bgImage: string | null;
  bgFit: 'cover' | 'contain' | 'center';
  pwEnabled: boolean;
  pwHash: string;
  storagePath: string | null;
  monthlyIncome: number;
  groupOrder: string[];
  groupAccOrder: Record<string, string[]>;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'candlescope',
  font: 'default',
  fontSize: 15,
  blurPx: 18,
  zahltag: 15,
  autosave: true,
  privacyAutoLock: false,
  tooltips: true,
  userName: '',
  avatarDataUrl: null,
  bgImage: null,
  bgFit: 'cover',
  pwEnabled: false,
  pwHash: '',
  storagePath: null,
  monthlyIncome: 0,
  groupOrder: [],
  groupAccOrder: {},
};
