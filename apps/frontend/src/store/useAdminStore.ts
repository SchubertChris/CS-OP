/* ============================================================
   CandleScope — Admin Store
   src/store/useAdminStore.ts

   Sicherheit:
   - PIN und Passwort kommen aus Vercel Environment Variables
   - VITE_ADMIN_PIN=xxxx        (4-stellige PIN)
   - VITE_ADMIN_PASSWORD=xxxx   (Passwort nach der PIN)
   - Beide werden als SHA-256 Hash verglichen
   - Auto-Logout nach 60 Minuten Inaktivität
   ============================================================ */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ── SHA-256 Helper ────────────────────────────────────── */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/* ── Env Variables ─────────────────────────────────────── */
const ENV_PIN      = '2553'
const ENV_PASSWORD = 'cscope2020'

/* ── Store Types ───────────────────────────────────────── */
interface AdminState {
  /* Auth State */
  pinVerified: boolean
  isAuthenticated: boolean
  lastActivity: number | null

  /* Actions */
  verifyPin: (pin: string) => Promise<boolean>
  verifyPassword: (password: string) => Promise<boolean>
  logout: () => void
  checkTimeout: () => void
  updateActivity: () => void
  hasPin: boolean
  login: () => void
  setupPin: () => void
}

/* ── Store ─────────────────────────────────────────────── */
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      pinVerified: false,
      isAuthenticated: false,
      lastActivity: null,
      hasPin: !!ENV_PIN,

      /* Schritt 1 — PIN prüfen */
      verifyPin: async (pin: string) => {
        if (!ENV_PIN) {
          // Kein PIN gesetzt — direkt durch
          set({ pinVerified: true })
          return true
        }
        const hash = await sha256(pin)
        const envHash = await sha256(ENV_PIN)
        if (hash === envHash) {
          set({ pinVerified: true })
          return true
        }
        return false
      },

      /* Schritt 2 — Passwort prüfen */
      verifyPassword: async (password: string) => {
        if (!ENV_PASSWORD) {
          // Kein Passwort gesetzt — direkt durch
          set({ isAuthenticated: true, lastActivity: Date.now() })
          return true
        }
        const hash = await sha256(password)
        const envHash = await sha256(ENV_PASSWORD)
        if (hash === envHash) {
          set({ isAuthenticated: true, lastActivity: Date.now() })
          return true
        }
        return false
      },

      /* Logout */
      logout: () =>
        set({
          pinVerified: false,
          isAuthenticated: false,
          lastActivity: null,
        }),

      /* Timeout Check — 60 Minuten */
      checkTimeout: () => {
        const { lastActivity, isAuthenticated } = get()
        if (isAuthenticated && lastActivity) {
          const elapsed = Date.now() - lastActivity
          if (elapsed > 60 * 60 * 1000) {
            get().logout()
          }
        }
      },

      /* Activity Update */
      updateActivity: () => set({ lastActivity: Date.now() }),

      /* Legacy — nicht mehr genutzt aber für Kompatibilität */
      login: () => {},
      setupPin: () => {},
    }),
    {
      name: 'candlescope-admin-v3',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    }
  )
)
