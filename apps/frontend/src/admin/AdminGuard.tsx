/* ============================================================
   CandleScope — Admin Guard
   src/admin/AdminGuard.tsx

   Protected Route Wrapper.
   DEV_BYPASS = true  → direkt durchklickbar (Phase 1)
   DEV_BYPASS = false → echter PIN-Check (Phase 2)
   ============================================================ */

import { Navigate, useSearchParams } from 'react-router-dom'
import { useAdminStore } from '../store/useAdminStore'

/* Auf false setzen wenn echter Auth aktiv sein soll */
const DEV_BYPASS = true

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [searchParams] = useSearchParams()
  const { isAuthenticated, checkUrlKey } = useAdminStore()

  /* DEV: immer durchlassen */
  if (DEV_BYPASS) return <>{children}</>

  /* URL-Key prüfen */
  const key = searchParams.get('key')
  if (!checkUrlKey(key)) {
    return <Navigate to="/" replace />
  }

  /* Auth prüfen */
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}