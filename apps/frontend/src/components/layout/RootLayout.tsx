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

// Nicht lazy — sofort laden damit kein Flash
import IntroAnimation from '../ui/IntroAnimation'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function RootLayout() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0E8] flex flex-col relative">

      {/* Intro — sofort, kein lazy, kein Flash */}
      {!introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}

      {/* Seite komplett versteckt bis Intro fertig */}
      <div style={{ visibility: introComplete ? 'visible' : 'hidden' }}>
        <BackgroundEffect />
        <ScrollToTop />
        <Header />
        <main className="flex-1 relative z-10">
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </div>
  )
}