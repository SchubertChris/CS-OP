/* ============================================================
   CandleScope — Admin Auth Store
   src/store/useAdminStore.ts

   Verwaltet Admin-Authentifizierung.
   Phase 1: PIN-basiert (gehashter PIN in localStorage via Zustand persist)
   Phase 2: JWT via NestJS API — Store-Interface bleibt kompatibel
   ============================================================ */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/* ─── Konstanten ───────────────────────────────────────────── */

/** URL-Key der in /admin?key=xxx erwartet wird */
const ADMIN_URL_KEY = import.meta.env.VITE_ADMIN_KEY ?? 'cs2025admin'

/** Auto-Logout nach X Minuten Inaktivität */
const AUTO_LOGOUT_MINUTES = 60

/** Einfaches Hashing für PIN (Phase 1 — kein echtes Crypto nötig) */
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'candlescope-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/* ─── Store Interface ──────────────────────────────────────── */
interface AdminStore {
  isAuthenticated: boolean
  hasPin:          boolean        // Hat der User einen PIN gesetzt?
  lastActivity:    number | null  // Timestamp letzter Aktion

  /* ── Auth Flow ──────────────────────────────────────────── */
  checkUrlKey:     (key: string | null)  => boolean
  setupPin:        (pin: string)         => Promise<void>
  login:           (pin: string)         => Promise<boolean>
  logout:          ()                    => void
  checkSession:    ()                    => void    // Auto-Logout prüfen
  updateActivity:  ()                    => void    // Aktivität registrieren

  /* ── Interne Felder (nicht exponiert) ───────────────────── */
  _pinHash:        string | null
}

/* ─── Store ────────────────────────────────────────────────── */
export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      (set, get) => ({

        /* ── Initial State ──────────────────────────────────── */
        isAuthenticated: false,
        hasPin:          false,
        lastActivity:    null,
        _pinHash:        null,

        /* ── URL-Key prüfen ─────────────────────────────────── */
        checkUrlKey: (key) => {
          return key === ADMIN_URL_KEY
        },

        /* ── PIN erstmals einrichten ────────────────────────── */
        setupPin: async (pin) => {
          if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            throw new Error('PIN muss 4 Ziffern enthalten')
          }
          const hash = await hashPin(pin)
          set(
            { _pinHash: hash, hasPin: true, isAuthenticated: true, lastActivity: Date.now() },
            false,
            'setupPin'
          )
        },

        /* ── Login mit PIN ──────────────────────────────────── */
        login: async (pin) => {
          const { _pinHash } = get()
          if (!_pinHash) return false

          const hash = await hashPin(pin)
          const success = hash === _pinHash

          if (success) {
            set(
              { isAuthenticated: true, lastActivity: Date.now() },
              false,
              'login:success'
            )
          }

          return success
        },

        /* ── Logout ─────────────────────────────────────────── */
        logout: () => {
          set(
            { isAuthenticated: false, lastActivity: null },
            false,
            'logout'
          )
        },

        /* ── Session prüfen (Auto-Logout) ───────────────────── */
        checkSession: () => {
          const { isAuthenticated, lastActivity } = get()
          if (!isAuthenticated || !lastActivity) return

          const minutesSinceActivity = (Date.now() - lastActivity) / 1000 / 60
          if (minutesSinceActivity > AUTO_LOGOUT_MINUTES) {
            set(
              { isAuthenticated: false, lastActivity: null },
              false,
              'autoLogout'
            )
          }
        },

        /* ── Aktivität registrieren ─────────────────────────── */
        updateActivity: () => {
          set({ lastActivity: Date.now() }, false, 'updateActivity')
        },
      }),

      {
        name:    'candlescope-admin',
        version: 1,
        // Nur PIN-Hash und Setup-Status persistieren — nicht den Auth-State
        // → Nach Browser-Neustart muss PIN erneut eingegeben werden
        partialize: (state) => ({
          _pinHash: state._pinHash,
          hasPin:   state.hasPin,
        }),
      }
    ),
    { name: 'AdminStore' }
  )
)

/* ─── Selector Hooks ───────────────────────────────────────── */

/** Ist der Admin eingeloggt? */
export const useIsAdmin = () => useAdminStore(s => s.isAuthenticated)

/** Hat der User einen PIN gesetzt? */
export const useHasPin  = () => useAdminStore(s => s.hasPin)

/** Admin-URL-Key aus ENV */
export const ADMIN_KEY  = ADMIN_URL_KEY