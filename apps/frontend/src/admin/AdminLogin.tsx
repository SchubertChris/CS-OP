import { useEffect } from 'react'

const HUB_LOGIN = (import.meta.env.VITE_FINANCEHUB_URL as string | undefined)
  ? `${import.meta.env.VITE_FINANCEHUB_URL}/login`
  : 'https://app.candlescope.de/login'

export default function AdminLogin() {
  useEffect(() => {
    window.location.replace(HUB_LOGIN)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cs-bg)',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--cs-text-3)',
    }}>
      Weiterleitung…
    </div>
  )
}
