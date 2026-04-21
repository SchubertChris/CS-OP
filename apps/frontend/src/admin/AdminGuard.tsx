import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

type Status = 'loading' | 'ok' | 'unauthorized'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => setStatus(r.ok ? 'ok' : 'unauthorized'))
      .catch(() => setStatus('unauthorized'))
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
      </div>
    )
  }

  if (status === 'unauthorized') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
