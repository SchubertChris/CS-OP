import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import { router } from './router'
import { useAppStore } from './store/appStore'
import { useAuthStore } from './store/authStore'
import { ToastProvider } from './shared/components/Toast/ToastContext'
import { DevGate } from './shared/components/DevGate/DevGate'
import { applyThemeFromStore } from './utils/theme'

export default function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    applyThemeFromStore(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyThemeFromStore('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  // Session-Bootstrap: bei jedem App-Start Cookie server-seitig validieren.
  // isAuthenticated wird NICHT aus localStorage gelesen — nur der Server entscheidet.
  useEffect(() => {
    const { user, setUser, logout, setLoading } = useAuthStore.getState()

    if (!user) {
      setLoading(false)
      return
    }

    if (user.role === 'admin') {
      fetch('/api/admin/me', { credentials: 'include' })
        .then(r => {
          if (r.ok) {
            useAuthStore.setState({ isAuthenticated: true, isLoading: false })
          } else {
            logout()
          }
        })
        .catch(() => logout())
    } else {
      // Hub-User: Cookie-Validierung kommt in Phase 1 (/api/user/me)
      setUser(user)
    }
  }, [])

  return (
    <DevGate>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </DevGate>
  )
}
