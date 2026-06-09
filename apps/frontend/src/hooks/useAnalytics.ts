import { useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_KEY  = 'cs_session_id'
const CONSENT_KEY  = 'candlescope-cookie-consent'

/** Custom-Event den CookieBanner nach Akzeptierung dispatcht */
export const CONSENT_EVENT = 'cs:consent-accepted'

/** requestIdleCallback mit 2s-Timeout-Fallback — tracking darf nie den Main-Thread blockieren */
function idle(cb: () => void): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(cb, { timeout: 2000 })
  } else {
    setTimeout(cb, 1)
  }
}

function hasConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === 'accepted' } catch { return false }
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id) }
  return id
}

function post(url: string, body: object): void {
  idle(() =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  )
}

export function useAnalytics() {
  const { pathname } = useLocation()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const trackPageview = useCallback((path: string) => {
    post('/api/track/pageview', {
      path,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
    })
  }, [])

  const startHeartbeat = useCallback(() => {
    if (intervalRef.current) return
    post('/api/track/heartbeat', { sessionId: getSessionId() })
    intervalRef.current = setInterval(() => {
      if (hasConsent()) post('/api/track/heartbeat', { sessionId: getSessionId() })
    }, 30_000)
  }, [])

  // Pageview tracken — nur wenn Consent vorhanden
  useEffect(() => {
    if (!hasConsent()) return
    trackPageview(pathname)
  }, [pathname, trackPageview])

  // Heartbeat starten — nur wenn Consent vorhanden
  useEffect(() => {
    if (!hasConsent()) return
    startHeartbeat()
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }
  }, [startHeartbeat])

  // Consent wird im selben Tab erteilt → sofort aktivieren ohne Reload
  useEffect(() => {
    const onConsent = () => {
      trackPageview(window.location.pathname)
      startHeartbeat()
    }
    window.addEventListener(CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(CONSENT_EVENT, onConsent)
  }, [trackPageview, startHeartbeat])

  const trackEvent = useCallback((name: string, meta?: Record<string, unknown>) => {
    if (!hasConsent()) return
    post('/api/track/event', {
      name,
      path:      window.location.pathname,
      sessionId: getSessionId(),
      meta,
    })
  }, [])

  return { trackEvent }
}
