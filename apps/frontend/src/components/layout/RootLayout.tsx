/* ============================================================
   CandleScope — Root Layout
   src/components/layout/RootLayout.tsx
   ============================================================ */
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BackgroundEffect from '../ui/BackgroundEffect'
import CookieBanner from '../ui/CookieBanner'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { useAnalytics } from '../../hooks/useAnalytics'

// Nicht lazy — sofort laden damit kein Flash
import IntroAnimation from '../ui/IntroAnimation'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AnalyticsTracker() {
  useAnalytics()
  return null
}

const SESSION_KEY = 'cs_intro_seen'

export default function RootLayout() {
  const [introComplete, setIntroComplete] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1' || navigator.webdriver
  )

  const handleIntroComplete = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setIntroComplete(true)
    // Calendly-Badge & Co. dürfen jetzt erscheinen
    window.dispatchEvent(new Event('cs:intro-done'))
  }

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-[var(--cs-bg)] text-[var(--cs-text)] flex flex-col relative transition-colors duration-300">

      {/* Intro — nur einmal pro Session */}
      {!introComplete && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      {/* Seite komplett versteckt bis Intro fertig */}
      <div style={{ visibility: introComplete ? 'visible' : 'hidden' }}>
        <BackgroundEffect />
        <ScrollToTop />
        <AnalyticsTracker />
        <Header />
        <main className="flex-1 relative z-10">
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </div>
    </ThemeProvider>
  )
}