import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard, SemiAuthGuard, RedirectIfAuth } from './guards'
import { AppShell } from '../layout/AppShell/AppShell'

// Lazy-geladene Seiten
const TokenTestPage      = lazy(() => import('@features/test/TokenTestPage'))
const DashboardPage      = lazy(() => import('@features/dashboard/pages/DashboardPage'))
const DevSandboxPage     = lazy(() => import('@features/dev/DevSandboxPage'))
const LoginPage          = lazy(() => import('@features/auth/pages/LoginPage'))
const RoleSelectorPage   = lazy(() => import('@features/auth/pages/RoleSelectorPage'))

// Noch nicht gebaut — Platzhalter für alle /app/* Routen
const ComingSoon = lazy(() => Promise.resolve({
  default: () => (
    <div style={{
      padding: 'var(--space-10)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: 'var(--space-4)',
      color: 'var(--cs-text-3)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
        In Entwicklung
      </span>
      <p style={{ fontSize: 'var(--text-base)', color: 'var(--cs-text-2)', margin: 0 }}>
        Diese Seite wird in Phase 2 gebaut.
      </p>
    </div>
  ),
}))

function PageFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--cs-bg)',
    }}>
      <div style={{
        width: 24,
        height: 24,
        border: '2px solid var(--cs-border)',
        borderTopColor: 'var(--cs-gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
)

export const router = createBrowserRouter([

  // -------------------------------------------------------------------------
  // DEV TEST-SEITEN — immer zugänglich, kein Auth
  // -------------------------------------------------------------------------
  { path: '/test/tokens', element: wrap(<TokenTestPage />) },
  { path: '/dev',         element: wrap(<DevSandboxPage />) },

  // -------------------------------------------------------------------------
  // APP SHELL — geschützt durch AuthGuard
  // -------------------------------------------------------------------------
  {
    path: '/app',
    element: <AuthGuard><AppShell netWorth="€24.890" notificationCount={3} /></AuthGuard>,
    children: [
      { index: true,              element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard',        element: wrap(<DashboardPage />) },
      // Noch nicht gebaut — Platzhalter:
      { path: 'transactions',     element: wrap(<ComingSoon />) },
      { path: 'accounts',         element: wrap(<ComingSoon />) },
      { path: 'analytics',        element: wrap(<ComingSoon />) },
      { path: 'goals',            element: wrap(<ComingSoon />) },
      { path: 'contracts',        element: wrap(<ComingSoon />) },
      { path: 'banking',          element: wrap(<ComingSoon />) },
      { path: 'banking/consent',  element: wrap(<ComingSoon />) },
      { path: 'archive',          element: wrap(<ComingSoon />) },
      { path: 'postbox',          element: wrap(<ComingSoon />) },
      { path: 'devices',          element: wrap(<ComingSoon />) },
      { path: 'settings',         element: wrap(<ComingSoon />) },
    ],
  },

  // -------------------------------------------------------------------------
  // AUTH-SEITEN
  // -------------------------------------------------------------------------
  { path: '/login',       element: wrap(<RedirectIfAuth><LoginPage /></RedirectIfAuth>) },
  { path: '/role-select', element: wrap(<AuthGuard><RoleSelectorPage /></AuthGuard>) },
  // { path: '/verify-2fa', element: wrap(<SemiAuthGuard><TwoFAVerifyPage /></SemiAuthGuard>) },
  // { path: '/setup-2fa',  element: wrap(<SemiAuthGuard><TwoFASetupPage /></SemiAuthGuard>) },

  // -------------------------------------------------------------------------
  // FALLBACK — Root → Login
  // -------------------------------------------------------------------------
  { path: '/',  element: <Navigate to="/login" replace /> },
  { path: '*',  element: <Navigate to="/login" replace /> },
])

export { AuthGuard, SemiAuthGuard, RedirectIfAuth }
