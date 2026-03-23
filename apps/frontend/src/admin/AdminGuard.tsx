/* ============================================================
   CandleScope — Admin Guard
   src/admin/AdminGuard.tsx
   ============================================================ */

import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminStore } from '../store/useAdminStore'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkTimeout, updateActivity } = useAdminStore()

  /* Timeout bei jedem Render prüfen */
  useEffect(() => {
    checkTimeout()
  }, [checkTimeout])

  /* Activity bei Maus/Tastatur updaten */
  useEffect(() => {
    const handler = () => updateActivity()
    window.addEventListener('mousemove', handler)
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('mousemove', handler)
      window.removeEventListener('keydown', handler)
    }
  }, [updateActivity])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}