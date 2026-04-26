import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface GuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading, requiresTwoFA } = useAuthStore()

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiresTwoFA) return <Navigate to="/verify-2fa" replace />

  return <>{children}</>
}

export function SemiAuthGuard({ children }: GuardProps) {
  const { isAuthenticated, requiresTwoFA } = useAuthStore()

  if (isAuthenticated && !requiresTwoFA) return <Navigate to="/app/dashboard" replace />
  if (!requiresTwoFA) return <Navigate to="/login" replace />

  return <>{children}</>
}

export function RedirectIfAuth({ children }: GuardProps) {
  const { isAuthenticated, requiresTwoFA } = useAuthStore()

  if (isAuthenticated && !requiresTwoFA) return <Navigate to="/app/dashboard" replace />

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
