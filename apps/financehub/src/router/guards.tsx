import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface GuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading, requiresTwoFA, user, roleSelected } = useAuthStore()

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiresTwoFA) return <Navigate to="/verify-2fa" replace />
  // Admin muss nach jedem Neuladen die Rollenauswahl treffen
  if (user?.role === 'admin' && !roleSelected) return <Navigate to="/role-select" replace />

  return <>{children}</>
}

export function SemiAuthGuard({ children }: GuardProps) {
  const { isAuthenticated, requiresTwoFA } = useAuthStore()

  if (isAuthenticated && !requiresTwoFA) return <Navigate to="/app/dashboard" replace />
  if (!requiresTwoFA) return <Navigate to="/login" replace />

  return <>{children}</>
}

// Nur Auth prüfen — kein roleSelected-Check (für /role-select selbst)
export function AuthRequired({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RedirectIfAuth({ children }: GuardProps) {
  const { isAuthenticated, requiresTwoFA, user, roleSelected } = useAuthStore()

  if (isAuthenticated && !requiresTwoFA) {
    // Admin ohne Rollenauswahl → immer zum RoleSelector
    if (user?.role === 'admin' && !roleSelected) return <Navigate to="/role-select" replace />
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

function FullPageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--cs-bg)',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '2px solid var(--cs-border)',
        borderTopColor: 'var(--cs-gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}
