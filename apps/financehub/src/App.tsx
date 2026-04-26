import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import { router } from './router'
import { useAppStore } from './store/appStore'
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

  return (
    <DevGate>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </DevGate>
  )
}
