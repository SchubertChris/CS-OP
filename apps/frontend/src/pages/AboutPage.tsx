/* ============================================================
   CandleScope — Root Layout
   src/components/layout/RootLayout.tsx
   ============================================================ */
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BackgroundEffect from '../components/ui/BackgroundEffect'
import CookieBanner from '../components/ui/CookieBanner'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F0E8] flex flex-col relative">
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