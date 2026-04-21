import { useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_KEY = 'cs_session_id'

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function post(url: string, body: object) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

export function useAnalytics() {
  const { pathname } = useLocation()

  useEffect(() => {
    post('/api/track/pageview', {
      path:      pathname,
      referrer:  document.referrer || null,
      sessionId: getSessionId(),
    })
  }, [pathname])

  useEffect(() => {
    const ping = () => post('/api/track/heartbeat', { sessionId: getSessionId() })
    ping()
    const id = setInterval(ping, 30_000)
    return () => clearInterval(id)
  }, [])

  const trackEvent = useCallback((name: string, meta?: Record<string, unknown>) => {
    post('/api/track/event', {
      name,
      path:      window.location.pathname,
      sessionId: getSessionId(),
      meta,
    })
  }, [])

  return { trackEvent }
}
