/* ============================================================
   CandleScope — Root Layout
   src/components/layout/RootLayout.tsx
   ============================================================ */
import { useState, useEffect, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BackgroundEffect from '../ui/BackgroundEffect'
import CookieBanner from '../ui/CookieBanner'

const IntroAnimation = lazy(() => import('../ui/IntroAnimation'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function RootLayout() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0E8] flex flex-col relative">

      {/* Intro Animation — bei jedem Seitenaufruf */}
      {!introComplete && (
        <Suspense fallback={null}>
          <IntroAnimation onComplete={() => setIntroComplete(true)} />
        </Suspense>
      )}

      <BackgroundEffect />
      <ScrollToTop />
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}